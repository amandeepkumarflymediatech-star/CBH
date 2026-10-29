import { NextRequest, NextResponse } from 'next/server';
import { getProductsDb, setProductsDb } from '@/lib/products-db';
import { syncProductsToMySQL } from '@/lib/sync-products-mysql';
import { query } from '@/lib/db';
import { autoSaveUploadedImages } from '@/lib/product-image-resolver';
import {
  inspectWorkbook,
  parseWorkbookBuffer,
  generateFastenersExcelTemplate,
} from '@/lib/excel-product-parser';
import { Product } from '@/lib/types';
import {
  createBulkUploadJob,
  getBulkUploadJob,
  getActiveBulkUploadJob,
} from '@/lib/bulk-upload-jobs';
import { executeBackgroundImport } from '@/lib/bulk-upload-worker';

// Force Node.js runtime for XLSX buffer operations & background async tasks
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/products/bulk-upload
 * - If ?jobId=...: Returns the live progress status of the specified background job
 * - If ?action=active: Returns the currently active background import job (if any)
 * - Otherwise: Downloads the official CBH Fasteners Excel Starter Template
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');
    const action = searchParams.get('action');

    // 1. Status check by Job ID
    if (jobId) {
      const job = getBulkUploadJob(jobId);
      if (!job) {
        return NextResponse.json(
          { success: false, error: 'Import job not found or has expired.' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, job });
    }

    // 2. Active job lookup
    if (action === 'active') {
      const job = getActiveBulkUploadJob();
      return NextResponse.json({ success: true, job });
    }

    // 3. Download template
    const templateBuffer = generateFastenersExcelTemplate();

    return new NextResponse(new Uint8Array(templateBuffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition':
          'attachment; filename="CBH_Fasteners_Bulk_Upload_Template.xlsx"',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Failed to handle GET /api/products/bulk-upload:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products/bulk-upload
 * Handles Excel file inspection, live preview (NO DB INSERT), and non-blocking background import
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // A. Multipart Form-Data (Excel File Upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const action = (formData.get('action') as string) || 'import';
      const sheetName = (formData.get('sheetName') as string) || 'all';
      const upsertMode = ((formData.get('upsertMode') as string) || 'merge') as
        | 'merge'
        | 'append'
        | 'replace';
      const defaultImage =
        (formData.get('defaultImage') as string) || '/assets/bolt_zinc.jpg';

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No Excel file provided for upload.' },
          { status: 400 }
        );
      }

      const fileName = file.name || 'fasteners.xlsx';
      const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
      if (!['.xlsx', '.xls', '.csv'].includes(ext)) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Unsupported file format. Please upload an Excel (.xlsx, .xls) or .csv file.',
          },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // ACTION 1: Inspect Workbook sheets & row counts (NO DB WRITE)
      if (action === 'inspect') {
        const inspection = inspectWorkbook(buffer);
        return NextResponse.json({
          success: true,
          fileName,
          fileSize: buffer.length,
          ...inspection,
        });
      }

      // ACTION 2: Fast Preview (capped to top 30 sample rows, NO DB WRITE)
      if (action === 'preview') {
        const inspection = inspectWorkbook(buffer);
        const parseResult = parseWorkbookBuffer(buffer, {
          sheetName: sheetName === 'all' ? undefined : sheetName,
          defaultImage,
          maxPreview: 30,
        });

        // Check which items in preview already exist in DB without mutating DB
        const currentDb = getProductsDb();
        const existingSkus = new Set(currentDb.map((p) => p.sku.toUpperCase()));

        const previewWithMeta = parseResult.products.map((item) => ({
          ...item,
          isExistingSku: existingSkus.has(item.sku.toUpperCase()),
        }));

        return NextResponse.json({
          success: true,
          fileName,
          fileSize: buffer.length,
          inspection,
          selectedSheet: sheetName,
          totalRowsProcessed: parseResult.totalRowsProcessed,
          validCount: parseResult.validCount,
          invalidCount: parseResult.invalidCount,
          preview: previewWithMeta,
        });
      }

      // ACTION 3: Asynchronous Non-blocking Background Import
      const job = createBulkUploadJob({
        fileName,
        fileSizeBytes: buffer.length,
        sheetName,
        upsertMode,
      });

      // Detach and trigger background execution worker (do not await)
      executeBackgroundImport(job.id, buffer, {
        sheetName: sheetName === 'all' ? undefined : sheetName,
        defaultImage,
        upsertMode,
      }).catch((workerErr) => {
        console.error('[bulk-upload] Background worker unhandled error:', workerErr);
      });

      // Return immediate response with jobId so UI never hangs or times out
      return NextResponse.json({
        success: true,
        background: true,
        jobId: job.id,
        job,
        message: `Import started in background for ${fileName}. You can continue using the dashboard while it saves to the database.`,
      });
    }

    // B. Direct JSON Payload (batch array of Product objects)
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const items: Product[] = Array.isArray(body) ? body : body.products;
      const upsertMode = body.upsertMode || 'merge';

      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Products array is required.' },
          { status: 400 }
        );
      }

      const currentDb = getProductsDb();
      let addedCount = 0;
      let updatedCount = 0;
      let nextDb: Product[] = [];

      if (upsertMode === 'replace') {
        const replaceMap = new Map<string, Product>();
        for (const item of items) {
          const upperSku = item.sku.toUpperCase();
          if (replaceMap.has(upperSku)) updatedCount++;
          else addedCount++;
          replaceMap.set(upperSku, item);
        }
        nextDb = Array.from(replaceMap.values());
      } else {
        const mergedMap = new Map<string, Product>();
        currentDb.forEach((p) => {
          if (p.sku) mergedMap.set(p.sku.toUpperCase(), p);
        });

        for (const item of items) {
          const upperSku = item.sku.toUpperCase();
          if (mergedMap.has(upperSku)) {
            const existing = mergedMap.get(upperSku)!;
            mergedMap.set(upperSku, {
              ...existing,
              ...item,
              id: existing.id || item.id || Date.now(),
            });
            updatedCount++;
          } else {
            mergedMap.set(upperSku, {
              ...item,
              id: item.id || Date.now(),
            });
            addedCount++;
          }
        }

        nextDb = Array.from(mergedMap.values());
      }

      setProductsDb(nextDb);

      // Synchronize changes to MySQL products table
      try {
        await syncProductsToMySQL(nextDb, upsertMode as any);
      } catch (dbErr) {
        console.warn('[bulk-upload] MySQL sync warning:', dbErr);
      }

      // Automatically download and save product images locally in background
      autoSaveUploadedImages(items, async (driveId, localPath) => {
        try {
          await query(
            'UPDATE products SET image_url = ? WHERE gdrive_image_url LIKE ?',
            [localPath, `%${driveId}%`]
          );
        } catch (e) {
          console.warn('[bulk-upload] Image auto-save DB update warning:', e);
        }
      }).catch((imgErr) => {
        console.warn('[bulk-upload] Image auto-save background error:', imgErr);
      });

      return NextResponse.json({
        success: true,
        message: `Successfully processed ${items.length} products: ${addedCount} added, ${updatedCount} updated.`,
        stats: {
          totalCatalogCount: nextDb.length,
          importedCount: items.length,
          addedCount,
          updatedCount,
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error:
          'Unsupported content type. Send multipart/form-data with file or application/json with products array.',
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Bulk upload handler error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.message || 'Internal server error during Excel bulk upload.',
      },
      { status: 500 }
    );
  }
}

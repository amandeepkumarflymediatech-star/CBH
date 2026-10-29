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

// Force Node.js runtime for XLSX buffer operations
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/products/bulk-upload
 * Downloads the official CBH Fasteners Excel Starter Template
 */
export async function GET() {
  try {
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
    console.error('Failed to generate fasteners Excel template:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate template' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products/bulk-upload
 * Handles Excel file inspection, live preview, and bulk import
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
      const upsertMode = (formData.get('upsertMode') as string) || 'merge';
      const defaultImage = (formData.get('defaultImage') as string) || '/assets/bolt_zinc.jpg';

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
            error: 'Unsupported file format. Please upload an Excel (.xlsx, .xls) or .csv file.',
          },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // ACTION 1: Inspect Workbook sheets & row counts
      if (action === 'inspect') {
        const inspection = inspectWorkbook(buffer);
        return NextResponse.json({
          success: true,
          fileName,
          fileSize: buffer.length,
          ...inspection,
        });
      }

      // ACTION 2: Preview parsed items before committing
      if (action === 'preview') {
        const inspection = inspectWorkbook(buffer);
        const parseResult = parseWorkbookBuffer(buffer, {
          sheetName: sheetName === 'all' ? undefined : sheetName,
          defaultImage,
          maxPreview: 30,
        });

        // Check which items in preview already exist in DB
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

      // ACTION 3: Import & Commit to Products Catalog
      const parseResult = parseWorkbookBuffer(buffer, {
        sheetName: sheetName === 'all' ? undefined : sheetName,
        defaultImage,
      });

      if (parseResult.products.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error:
              'No valid product items could be parsed from the selected sheet. Please check that Item Name or SKU columns exist.',
          },
          { status: 422 }
        );
      }

      const currentDb = getProductsDb();
      let updatedCount = 0;
      let addedCount = 0;
      let skippedCount = 0;
      let nextDb: Product[] = [];

      if (upsertMode === 'replace') {
        // Replace catalog entirely with newly imported products (deduped by SKU)
        const replaceMap = new Map<string, Product>();
        for (const item of parseResult.products) {
          const upperSku = item.sku.toUpperCase();
          if (replaceMap.has(upperSku)) {
            updatedCount++;
          } else {
            addedCount++;
          }
          replaceMap.set(upperSku, item);
        }
        nextDb = Array.from(replaceMap.values());
      } else if (upsertMode === 'append') {
        // Append only new SKUs; skip duplicates
        const existingSkus = new Set(currentDb.map((p) => p.sku.toUpperCase()));
        const toAdd: Product[] = [];

        for (const item of parseResult.products) {
          const upperSku = item.sku.toUpperCase();
          if (existingSkus.has(upperSku)) {
            skippedCount++;
          } else {
            toAdd.push(item);
            existingSkus.add(upperSku);
            addedCount++;
          }
        }

        nextDb = [...toAdd, ...currentDb];
      } else {
        // 'merge' (default): update existing SKUs, append new ones
        const mergedMap = new Map<string, Product>();
        currentDb.forEach((p) => {
          if (p.sku) mergedMap.set(p.sku.toUpperCase(), p);
        });

        for (const item of parseResult.products) {
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

      // Persist to Central Inventory Database & erpnext cache
      setProductsDb(nextDb);

      // Synchronize changes to MySQL products table
      try {
        await syncProductsToMySQL(nextDb, upsertMode as any);
      } catch (dbErr) {
        console.warn('[bulk-upload] MySQL sync warning:', dbErr);
      }

      // Automatically download and save product images locally in background (multipart Excel branch)
      autoSaveUploadedImages(parseResult.products, async (driveId, localPath) => {
        try {
          await query('UPDATE products SET image_url = ? WHERE gdrive_image_url LIKE ?', [
            localPath,
            `%${driveId}%`,
          ]);
        } catch (e) {
          console.warn('[bulk-upload] Image auto-save DB update warning:', e);
        }
      }).catch((imgErr) => {
        console.warn('[bulk-upload] Image auto-save background error:', imgErr);
      });

      return NextResponse.json({
        success: true,
        message: `Successfully processed ${parseResult.products.length} fasteners: ${addedCount} added, ${updatedCount} updated.`,
        stats: {
          totalCatalogCount: nextDb.length,
          importedCount: parseResult.products.length,
          addedCount,
          updatedCount,
          skippedCount,
          sheetsProcessed: parseResult.sheetNamesProcessed,
        },
        sample: parseResult.products.slice(0, 5),
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

      // Automatically download and save product images locally in background (JSON branch)
      autoSaveUploadedImages(items, async (driveId, localPath) => {
        try {
          await query('UPDATE products SET image_url = ? WHERE gdrive_image_url LIKE ?', [
            localPath,
            `%${driveId}%`,
          ]);
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
        error: 'Unsupported content type. Send multipart/form-data with file or application/json with products array.',
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Bulk upload handler error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error during Excel bulk upload.',
      },
      { status: 500 }
    );
  }
}

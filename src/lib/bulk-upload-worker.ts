import { updateBulkUploadJob } from './bulk-upload-jobs';
import { parseWorkbookBuffer } from './excel-product-parser';
import { getProductsDb, setProductsDb } from './products-db';
import { syncProductsToMySQL } from './sync-products-mysql';
import { autoSaveUploadedImages } from './product-image-resolver';
import { query } from './db';
import { Product } from './types';

export interface BackgroundImportOptions {
  sheetName?: string;
  defaultImage: string;
  upsertMode: 'merge' | 'append' | 'replace';
}

/**
 * Executes Excel workbook parsing and database persistence in the background.
 * Tracks granular progress so the frontend can poll and display real-time status.
 */
export async function executeBackgroundImport(
  jobId: string,
  buffer: Buffer,
  options: BackgroundImportOptions
): Promise<void> {
  try {
    updateBulkUploadJob(jobId, {
      status: 'parsing',
      progressPercent: 10,
      message: 'Reading and parsing Excel worksheet...',
    });

    // 1. Parse Excel buffer
    const parseResult = parseWorkbookBuffer(buffer, {
      sheetName: options.sheetName,
      defaultImage: options.defaultImage,
    });

    if (parseResult.products.length === 0) {
      updateBulkUploadJob(jobId, {
        status: 'failed',
        progressPercent: 0,
        error:
          'No valid product items could be parsed from the selected sheet. Please check headers and content.',
        message: 'No valid products found in spreadsheet.',
      });
      return;
    }

    const totalToProcess = parseResult.products.length;
    updateBulkUploadJob(jobId, {
      status: 'syncing',
      totalRows: totalToProcess,
      progressPercent: 20,
      message: `Parsed ${totalToProcess.toLocaleString()} fasteners. Preparing database sync...`,
    });

    // 2. Merge with current catalog
    const currentDb = getProductsDb();
    let updatedCount = 0;
    let addedCount = 0;
    let skippedCount = 0;
    let nextDb: Product[] = [];

    if (options.upsertMode === 'replace') {
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
    } else if (options.upsertMode === 'append') {
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
      // 'merge' (default)
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

    // 3. Persist to JSON cache
    setProductsDb(nextDb);

    updateBulkUploadJob(jobId, {
      status: 'syncing',
      progressPercent: 30,
      message: `Writing ${nextDb.length.toLocaleString()} products to MySQL database...`,
      addedCount,
      updatedCount,
      skippedCount,
      catalogTotal: nextDb.length,
    });

    // 4. Batch sync to MySQL with live chunk progress
    const syncOk = await syncProductsToMySQL(
      nextDb,
      options.upsertMode,
      (processed, total) => {
        const syncRatio = total > 0 ? processed / total : 1;
        const progressPercent = Math.min(95, Math.round(30 + syncRatio * 65));
        updateBulkUploadJob(jobId, {
          processedRows: processed,
          totalRows: total,
          progressPercent,
          message: `Saving to MySQL: ${processed.toLocaleString()} / ${total.toLocaleString()} rows (${progressPercent}%)`,
        });
      }
    );

    if (!syncOk) {
      console.warn('[executeBackgroundImport] MySQL sync completed with some warnings');
    }

    // 5. Automatically resolve and cache Google Drive images in background
    autoSaveUploadedImages(parseResult.products, async (driveId, localPath) => {
      try {
        await query('UPDATE products SET image_url = ? WHERE gdrive_image_url LIKE ?', [
          localPath,
          `%${driveId}%`,
        ]);
      } catch (e) {
        console.warn('[executeBackgroundImport] Image save DB update warning:', e);
      }
    }).catch((imgErr) => {
      console.warn('[executeBackgroundImport] Image save background error:', imgErr);
    });

    // 6. Complete job
    updateBulkUploadJob(jobId, {
      status: 'completed',
      processedRows: totalToProcess,
      totalRows: totalToProcess,
      progressPercent: 100,
      addedCount,
      updatedCount,
      skippedCount,
      catalogTotal: nextDb.length,
      message: `Import complete: ${addedCount.toLocaleString()} added, ${updatedCount.toLocaleString()} updated. Total in catalog: ${nextDb.length.toLocaleString()}`,
    });
  } catch (err: any) {
    console.error('[executeBackgroundImport] Error:', err);
    updateBulkUploadJob(jobId, {
      status: 'failed',
      error: err.message || 'An unexpected error occurred during import.',
      message: 'Bulk import failed.',
    });
  }
}


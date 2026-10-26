import { NextResponse } from 'next/server';
import { fetchErpNextProducts, getErpNextConfig, saveErpNextConfig } from '@/lib/erpnext';
import { setProductsDb } from '@/lib/products-db';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const config = getErpNextConfig();
    const body = await request.json().catch(() => ({}));

    // If client requested a simulated demo sync (for previewing ERPNext integration before IT gives live keys)
    if (body.simulateDemo) {
      const demoProducts = [
        {
          id: 5001,
          sku: 'ERP-DIN933-M12-100-8.8',
          name: 'Hexagon Head Bolt DIN 933 Gr 8.8 (ERPNext Live)',
          category: 'Hex Screws',
          standard: 'DIN 933',
          grade: '8.8',
          finish: 'Hot Dip Galvanized (HDG)',
          threadType: 'Full Thread',
          diameter: 'M12',
          lengthMm: 100,
          pitchMm: 1.75,
          weightPerPcKg: 0.105,
          pricePerPiece: 18.5,
          originalPricePerPiece: 22.0,
          pricePerKg: 176.19,
          originalPricePerKg: 209.52,
          stockPcs: 45000,
          stockKg: 4725,
          isInStock: true,
          isSurplus: false,
          surplusDiscountPct: 0,
          imageUrl: '/assets/bolt_zinc.jpg',
        },
        {
          id: 5002,
          sku: 'ERP-DIN934-M12-8.8',
          name: 'Hexagon Nut DIN 934 Gr 8.8 (ERPNext Live)',
          category: 'Nuts',
          standard: 'DIN 934',
          grade: '8.8',
          finish: 'Hot Dip Galvanized (HDG)',
          threadType: 'Coarse',
          diameter: 'M12',
          lengthMm: 10,
          pitchMm: 1.75,
          weightPerPcKg: 0.017,
          pricePerPiece: 4.8,
          originalPricePerPiece: 6.0,
          pricePerKg: 282.35,
          originalPricePerKg: 352.94,
          stockPcs: 120000,
          stockKg: 2040,
          isInStock: true,
          isSurplus: false,
          surplusDiscountPct: 0,
          imageUrl: '/assets/bolt_zinc.jpg',
        },
        {
          id: 5003,
          sku: 'ERP-DIN125-M12-SS304',
          name: 'Plain Flat Washer DIN 125 SS 304 (ERPNext Live)',
          category: 'Washers',
          standard: 'DIN 125',
          grade: 'SS 304',
          finish: 'Self Natural',
          threadType: 'Plain',
          diameter: 'M12',
          lengthMm: 2.5,
          pitchMm: 0,
          weightPerPcKg: 0.006,
          pricePerPiece: 2.1,
          originalPricePerPiece: 2.8,
          pricePerKg: 350.0,
          originalPricePerKg: 466.67,
          stockPcs: 85000,
          stockKg: 510,
          isInStock: true,
          isSurplus: false,
          surplusDiscountPct: 0,
          imageUrl: '/assets/bolt_zinc.jpg',
        },
      ];

      setProductsDb(demoProducts as any);
      saveErpNextConfig({
        lastSyncTime: new Date().toISOString(),
        lastSyncStatus: 'CONNECTED',
        syncedItemsCount: demoProducts.length,
      });

      return NextResponse.json({
        success: true,
        message: `Successfully synchronized ${demoProducts.length} items from ERPNext (Demo Mode).`,
        count: demoProducts.length,
        data: demoProducts,
      });
    }

    if (!config.erpnextUrl || !config.apiKey || !config.apiSecret) {
      return NextResponse.json(
        {
          success: false,
          error: 'ERPNext is not configured yet. Please enter your ERPNext Host URL, API Key, and API Secret in the Admin Settings.',
          requiresSetup: true,
        },
        { status: 400 }
      );
    }

    // Live Sync from ERPNext
    const result = await fetchErpNextProducts();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to fetch items from ERPNext',
        },
        { status: 502 }
      );
    }

    // Update memory products database
    if (result.products.length > 0) {
      setProductsDb(result.products);

      // Persist to local cache file for high availability
      try {
        const cacheFile = path.join(process.cwd(), 'src', 'data', 'erpnext-cached-products.json');
        fs.writeFileSync(cacheFile, JSON.stringify(result.products, null, 2), 'utf-8');
      } catch (err) {
        console.error('Could not cache ERPNext products:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully pulled ${result.count} fastener items & stock from ERPNext (${result.serverUrl}).`,
      count: result.count,
      serverUrl: result.serverUrl,
      lastSyncTime: new Date().toISOString(),
      data: result.products.slice(0, 50),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

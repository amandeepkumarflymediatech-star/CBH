import { NextResponse } from 'next/server';
import { getProductsDb, setProductsDb } from '@/lib/products-db';
import { syncProductsToMySQL } from '@/lib/sync-products-mysql';
import { saveErpNextConfig } from '@/lib/erpnext';
import { Product } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    
    // Check webhook payload (frappe sends doc, data, or direct body)
    const doc = body.doc || body.data || body;
    const doctype = doc.doctype || body.doctype || (doc.actual_qty !== undefined ? 'Bin' : 'Item');

    if (doctype === 'Item') {
      const itemCode = (doc.item_code || doc.name || doc.itemCode || '').toUpperCase();
      if (!itemCode) {
        // If Frappe sends a test ping or generic event without item_code, return 200 OK
        // so Frappe Webhook test does not fail with 400 error
        return NextResponse.json({
          success: true,
          message: 'Webhook received. No item_code in payload (ping/test acknowledged).',
        });
      }

      const currentProducts = getProductsDb();
      const existingIdx = currentProducts.findIndex((p) => p.sku === itemCode);

      const weight = doc.weight_per_unit ? Number(doc.weight_per_unit) : 0.06;
      const rate = doc.standard_rate ? Number(doc.standard_rate) : 14.5;
      const pricePerPiece = rate;
      const pricePerKg = weight > 0 ? parseFloat((rate / weight).toFixed(2)) : 145;

      let targetProduct: Product;

      if (existingIdx >= 0) {
        // Update existing item
        currentProducts[existingIdx] = {
          ...currentProducts[existingIdx],
          name: doc.item_name || currentProducts[existingIdx].name,
          category: doc.item_group || currentProducts[existingIdx].category,
          pricePerPiece,
          pricePerKg,
          weightPerPcKg: weight,
        };
        targetProduct = currentProducts[existingIdx];
      } else {
        // Create new item dynamically
        targetProduct = {
          id: Date.now(),
          sku: itemCode,
          name: doc.item_name || itemCode,
          category: doc.item_group || 'Hex Screws',
          standard: doc.custom_standard || 'DIN 933',
          grade: doc.custom_grade || '8.8',
          finish: doc.custom_finish || 'Black Passivated (BP)',
          threadType: 'Full Thread',
          diameter: doc.custom_diameter || 'M10',
          lengthMm: doc.custom_length || 100,
          pitchMm: 1.5,
          weightPerPcKg: weight,
          pricePerPiece,
          pricePerKg,
          stockPcs: 10000,
          stockKg: 10000 * weight,
          isInStock: true,
          imageUrl: doc.image || '/assets/bolt_zinc.jpg',
        };
        currentProducts.unshift(targetProduct);
      }

      setProductsDb(currentProducts);

      // Also persist to MySQL database
      syncProductsToMySQL([targetProduct], 'merge').catch((err) =>
        console.warn('[ERPNext Webhook] MySQL sync warning:', err)
      );

      saveErpNextConfig({
        lastSyncTime: new Date().toISOString(),
        lastSyncStatus: 'CONNECTED',
      });

      return NextResponse.json({
        success: true,
        message: `Webhook processed for Item ${itemCode}. Catalog updated in real-time.`,
        action: existingIdx >= 0 ? 'UPDATED' : 'CREATED',
        sku: itemCode,
      });
    }

    if (doctype === 'Bin') {
      // Stock update
      const itemCode = (doc.item_code || '').toUpperCase();
      const actualQty = Number(doc.actual_qty ?? 0);

      const currentProducts = getProductsDb();
      const existingIdx = currentProducts.findIndex((p) => p.sku === itemCode);
      if (existingIdx >= 0) {
        currentProducts[existingIdx].stockPcs = actualQty;
        currentProducts[existingIdx].stockKg = actualQty * currentProducts[existingIdx].weightPerPcKg;
        currentProducts[existingIdx].isInStock = actualQty > 0;
        setProductsDb(currentProducts);

        // Sync stock to MySQL
        syncProductsToMySQL([currentProducts[existingIdx]], 'merge').catch((err) =>
          console.warn('[ERPNext Webhook] MySQL Bin sync warning:', err)
        );
      }

      return NextResponse.json({
        success: true,
        message: `Stock Bin updated for ${itemCode}: ${actualQty} Pcs in warehouse.`,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Webhook received for DocType: ${doctype}.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getProductsDb, setProductsDb } from '@/lib/products-db';
import { saveErpNextConfig } from '@/lib/erpnext';
import { Product } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    
    // Check webhook payload (frappe sends doc or event data)
    const doc = body.doc || body;
    const doctype = doc.doctype || body.doctype || 'Item';

    if (doctype === 'Item') {
      const itemCode = (doc.item_code || doc.name || '').toUpperCase();
      if (!itemCode) {
        return NextResponse.json({ success: false, error: 'No item_code in webhook payload' }, { status: 400 });
      }

      const currentProducts = getProductsDb();
      const existingIdx = currentProducts.findIndex((p) => p.sku === itemCode);

      const weight = doc.weight_per_unit || 0.06;
      const rate = doc.standard_rate || 14.5;
      const pricePerPiece = rate;
      const pricePerKg = weight > 0 ? parseFloat((rate / weight).toFixed(2)) : 145;

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
      } else {
        // Create new item dynamically
        const newProduct: Product = {
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
        currentProducts.unshift(newProduct);
      }

      setProductsDb(currentProducts);
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
      const actualQty = doc.actual_qty ?? 0;

      const currentProducts = getProductsDb();
      const existingIdx = currentProducts.findIndex((p) => p.sku === itemCode);
      if (existingIdx >= 0) {
        currentProducts[existingIdx].stockPcs = actualQty;
        currentProducts[existingIdx].stockKg = actualQty * currentProducts[existingIdx].weightPerPcKg;
        currentProducts[existingIdx].isInStock = actualQty > 0;
        setProductsDb(currentProducts);
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

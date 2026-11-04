import { query } from './db';
import { Product } from './types';

/**
 * Persists products to MySQL table `products` in batched chunks.
 * Uses ON DUPLICATE KEY UPDATE to merge existing SKUs seamlessly.
 */
export async function syncProductsToMySQL(
  products: Product[],
  mode: 'replace' | 'merge' | 'append' = 'merge',
  onProgress?: (processed: number, total: number) => void
): Promise<boolean> {
  if (!products || products.length === 0) return true;

  try {
    if (mode === 'replace') {
      try {
        await query('DELETE FROM products');
      } catch (delErr) {
        console.warn('[syncProductsToMySQL] Table wipe warning:', delErr);
      }
    }

    const chunkSize = 50;
    for (let i = 0; i < products.length; i += chunkSize) {
      const chunk = products.slice(i, i + chunkSize);
      const rows = chunk.map((p) => {
        const weight = Number.isFinite(Number(p.weightPerPcKg)) && Number(p.weightPerPcKg) > 0 ? Number(p.weightPerPcKg) : 0.06;
        const pricePc = Number.isFinite(Number(p.pricePerPiece)) && Number(p.pricePerPiece) > 0 ? Number(p.pricePerPiece) : 5.0;
        const origPricePc = Number.isFinite(Number(p.originalPricePerPiece)) && Number(p.originalPricePerPiece) > 0 ? Number(p.originalPricePerPiece) : pricePc;
        const priceKg = Number.isFinite(Number(p.pricePerKg)) && Number(p.pricePerKg) > 0 ? Number(p.pricePerKg) : 90.0;
        const origPriceKg = Number.isFinite(Number(p.originalPricePerKg)) && Number(p.originalPricePerKg) > 0 ? Number(p.originalPricePerKg) : priceKg;
        const stockPcs = Math.min(Math.max(0, Math.round(Number(p.stockPcs) || 0)), 2000000000);
        const stockKg = Math.min(Math.max(0, parseFloat(String(p.stockKg || (stockPcs * weight))) || 0), 99999999.99);

        return [
          (p.sku || `SKU-${Date.now()}-${Math.random().toString(36).substring(7)}`).slice(0, 255),
          (p.name || p.sku || 'Industrial Fastener').slice(0, 500),
          (p.category || 'Hex Screws').slice(0, 100),
          (p.subGroup || '').slice(0, 100),
          (p.subCategory || '').slice(0, 150),
          (p.standard || 'DIN 933').slice(0, 100),
          p.din || '',
          p.isoStandard || '',
          p.bsStandard || '',
          p.asmeStandard || '',
          p.grade || '8.8',
          p.finish || 'Black Passivated (BP)',
          p.threadType || 'Full Thread',
          p.threadLength || '',
          p.diameter || 'M10',
          Number(p.lengthMm) || 100,
          Number(p.pitchMm) || 1.5,
          p.sizeFormatted || `${p.diameter || 'M10'}x${p.lengthMm || 100}`,
          weight,
          Number((weight * 1000).toFixed(3)),
          pricePc,
          origPricePc,
          priceKg,
          origPriceKg,
          Number((pricePc * 100).toFixed(2)),
          Number((pricePc * 1000).toFixed(2)),
          p.pcsPerBox || '',
          Number(p.smallBoxWeightKg) || 2.5,
          p.pcsPerMasterCtn || '',
          Number(p.masterCtnWeightKg) || 20.0,
          p.moq || '25 KGS',
          Number(p.leadTimeDays) || 10,
          Number(p.productionDays) || 7,
          Number(p.packingDays) || 3,
          stockPcs,
          stockKg,
          p.stockUom || 'Nos',
          p.isInStock !== false ? 1 : 0,
          p.isSurplus ? 1 : 0,
          Number(p.surplusDiscountPct) || 0,
          p.brand || 'CBH',
          p.hsnCode || '73181500',
          p.imageUrl || '/assets/bolt_zinc.jpg',
          p.drawingUrl || '',
          p.gdriveImageUrl || '',
          p.descriptionHtml || '',
          p.description || p.name || '',
        ];
      });

      await query(
        `INSERT INTO products (
          sku, name, category, sub_group, sub_category, standard, din, iso_standard, bs_standard, asme_standard,
          grade, finish, thread_type, thread_length, diameter, length_mm, pitch_mm, size_formatted,
          weight_per_pc_kg, weight_per_1000_pcs_kg, price_per_piece, original_price_per_piece, price_per_kg, original_price_per_kg,
          price_100_pcs, price_1000_pcs, pcs_per_box, small_box_weight_kg, pcs_per_master_ctn, master_ctn_weight_kg,
          moq, lead_time_days, production_days, packing_days, stock_pcs, stock_kg, stock_uom, is_in_stock,
          is_surplus, surplus_discount_pct, brand, hsn_code, image_url, drawing_url, gdrive_image_url,
          description_html, description
        ) VALUES ?
        ON DUPLICATE KEY UPDATE
          name=VALUES(name),
          category=VALUES(category),
          sub_group=VALUES(sub_group),
          sub_category=VALUES(sub_category),
          standard=VALUES(standard),
          grade=VALUES(grade),
          finish=VALUES(finish),
          diameter=VALUES(diameter),
          length_mm=VALUES(length_mm),
          pitch_mm=VALUES(pitch_mm),
          weight_per_pc_kg=VALUES(weight_per_pc_kg),
          price_per_piece=VALUES(price_per_piece),
          price_per_kg=VALUES(price_per_kg),
          stock_pcs=VALUES(stock_pcs),
          stock_kg=VALUES(stock_kg),
          image_url=VALUES(image_url),
          drawing_url=VALUES(drawing_url)`,
        [rows]
      );

      if (onProgress) {
        try {
          onProgress(Math.min(i + chunkSize, products.length), products.length);
        } catch (progErr) {
          console.warn('[syncProductsToMySQL] onProgress error:', progErr);
        }
      }
    }
    return true;
  } catch (err) {
    console.warn('[syncProductsToMySQL] Error:', err);
    return false;
  }
}


/**
 * CBH FASTENERS - PRODUCT IMAGE ASSET SYNC
 *
 * 1. Fetches all unique Google Drive image URLs from MySQL products
 * 2. Downloads the direct images locally to `public/assets/products/<id>.png`
 * 3. Updates MySQL `products.image_url` to the local path `/assets/products/<id>.png`
 * 4. Syncs `src/data/erpnext-cached-products.json`
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const mysql = require('mysql2/promise');

// Load environment variables
function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const DEST_DIR = path.resolve(__dirname, '..', 'public', 'assets', 'products');
if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

function extractDriveId(url) {
  if (!url) return null;
  const m1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return m1[1];
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return m2[1];
  return null;
}

function downloadFile(id) {
  return new Promise((resolve) => {
    const dest = path.join(DEST_DIR, `${id}.png`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      return resolve({ id, localUrl: `/assets/products/${id}.png`, existing: true, success: true });
    }

    const downloadUrl = `https://lh3.googleusercontent.com/d/${id}=w800`;
    const file = fs.createWriteStream(dest);

    const req = https.get(downloadUrl, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        const redirectUrl = res.headers.location;
        file.close();
        try { fs.unlinkSync(dest); } catch {}
        
        // Follow redirect
        const redirectFile = fs.createWriteStream(dest);
        https.get(redirectUrl, (r2) => {
          if (r2.statusCode !== 200) {
            redirectFile.close();
            try { fs.unlinkSync(dest); } catch {}
            return resolve({ id, localUrl: downloadUrl, success: false, status: r2.statusCode });
          }
          r2.pipe(redirectFile);
          redirectFile.on('finish', () => {
            redirectFile.close(() => {
              resolve({ id, localUrl: `/assets/products/${id}.png`, success: true });
            });
          });
        }).on('error', (err) => {
          redirectFile.close();
          try { fs.unlinkSync(dest); } catch {}
          resolve({ id, localUrl: downloadUrl, success: false, error: err.message });
        });
        return;
      }

      if (res.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(dest); } catch {}
        return resolve({ id, localUrl: downloadUrl, success: false, status: res.statusCode });
      }

      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          const stats = fs.statSync(dest);
          if (stats.size < 500) {
            try { fs.unlinkSync(dest); } catch {}
            return resolve({ id, localUrl: downloadUrl, success: false, error: 'File too small' });
          }
          resolve({ id, localUrl: `/assets/products/${id}.png`, success: true, size: stats.size });
        });
      });
    });

    req.on('error', (err) => {
      file.close();
      try { fs.unlinkSync(dest); } catch {}
      resolve({ id, localUrl: downloadUrl, success: false, error: err.message });
    });

    req.setTimeout(15000, () => {
      req.destroy();
      file.close();
      try { fs.unlinkSync(dest); } catch {}
      resolve({ id, localUrl: downloadUrl, success: false, error: 'Timeout' });
    });
  });
}

// Concurrency pool helper
async function pool(items, concurrency, fn) {
  const results = [];
  const executing = [];
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    if (concurrency <= items.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= concurrency) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(results);
}

async function main() {
  console.log('\n======================================================');
  console.log('   🖼️ CBH FASTENERS - PRODUCT IMAGE SYNC');
  console.log('======================================================\n');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'CBH',
  });

  const [rows] = await conn.query(
    'SELECT DISTINCT gdrive_image_url FROM products WHERE gdrive_image_url != ""'
  );

  console.log(`Found ${rows.length} unique Google Drive image URLs in products.`);

  const idMap = new Map();
  for (const r of rows) {
    const id = extractDriveId(r.gdrive_image_url);
    if (id && !idMap.has(id)) {
      idMap.set(id, r.gdrive_image_url);
    }
  }

  const uniqueIds = Array.from(idMap.keys());
  console.log(`Unique Drive File IDs to process: ${uniqueIds.length}\n`);

  let count = 0;
  const downloadResults = await pool(uniqueIds, 6, async (id) => {
    const res = await downloadFile(id);
    count++;
    if (res.success) {
      process.stdout.write(`   ✓ [${count}/${uniqueIds.length}] Saved ${id} -> ${res.localUrl}\n`);
    } else {
      process.stdout.write(`   ⚠️ [${count}/${uniqueIds.length}] ${id} fallback: ${res.localUrl} (${res.error || res.status})\n`);
    }
    return res;
  });

  const successCount = downloadResults.filter((r) => r.success).length;
  console.log(`\nDownloaded ${successCount} / ${uniqueIds.length} images locally!`);

  // Update MySQL table products
  console.log('\nUpdating products in MySQL...');
  for (const res of downloadResults) {
    const driveUrl = idMap.get(res.id);
    const resolvedUrl = res.localUrl;
    await conn.query(
      'UPDATE products SET image_url = ? WHERE gdrive_image_url = ?',
      [resolvedUrl, driveUrl]
    );
  }

  // Also assign category fallback images for products without custom images
  await conn.query(`
    UPDATE products SET image_url = '/assets/products/1U_Tqo_2VpVxvv1P7BUPGeHXZe2akS68g.png'
    WHERE (image_url = '' OR image_url = '/assets/bolt_zinc.jpg')
      AND (category LIKE '%SOCKET%' OR name LIKE '%SOCKET%')
  `);

  await conn.query(`
    UPDATE products SET image_url = '/assets/products/1ITZ9-R797BC3OIbAZD4utchxvf4eUwRT.png'
    WHERE (image_url = '' OR image_url = '/assets/bolt_zinc.jpg')
      AND (category LIKE '%FLANGE%' OR name LIKE '%FLANGE%')
  `);

  await conn.query(`
    UPDATE products SET image_url = '/assets/products/1cM0hddDO7TQq_s7ceszHilx-XZYgqnHE.png'
    WHERE (image_url = '' OR image_url = '/assets/bolt_zinc.jpg')
      AND (category LIKE '%ROD%' OR name LIKE '%ROD%' OR category LIKE '%HSFG%')
  `);

  console.log('✓ MySQL products table updated with local image paths.');

  // Update JSON Cache
  const cachePath = path.resolve(__dirname, '..', 'src', 'data', 'erpnext-cached-products.json');
  if (fs.existsSync(cachePath)) {
    console.log(`Syncing local cache ${cachePath}...`);
    const [allProducts] = await conn.query('SELECT * FROM products ORDER BY id ASC');
    const cachedProducts = allProducts.map((r) => ({
      id: Number(r.id),
      sku: r.sku,
      name: r.name,
      category: r.category,
      subGroup: r.sub_group,
      subCategory: r.sub_category,
      standard: r.standard,
      din: r.din,
      isoStandard: r.iso_standard,
      bsStandard: r.bs_standard,
      asmeStandard: r.asme_standard,
      grade: r.grade,
      finish: r.finish,
      threadType: r.thread_type,
      threadLength: r.thread_length,
      diameter: r.diameter,
      lengthMm: Number(r.length_mm),
      pitchMm: parseFloat(r.pitch_mm),
      sizeFormatted: r.size_formatted,
      weightPerPcKg: parseFloat(r.weight_per_pc_kg),
      weightPer1000PcsKg: parseFloat(r.weight_per_1000_pcs_kg),
      pricePerPiece: parseFloat(r.price_per_piece),
      originalPricePerPiece: parseFloat(r.original_price_per_piece),
      pricePerKg: parseFloat(r.price_per_kg),
      originalPricePerKg: parseFloat(r.original_price_per_kg),
      price100Pcs: parseFloat(r.price_100_pcs),
      price1000Pcs: parseFloat(r.price_1000_pcs),
      stockPcs: Number(r.stock_pcs),
      stockKg: parseFloat(r.stock_kg),
      stockUom: r.stock_uom,
      isInStock: Boolean(r.is_in_stock),
      isSurplus: Boolean(r.is_surplus),
      surplusDiscountPct: Number(r.surplus_discount_pct),
      moq: r.moq,
      leadTimeDays: Number(r.lead_time_days),
      productionDays: Number(r.production_days),
      packingDays: Number(r.packing_days),
      pcsPerBox: r.pcs_per_box,
      smallBoxWeightKg: parseFloat(r.small_box_weight_kg),
      pcsPerMasterCtn: r.pcs_per_master_ctn,
      masterCtnWeightKg: parseFloat(r.master_ctn_weight_kg),
      brand: r.brand,
      hsnCode: r.hsn_code,
      imageUrl: r.image_url,
      drawingUrl: r.drawing_url,
      gdriveImageUrl: r.gdrive_image_url,
      descriptionHtml: r.description_html,
      description: r.description,
    }));
    fs.writeFileSync(cachePath, JSON.stringify(cachedProducts, null, 2), 'utf8');
    console.log(`✓ JSON cache successfully updated with ${cachedProducts.length} items!`);
  }

  await conn.end();
  console.log('\n🎉 Product images sync complete!\n');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});


/**
 * CBH FASTENERS - EXCEL WORKBOOK PRODUCT IMPORTER
 *
 * Imports products from `src/data/BOLTS.xlsx` (or custom path)
 * into both `src/data/erpnext-cached-products.json` and MySQL `products` table.
 *
 * Usage:
 *   node scripts/import-excel-products.js --sheet "ANTI THEFT BOLT"
 *   node scripts/import-excel-products.js --all
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Parse .env
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

const XLSX = require('xlsx');

// Command line arguments
const args = process.argv.slice(2);
let targetSheet = 'ANTI THEFT BOLT'; // Default to the sheet specified in user's Google Sheets link
let importAll = false;
let upsertMode = 'merge'; // 'replace' | 'merge'

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--all') importAll = true;
  if (args[i] === '--sheet' && args[i + 1]) targetSheet = args[i + 1];
  if (args[i] === '--replace') upsertMode = 'replace';
  if (args[i] === '--merge') upsertMode = 'merge';
}

const EXCEL_FILE = path.resolve(__dirname, '..', 'src', 'data', 'BOLTS.xlsx');
const CACHE_FILE = path.resolve(__dirname, '..', 'src', 'data', 'erpnext-cached-products.json');

const VALID_PRODUCT_SHEETS = [
  'ANTI THEFT BOLT',
  'ALLEN BOLT',
  'FLANGE BOLT',
  'CARRIAGE BOLT',
  'CSK ALLEN SCREW',
  'COLLAR BUTTON SCREW',
  'HEX BOLT MM',
  'HEX BOLT INCHS',
  'GRUB SCREW',
  'HSFG',
  'ROOFING BOLT',
  'SOCKET BUTTON SCREW',
  'THREAD ROD',
  'WING SCREW',
];

function generateItemCode(name, idx) {
  if (!name) return `CBH-SKU-${Date.now()}-${idx}`;
  const clean = name
    .toUpperCase()
    .replace(/GRADE\s*/gi, 'G')
    .replace(/FULL THREAD/gi, 'FT')
    .replace(/HALF THREAD/gi, 'HT')
    .replace(/[^A-Z0-9.\-/]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 75);
  return clean ? `CBH-${clean}` : `CBH-FASTENER-${Date.now()}-${idx}`;
}

function parseSheetRows(ws, sheetName) {
  const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1 });
  if (!rawRows || rawRows.length < 3) return [];

  const headerRow = rawRows[1] || [];
  const headerMap = {};
  headerRow.forEach((h, idx) => {
    if (h) headerMap[String(h).trim().toLowerCase().replace(/[^a-z0-9]/g, '')] = idx;
  });

  const products = [];
  const dataRows = rawRows.slice(2);

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rawName = row[7] || (headerMap['itemname'] !== undefined ? row[headerMap['itemname']] : null);
    const name = String(rawName || '').trim();
    if (!name || name === '0' || name === '#REF!' || name === '#N/A' || name.toLowerCase() === 'item name') continue;

    // SKU
    let sku = String(row[6] || '').trim();
    if (!sku || sku === '0' || sku === '#REF!') {
      sku = generateItemCode(name, products.length + 1);
    }

    const subGroup = String(row[1] || 'BOLTS').trim();
    const category = String(row[2] || sheetName).trim();
    const subCategory = String(row[3] || category).trim();
    const standard = String(row[8] || 'DIN 933').trim();
    const din = String(row[8] || '').trim();
    const isoStandard = String(row[9] || '').trim();
    const bsStandard = String(row[17] || '').trim();
    const asmeStandard = String(row[16] || '').trim();
    const grade = String(row[26] || 'GRADE 5.6').trim();
    const finish = String(row[31] || 'SELF').trim();
    const threadLength = String(row[4] || 'HALF THREAD').trim();
    const threadType = String(row[25] || threadLength || 'Full Thread').trim();
    const diameter = String(row[22] || 'M10').trim();
    const pitchMm = parseFloat(row[23]) || 1.5;
    const lengthRaw = row[24];
    const lengthMm = parseInt(String(lengthRaw).replace(/[^0-9]/g, '')) || 0;
    const sizeFormatted = `${diameter}x${pitchMm}x${lengthMm}`;

    const weightPerPcKg = parseFloat(row[30]) || 0.05;
    const weightPer1000PcsKg = +(weightPerPcKg * 1000).toFixed(3);

    // Pricing
    const p1000 = parseFloat(row[137]);
    const p100 = parseFloat(row[136]);
    const pPc = parseFloat(row[43]);
    let pricePerPiece = 5.0;
    if (!isNaN(p1000) && p1000 > 0) pricePerPiece = +(p1000 / 1000).toFixed(4);
    else if (!isNaN(p100) && p100 > 0) pricePerPiece = +(p100 / 100).toFixed(4);
    else if (!isNaN(pPc) && pPc > 0) pricePerPiece = +pPc.toFixed(4);

    const pricePerKg = parseFloat(row[80]) || (weightPerPcKg > 0 ? +(pricePerPiece / weightPerPcKg).toFixed(2) : 90.0);
    let stockPcs = 10000;
    if (row[106] !== undefined && row[106] !== null && String(row[106]).trim() !== '') {
      const parsedStock = parseFloat(String(row[106]));
      if (!isNaN(parsedStock)) stockPcs = parsedStock > 0 ? Math.round(parsedStock) : 0;
    }
    if (stockPcs > 2000000000) stockPcs = 2000000000;
    const stockKg = +(Math.min(99999999.99, Math.max(0, stockPcs * weightPerPcKg))).toFixed(2);

    const pcsPerBox = String(row[60] || '').trim();
    const pcsPerMasterCtn = String(row[63] || '').trim();
    const moq = String(row[69] || '25 KGS').trim();

    const gdriveImageUrl = String(row[73] || '').trim();
    const drawingUrl = String(row[74] || '').trim();

    let imageUrl = '/assets/bolt_zinc.jpg';
    const driveMatch = gdriveImageUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || gdriveImageUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      const driveId = driveMatch[1];
      const localFile = path.resolve(__dirname, '..', 'public', 'assets', 'products', `${driveId}.png`);
      if (fs.existsSync(localFile)) {
        imageUrl = `/assets/products/${driveId}.png`;
      } else {
        imageUrl = `https://lh3.googleusercontent.com/d/${driveId}=w800`;
      }
    } else if (gdriveImageUrl.startsWith('http')) {
      imageUrl = gdriveImageUrl;
    } else {
      const cat = (category + ' ' + name).toLowerCase();
      if (cat.includes('grub')) imageUrl = '/files/grub-screw-din916.png';
      else if (cat.includes('socket') || cat.includes('allen') || cat.includes('csk')) imageUrl = '/assets/products/1U_Tqo_2VpVxvv1P7BUPGeHXZe2akS68g.png';
      else if (cat.includes('flange')) imageUrl = '/assets/products/1ITZ9-R797BC3OIbAZD4utchxvf4eUwRT.png';
      else if (cat.includes('rod') || cat.includes('hsfg')) imageUrl = '/assets/products/1cM0hddDO7TQq_s7ceszHilx-XZYgqnHE.png';
    }

    products.push({
      id: Date.now() + products.length,
      sku,
      name,
      subGroup,
      category,
      subCategory,
      standard,
      din,
      isoStandard,
      bsStandard,
      asmeStandard,
      grade,
      finish,
      threadType,
      threadLength,
      diameter,
      lengthMm,
      pitchMm,
      sizeFormatted,
      weightPerPcKg,
      weightPer1000PcsKg,
      pricePerPiece,
      originalPricePerPiece: pricePerPiece,
      pricePerKg,
      originalPricePerKg: pricePerKg,
      price100Pcs: +(pricePerPiece * 100).toFixed(2),
      price1000Pcs: +(pricePerPiece * 1000).toFixed(2),
      pcsPerBox,
      smallBoxWeightKg: 2.5,
      pcsPerMasterCtn,
      masterCtnWeightKg: 20.0,
      moq,
      leadTimeDays: 10,
      productionDays: 7,
      packingDays: 3,
      stockPcs,
      stockKg,
      stockUom: 'Nos',
      isInStock: stockPcs > 0,
      isSurplus: false,
      surplusDiscountPct: 0,
      brand: 'CBH',
      hsnCode: '73181500',
      imageUrl,
      drawingUrl,
      gdriveImageUrl,
      descriptionHtml: '',
      description: name,
    });
  }

  return products;
}

async function runImport() {
  console.log('\n======================================================');
  console.log('   📦 CBH FASTENERS - EXCEL PRODUCT IMPORTER');
  console.log('======================================================\n');

  if (!fs.existsSync(EXCEL_FILE)) {
    console.error(`❌ Excel file not found at ${EXCEL_FILE}`);
    process.exit(1);
  }

  console.log(`📖 Loading ${EXCEL_FILE}...`);
  const wb = XLSX.readFile(EXCEL_FILE);

  let sheetsToProcess = [];
  if (importAll) {
    sheetsToProcess = wb.SheetNames.filter((name) => VALID_PRODUCT_SHEETS.includes(name));
  } else {
    if (!wb.Sheets[targetSheet]) {
      console.error(`❌ Target sheet "${targetSheet}" not found in workbook!`);
      console.log('Available sheets:', wb.SheetNames);
      process.exit(1);
    }
    sheetsToProcess = [targetSheet];
  }

  console.log(`Processing sheets: ${sheetsToProcess.join(', ')}...`);

  let allParsed = [];
  for (const sheetName of sheetsToProcess) {
    const sheetProducts = parseSheetRows(wb.Sheets[sheetName], sheetName);
    console.log(`   ✓ "${sheetName}": parsed ${sheetProducts.length} products`);
    allParsed.push(...sheetProducts);
  }

  console.log(`\nTotal products parsed: ${allParsed.length}`);

  // Deduplicate by SKU
  const skuMap = new Map();
  allParsed.forEach((p) => {
    skuMap.set(p.sku.toUpperCase(), p);
  });
  const uniqueProducts = Array.from(skuMap.values());
  console.log(`Unique SKUs: ${uniqueProducts.length}`);

  // 1. Write to JSON cache
  console.log(`\n💾 Updating local JSON cache (${CACHE_FILE})...`);
  let finalProducts = [];
  if (upsertMode === 'replace') {
    finalProducts = uniqueProducts;
  } else {
    let existing = [];
    if (fs.existsSync(CACHE_FILE)) {
      try {
        existing = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      } catch {}
    }
    const mergedMap = new Map();
    existing.forEach((p) => mergedMap.set(p.sku.toUpperCase(), p));
    uniqueProducts.forEach((p) => mergedMap.set(p.sku.toUpperCase(), p));
    finalProducts = Array.from(mergedMap.values());
  }

  fs.writeFileSync(CACHE_FILE, JSON.stringify(finalProducts, null, 2), 'utf8');
  console.log(`✓ JSON cache updated. Total products in catalog: ${finalProducts.length}`);

  // 2. Sync to MySQL database
  const connectionConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cbh_fasteners',
  };

  console.log(`\n📡 Connecting to MySQL database \`${connectionConfig.database}\`...`);
  let conn;
  try {
    conn = await mysql.createConnection(connectionConfig);
    console.log('✓ Connected to MySQL.');

    if (upsertMode === 'replace') {
      console.log('Clearing existing products in MySQL...');
      await conn.query('DELETE FROM products');
    }

    console.log(`Inserting/upserting ${uniqueProducts.length} products into MySQL...`);
    const chunkSize = 150;
    for (let i = 0; i < uniqueProducts.length; i += chunkSize) {
      const chunk = uniqueProducts.slice(i, i + chunkSize);
      const rows = chunk.map((p) => [
        p.sku,
        p.name,
        p.category,
        p.subGroup,
        p.subCategory,
        p.standard,
        p.din,
        p.isoStandard,
        p.bsStandard,
        p.asmeStandard,
        p.grade,
        p.finish,
        p.threadType,
        p.threadLength,
        p.diameter,
        p.lengthMm,
        p.pitchMm,
        p.sizeFormatted,
        p.weightPerPcKg,
        p.weightPer1000PcsKg,
        p.pricePerPiece,
        p.originalPricePerPiece,
        p.pricePerKg,
        p.originalPricePerKg,
        p.price100Pcs,
        p.price1000Pcs,
        p.pcsPerBox,
        p.smallBoxWeightKg,
        p.pcsPerMasterCtn,
        p.masterCtnWeightKg,
        p.moq,
        p.leadTimeDays,
        p.productionDays,
        p.packingDays,
        p.stockPcs,
        p.stockKg,
        p.stockUom,
        p.isInStock ? 1 : 0,
        p.isSurplus ? 1 : 0,
        p.surplusDiscountPct,
        p.brand,
        p.hsnCode,
        p.imageUrl,
        p.drawingUrl,
        p.gdriveImageUrl,
        p.descriptionHtml,
        p.description,
      ]);

      await conn.query(
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
    }

    const [countRows] = await conn.query('SELECT COUNT(*) as total FROM products');
    console.log(`✓ MySQL products table successfully updated! Current total rows: ${countRows[0].total}`);
  } catch (dbErr) {
    console.warn('⚠️ MySQL connection/query warning (app will use JSON cache):', dbErr.message);
  } finally {
    if (conn) await conn.end();
  }

  console.log('\n======================================================');
  console.log(`🎉 [SUCCESS] Imported ${uniqueProducts.length} products!`);
  console.log('======================================================\n');
}

runImport().catch((err) => {
  console.error('Import fatal error:', err);
  process.exit(1);
});


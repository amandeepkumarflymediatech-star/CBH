/**
 * CBH FASTENERS - BULLETPROOF SAFE ALTER TABLE MIGRATION
 * 
 * Safely updates MySQL tables to add all Excel sheet columns
 * Uses information_schema checks so that running this on LIVE
 * NEVER causes "Duplicate column name", "Table already exists", or syntax errors.
 * 
 * Usage:
 *   node scripts/alter-tables.js
 */

const fs = require('fs');
const path = require('path');

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

const mysql = require('mysql2/promise');

async function safeAddColumn(connection, database, table, column, definition) {
  const [rows] = await connection.query(`
    SELECT COLUMN_NAME 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
  `, [database, table, column]);

  if (rows.length === 0) {
    console.log(`  + ADDING column [${column}] to table [${table}]...`);
    await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    return true;
  } else {
    // Column already exists - skip safely
    return false;
  }
}

async function safeAddIndex(connection, database, table, indexName, indexDefinition) {
  const [rows] = await connection.query(`
    SELECT INDEX_NAME 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?
  `, [database, table, indexName]);

  if (rows.length === 0) {
    console.log(`  + ADDING index [${indexName}] on [${table}]...`);
    await connection.query(`ALTER TABLE \`${table}\` ADD INDEX \`${indexName}\` ${indexDefinition}`);
    return true;
  } else {
    return false;
  }
}

async function main() {
  console.log('\n======================================================');
  console.log(' CBH FASTENERS - BULLETPROOF SAFE ALTER TABLE RUNNER');
  console.log('======================================================\n');

  let host = process.env.DB_HOST || 'localhost';
  let port = Number(process.env.DB_PORT) || 3306;
  let user = process.env.DB_USER || 'root';
  let password = process.env.DB_PASSWORD || '';
  let targetDb = process.env.DB_NAME || 'CBH';

  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl && (databaseUrl.startsWith('mysql://') || databaseUrl.startsWith('mysql2://'))) {
    const raw = databaseUrl.replace(/^mysql2?:\/\//, '');
    const atIndex = raw.lastIndexOf('@');
    if (atIndex !== -1) {
      const userPassPart = raw.slice(0, atIndex);
      const hostDbPart = raw.slice(atIndex + 1);

      const colonIdx = userPassPart.indexOf(':');
      if (colonIdx !== -1) {
        user = decodeURIComponent(userPassPart.slice(0, colonIdx)) || user;
        password = decodeURIComponent(userPassPart.slice(colonIdx + 1));
      }

      const slashIdx = hostDbPart.indexOf('/');
      const hostPortPart = slashIdx !== -1 ? hostDbPart.slice(0, slashIdx) : hostDbPart;
      const dbPart = slashIdx !== -1 ? hostDbPart.slice(slashIdx + 1).split('?')[0] : '';
      if (dbPart) targetDb = dbPart;

      const hostColonIdx = hostPortPart.indexOf(':');
      if (hostColonIdx !== -1) {
        host = hostPortPart.slice(0, hostColonIdx);
        port = Number(hostPortPart.slice(hostColonIdx + 1)) || port;
      } else {
        host = hostPortPart;
      }
    }
  }

  if (host === 'root') host = '127.0.0.1';

  console.log(`📡 Connecting to MySQL database [${targetDb}] at [${host}:${port}]...`);

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database: targetDb,
    multipleStatements: true,
  });

  console.log('✓ Successfully connected to MySQL.\n');

  // ==========================================================================
  // 1. ALTER TABLE: `products` (All Excel Attributes)
  // ==========================================================================
  console.log('🔍 Checking `products` table for missing Excel columns...');

  const productColumns = [
    { name: 'sub_group', def: 'VARCHAR(100) DEFAULT NULL' },
    { name: 'category', def: 'VARCHAR(100) DEFAULT NULL' },
    { name: 'sub_category', def: 'VARCHAR(150) DEFAULT NULL' },
    { name: 'din', def: 'VARCHAR(50) DEFAULT NULL' },
    { name: 'iso_standard', def: 'VARCHAR(50) DEFAULT NULL' },
    { name: 'bs_standard', def: 'VARCHAR(50) DEFAULT NULL' },
    { name: 'asme_standard', def: 'VARCHAR(50) DEFAULT NULL' },
    { name: 'thread_length', def: 'VARCHAR(50) DEFAULT NULL' },
    { name: 'size_formatted', def: 'VARCHAR(100) DEFAULT NULL' },
    { name: 'weight_per_1000_pcs_kg', def: 'DECIMAL(10, 4) DEFAULT NULL' },
    { name: 'price_100_pcs', def: 'DECIMAL(10, 2) DEFAULT NULL' },
    { name: 'price_1000_pcs', def: 'DECIMAL(10, 2) DEFAULT NULL' },
    { name: 'pcs_per_box', def: 'VARCHAR(50) DEFAULT NULL' },
    { name: 'small_box_weight_kg', def: 'DECIMAL(6, 2) DEFAULT 2.50' },
    { name: 'pcs_per_master_ctn', def: 'VARCHAR(50) DEFAULT NULL' },
    { name: 'master_ctn_weight_kg', def: 'DECIMAL(6, 2) DEFAULT 20.00' },
    { name: 'moq', def: 'VARCHAR(50) DEFAULT "25 KGS"' },
    { name: 'lead_time_days', def: 'INT DEFAULT 10' },
    { name: 'production_days', def: 'INT DEFAULT 7' },
    { name: 'packing_days', def: 'INT DEFAULT 3' },
    { name: 'stock_uom', def: 'VARCHAR(20) DEFAULT "Nos"' },
    { name: 'brand', def: 'VARCHAR(100) DEFAULT "CBH"' },
    { name: 'hsn_code', def: 'VARCHAR(20) DEFAULT "73181500"' },
    { name: 'drawing_url', def: 'TEXT DEFAULT NULL' },
    { name: 'gdrive_image_url', def: 'TEXT DEFAULT NULL' },
    { name: 'description_html', def: 'LONGTEXT DEFAULT NULL' },
    { name: 'description', def: 'TEXT DEFAULT NULL' },
  ];

  let addedCount = 0;
  for (const col of productColumns) {
    const added = await safeAddColumn(connection, targetDb, 'products', col.name, col.def);
    if (added) addedCount++;
  }
  console.log(`✓ Products table verification complete: ${addedCount} columns added, ${productColumns.length - addedCount} already up to date.\n`);

  // Add indexes for Excel fields if missing
  console.log('🔍 Checking `products` performance indexes...');
  await safeAddIndex(connection, targetDb, 'products', 'idx_products_sub_group', '(sub_group)');
  await safeAddIndex(connection, targetDb, 'products', 'idx_products_din', '(din)');
  await safeAddIndex(connection, targetDb, 'products', 'idx_products_iso', '(iso_standard)');
  await safeAddIndex(connection, targetDb, 'products', 'idx_products_hsn', '(hsn_code)');
  console.log('✓ Products indexes verified.\n');

  // ==========================================================================
  // 2. ALTER TABLE: `orders` & `bulk_rfqs` (ERPNext & Commercial Tracking)
  // ==========================================================================
  console.log('🔍 Checking `orders` and `bulk_rfqs` tables...');
  await safeAddColumn(connection, targetDb, 'orders', 'erpnext_sales_order_id', 'VARCHAR(100) DEFAULT NULL');
  await safeAddColumn(connection, targetDb, 'orders', 'company_name', 'VARCHAR(200) DEFAULT NULL');
  await safeAddColumn(connection, targetDb, 'orders', 'customer_name', 'VARCHAR(150) DEFAULT NULL');

  await safeAddColumn(connection, targetDb, 'bulk_rfqs', 'erpnext_quote_id', 'VARCHAR(100) DEFAULT NULL');
  await safeAddColumn(connection, targetDb, 'bulk_rfqs', 'erpnext_sales_order_id', 'VARCHAR(100) DEFAULT NULL');
  console.log('✓ Orders and RFQs verification complete.\n');

  // ==========================================================================
  // 3. CREATE TABLE: `blogs` (Engineering Knowledge Base)
  // ==========================================================================
  console.log('🔍 Checking `blogs` table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`blogs\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`slug\` VARCHAR(150) UNIQUE NOT NULL,
      \`title\` VARCHAR(255) NOT NULL,
      \`excerpt\` TEXT NOT NULL,
      \`content\` LONGTEXT NOT NULL,
      \`category\` VARCHAR(100) NOT NULL,
      \`read_time\` VARCHAR(50) DEFAULT '5 min read',
      \`publish_date\` VARCHAR(50) NOT NULL,
      \`author\` VARCHAR(100) NOT NULL,
      \`image_url\` TEXT,
      \`is_featured\` BOOLEAN DEFAULT FALSE,
      \`status\` VARCHAR(20) DEFAULT 'PUBLISHED',
      \`views\` INT DEFAULT 0,
      \`tags\` JSON,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX \`idx_blogs_slug\` (\`slug\`),
      INDEX \`idx_blogs_category\` (\`category\`),
      INDEX \`idx_blogs_status\` (\`status\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✓ Blogs table verified.\n');

  // ==========================================================================
  // 4. SEED PRODUCTS: Populate MySQL products table from erpnext-cached-products.json
  // ==========================================================================
  const cachePath = path.resolve(__dirname, '..', 'src', 'data', 'erpnext-cached-products.json');
  if (fs.existsSync(cachePath)) {
    const productsData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    console.log(`📦 Found ${productsData.length} cached items. Syncing into MySQL products table...`);

    let inserted = 0;
    let updated = 0;

    for (const p of productsData) {
      const sql = `
        INSERT INTO \`products\` (
          \`sku\`, \`name\`, \`sub_group\`, \`category\`, \`sub_category\`,
          \`standard\`, \`din\`, \`iso_standard\`, \`bs_standard\`, \`asme_standard\`,
          \`diameter\`, \`length_mm\`, \`pitch_mm\`, \`size_formatted\`,
          \`thread_length\`, \`thread_type\`, \`grade\`, \`finish\`,
          \`weight_per_pc_kg\`, \`weight_per_1000_pcs_kg\`,
          \`price_per_piece\`, \`original_price_per_piece\`,
          \`price_per_kg\`, \`original_price_per_kg\`,
          \`price_100_pcs\`, \`price_1000_pcs\`,
          \`pcs_per_box\`, \`small_box_weight_kg\`,
          \`pcs_per_master_ctn\`, \`master_ctn_weight_kg\`,
          \`moq\`, \`lead_time_days\`, \`production_days\`, \`packing_days\`,
          \`stock_pcs\`, \`stock_kg\`, \`stock_uom\`,
          \`brand\`, \`hsn_code\`, \`drawing_url\`, \`gdrive_image_url\`,
          \`image_url\`, \`description_html\`, \`description\`,
          \`is_in_stock\`, \`is_surplus\`, \`surplus_discount_pct\`
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?,
          ?, ?,
          ?, ?,
          ?, ?,
          ?, ?,
          ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?
        )
        ON DUPLICATE KEY UPDATE
          \`name\` = VALUES(\`name\`),
          \`sub_group\` = VALUES(\`sub_group\`),
          \`category\` = VALUES(\`category\`),
          \`sub_category\` = VALUES(\`sub_category\`),
          \`standard\` = VALUES(\`standard\`),
          \`din\` = VALUES(\`din\`),
          \`iso_standard\` = VALUES(\`iso_standard\`),
          \`bs_standard\` = VALUES(\`bs_standard\`),
          \`asme_standard\` = VALUES(\`asme_standard\`),
          \`diameter\` = VALUES(\`diameter\`),
          \`length_mm\` = VALUES(\`length_mm\`),
          \`pitch_mm\` = VALUES(\`pitch_mm\`),
          \`size_formatted\` = VALUES(\`size_formatted\`),
          \`thread_length\` = VALUES(\`thread_length\`),
          \`thread_type\` = VALUES(\`thread_type\`),
          \`grade\` = VALUES(\`grade\`),
          \`finish\` = VALUES(\`finish\`),
          \`weight_per_pc_kg\` = VALUES(\`weight_per_pc_kg\`),
          \`weight_per_1000_pcs_kg\` = VALUES(\`weight_per_1000_pcs_kg\`),
          \`price_per_piece\` = VALUES(\`price_per_piece\`),
          \`original_price_per_piece\` = VALUES(\`original_price_per_piece\`),
          \`price_per_kg\` = VALUES(\`price_per_kg\`),
          \`original_price_per_kg\` = VALUES(\`original_price_per_kg\`),
          \`price_100_pcs\` = VALUES(\`price_100_pcs\`),
          \`price_1000_pcs\` = VALUES(\`price_1000_pcs\`),
          \`pcs_per_box\` = VALUES(\`pcs_per_box\`),
          \`small_box_weight_kg\` = VALUES(\`small_box_weight_kg\`),
          \`pcs_per_master_ctn\` = VALUES(\`pcs_per_master_ctn\`),
          \`master_ctn_weight_kg\` = VALUES(\`master_ctn_weight_kg\`),
          \`moq\` = VALUES(\`moq\`),
          \`lead_time_days\` = VALUES(\`lead_time_days\`),
          \`production_days\` = VALUES(\`production_days\`),
          \`packing_days\` = VALUES(\`packing_days\`),
          \`stock_pcs\` = VALUES(\`stock_pcs\`),
          \`stock_kg\` = VALUES(\`stock_kg\`),
          \`stock_uom\` = VALUES(\`stock_uom\`),
          \`brand\` = VALUES(\`brand\`),
          \`hsn_code\` = VALUES(\`hsn_code\`),
          \`drawing_url\` = VALUES(\`drawing_url\`),
          \`gdrive_image_url\` = VALUES(\`gdrive_image_url\`),
          \`image_url\` = VALUES(\`image_url\`),
          \`description_html\` = VALUES(\`description_html\`),
          \`description\` = VALUES(\`description\`),
          \`is_in_stock\` = VALUES(\`is_in_stock\`),
          \`is_surplus\` = VALUES(\`is_surplus\`),
          \`surplus_discount_pct\` = VALUES(\`surplus_discount_pct\`),
          \`updated_at\` = CURRENT_TIMESTAMP;
      `;

      const params = [
        p.sku, p.name, p.subGroup || null, p.category || null, p.subCategory || null,
        p.standard || 'DIN 933', p.din || null, p.isoStandard || null, p.bsStandard || null, p.asmeStandard || null,
        p.diameter || 'M10', p.lengthMm || 100, p.pitchMm || 1.5, p.sizeFormatted || null,
        p.threadLength || null, p.threadType || 'Full Thread', p.grade || '8.8', p.finish || 'Black Passivated (BP)',
        p.weightPerPcKg || 0.06, p.weightPer1000PcsKg || null,
        p.pricePerPiece || 10, p.originalPricePerPiece || null,
        p.pricePerKg || 100, p.originalPricePerKg || null,
        p.price100Pcs || null, p.price1000Pcs || null,
        p.pcsPerBox != null ? String(p.pcsPerBox) : null, p.smallBoxWeightKg || 2.5,
        p.pcsPerMasterCtn != null ? String(p.pcsPerMasterCtn) : null, p.masterCtnWeightKg || 20,
        p.moq || '25 KGS', p.leadTimeDays || 10, p.productionDays || 7, p.packingDays || 3,
        p.stockPcs || 0, p.stockKg || 0, p.stockUom || 'Nos',
        p.brand || 'CBH', p.hsnCode || '73181500', p.drawingUrl || null, p.gdriveImageUrl || null,
        p.imageUrl || '/assets/bolt_zinc.jpg', p.descriptionHtml || null, p.description || p.name,
        p.isInStock ? 1 : 0, p.isSurplus ? 1 : 0, p.surplusDiscountPct || 0
      ];

      const [res] = await connection.execute(sql, params);
      if (res.affectedRows === 1) inserted++;
      else if (res.affectedRows >= 2) updated++;
    }

    console.log(`✓ Products table populated successfully: ${inserted} inserted, ${updated} updated with all Excel attributes.`);
  }

  // ==========================================================================
  // 5. Final Table Status Report
  // ==========================================================================
  console.log('\n======================================================');
  console.log(' DATABASE TABLE STATUS SUMMARY');
  console.log('======================================================');

  const [finalTables] = await connection.query('SHOW TABLES');
  for (const t of finalTables) {
    const tableName = Object.values(t)[0];
    const [[{ count }]] = await connection.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
    console.log(`  📊 ${tableName.padEnd(20)} : ${count} rows`);
  }

  await connection.end();
  console.log('\n🎉 ALL TABLES VERIFIED AND ALTERED CLEANLY WITHOUT ERRORS!');
}

main().catch(err => {
  console.error('\n❌ Error during migration:', err);
  process.exit(1);
});

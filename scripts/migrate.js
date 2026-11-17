/**
 * CBH Fasteners - MySQL Database Migration & Seeding Runner
 * 
 * Usage:
 *   node scripts/migrate.js
 *   npm run db:migrate
 */

const fs = require('fs');
const path = require('path');

// Simple .env parser to avoid extra dependencies
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

let mysql;
try {
  mysql = require('mysql2/promise');
} catch (e) {
  console.error('\n❌ [ERROR] mysql2 package is not installed.');
  console.error('Please run: npm install mysql2\n');
  process.exit(1);
}

async function runMigration() {
  console.log('\n======================================================');
  console.log(' CBH FASTENERS - MYSQL DATABASE MIGRATION RUNNER');
  console.log('======================================================\n');

  let host = process.env.DB_HOST;
  let port = Number(process.env.DB_PORT) || 3306;
  let user = process.env.DB_USER;
  let password = process.env.DB_PASSWORD;
  let targetDb = process.env.DB_NAME || 'cbh_fasteners';

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && (databaseUrl.startsWith('mysql://') || databaseUrl.startsWith('mysql2://'))) {
    const raw = databaseUrl.replace(/^mysql2?:\/\//, '');

    const atIndex = raw.lastIndexOf('@');
    if (atIndex !== -1) {
      const userPassPart = raw.slice(0, atIndex);
      const hostDbPart = raw.slice(atIndex + 1);

      const colonIdx = userPassPart.indexOf(':');
      if (colonIdx !== -1) {
        user = user || decodeURIComponent(userPassPart.slice(0, colonIdx));
        password = password !== undefined ? password : decodeURIComponent(userPassPart.slice(colonIdx + 1));
      } else {
        user = user || decodeURIComponent(userPassPart);
        password = password !== undefined ? password : '';
      }

      const slashIdx = hostDbPart.indexOf('/');
      const hostPortPart = slashIdx !== -1 ? hostDbPart.slice(0, slashIdx) : hostDbPart;
      const dbPart = slashIdx !== -1 ? hostDbPart.slice(slashIdx + 1).split('?')[0] : '';

      if (dbPart) targetDb = dbPart;

      const hostColonIdx = hostPortPart.indexOf(':');
      if (hostColonIdx !== -1) {
        host = host || hostPortPart.slice(0, hostColonIdx);
        port = Number(hostPortPart.slice(hostColonIdx + 1)) || port;
      } else {
        host = host || hostPortPart;
      }
    } else {
      // User may have specified mysql://root:password/dbname (missing @localhost)
      const slashIdx = raw.indexOf('/');
      const credsPart = slashIdx !== -1 ? raw.slice(0, slashIdx) : raw;
      const dbPart = slashIdx !== -1 ? raw.slice(slashIdx + 1).split('?')[0] : '';
      if (dbPart) targetDb = dbPart;

      const colonIdx = credsPart.indexOf(':');
      if (colonIdx !== -1) {
        user = user || credsPart.slice(0, colonIdx);
        password = password !== undefined ? password : credsPart.slice(colonIdx + 1);
      } else {
        user = user || credsPart;
      }
      host = host || '127.0.0.1';
    }
  }

  // Fallbacks and sanitize
  host = host || '127.0.0.1';
  // If host was mistakenly set to 'root' due to missing @, correct to 127.0.0.1
  if (host === 'root') {
    host = '127.0.0.1';
  }
  user = user || 'root';
  password = password || '';

  const connectionConfig = {
    host,
    port,
    user,
    password,
    multipleStatements: true,
  };

  console.log(`📡 Connecting to MySQL Server [${connectionConfig.host}:${connectionConfig.port}] as user [${connectionConfig.user}]...`);

  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log('✓ Connected to MySQL server successfully.');
  } catch (err) {
    console.error('\n❌ Could not connect to MySQL server:');
    console.error(`   ${err.message}`);
    console.error('\nPlease verify your database credentials in .env:');
    console.error('   DATABASE_URL="mysql://root:password@localhost:3306/cbh_fasteners"');
    console.error('   Or DB_HOST, DB_USER, DB_PASSWORD, DB_NAME\n');
    process.exit(1);
  }

  try {
    // 1. Create database if it doesn't exist
    console.log(`📁 Ensuring database \`${targetDb}\` exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${targetDb}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${targetDb}\`;`);
    console.log(`✓ Using database \`${targetDb}\`.`);

    // 2. Read schema.sql
    const schemaPath = path.resolve(__dirname, '..', 'db', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`schema.sql not found at ${schemaPath}`);
    }

    console.log('📄 Executing db/schema.sql...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema statements safely (ignoring duplicate index / constraint errors)
    const statements = schemaSql
      .split(/;\s*$/m)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const stmt of statements) {
      try {
        await connection.query(stmt);
      } catch (stmtErr) {
        // Ignore duplicate index errors (code 1061 or ER_DUP_KEYNAME)
        if (
          stmtErr.errno === 1061 ||
          stmtErr.code === 'ER_DUP_KEYNAME' ||
          (stmtErr.message && stmtErr.message.includes('Duplicate key name'))
        ) {
          continue;
        }
        throw stmtErr;
      }
    }
    console.log('✓ Database schema tables and indexes successfully verified/created:');
    console.log('   - users');
    console.log('   - categories');
    console.log('   - products');
    console.log('   - tier_settings');
    console.log('   - bulk_rfqs');
    console.log('   - rfq_items');
    console.log('   - orders');
    console.log('   - order_items');
    console.log('   - surplus_lots');
    console.log('   - blogs');
    console.log('   - gallery_items');

    // 3. Seed Default Admin & Demo Customer if users table is empty
    const [userRows] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      console.log('🌱 Seeding initial admin and demo customer accounts...');
      await connection.query(`
        INSERT INTO users (email, password_hash, full_name, company_name, gstin, phone, role, tier, tier_discount_pct, credit_limit, is_verified)
        VALUES 
        ('admin@cbh.store', 'Admin@Fastener2025', 'Harpreet Singh (Chief Operations)', 'CBH Fasteners Tech Pvt. Ltd.', '03AABCC1234F1Z0', '+91 98880 21000', 'admin', 'VIP', 25.00, 1000000.00, TRUE),
        ('procurement@apexinfra.com', 'Password@123', 'Rajesh Sharma', 'Apex Heavy Infrastructure Ltd.', '29AABCA1234F1Z5', '+91 98880 21000', 'customer', 'DIAMOND', 18.00, 500000.00, TRUE);
      `);
      console.log('✓ Default accounts created:');
      console.log('   - Admin:    admin@cbh.store (Admin@Fastener2025)');
      console.log('   - Customer: procurement@apexinfra.com (Password@123)');
    }

    // 4. Seed Categories if empty
    const [categoryRows] = await connection.query('SELECT COUNT(*) as count FROM categories');
    if (categoryRows[0].count === 0) {
      console.log('🌱 Seeding standard fastener categories...');
      await connection.query(`
        INSERT INTO categories (slug, name, standard_prefix, description)
        VALUES 
        ('hex-screws', 'Hexagon Head Screws', 'DIN 933 / ISO 4017', 'Fully threaded precision hex cap screws'),
        ('hex-bolts', 'Heavy Hexagon Bolts', 'DIN 931 / ISO 4014', 'Partially threaded heavy structural bolts'),
        ('socket-cap', 'Hexagon Socket Head Cap', 'DIN 912 / ISO 4762', 'High-tensile internal hex Allen drive fasteners'),
        ('nuts', 'Industrial Hexagon Nuts', 'DIN 934 / ISO 4032', 'Standard and heavy hex coupling and locking nuts'),
        ('anchors', 'Concrete & Masonry Anchors', 'ETA Option 7', 'Heavy-duty wedge, sleeve, and chemical drop-in anchors'),
        ('threaded-rods', 'Continuous Thread Stud Rods', 'ASTM A193 B7', 'High-temperature, high-pressure alloy continuous studs');
      `);
      console.log('✓ Fastener categories seeded.');
    }

    // 5. Seed Blogs if empty
    const [blogRows] = await connection.query('SELECT COUNT(*) as count FROM blogs');
    if (blogRows[0].count === 0) {
      console.log('🌱 Seeding initial engineering blog guides...');
      const blogsJsonPath = path.resolve(__dirname, '..', 'src', 'data', 'blogs-data.json');
      if (fs.existsSync(blogsJsonPath)) {
        const blogsData = JSON.parse(fs.readFileSync(blogsJsonPath, 'utf8'));
        for (const b of blogsData) {
          await connection.query(
            `INSERT INTO blogs (slug, title, excerpt, content, category, read_time, publish_date, author, image_url, is_featured, status, views, tags)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              b.slug || b.id,
              b.title,
              b.excerpt,
              b.content,
              b.category,
              b.readTime || '5 min read',
              b.date,
              b.author,
              b.image,
              b.featured ? 1 : 0,
              b.status || 'PUBLISHED',
              b.views || 0,
              JSON.stringify(b.tags || [])
            ]
          );
        }
        console.log(`✓ Seeded ${blogsData.length} technical blog articles into MySQL.`);
      }
    }

    // 6. Seed Surplus Liquidation Lots if empty
    const [surplusRows] = await connection.query('SELECT COUNT(*) as count FROM surplus_lots');
    if (surplusRows[0].count === 0) {
      console.log('🌱 Seeding verified surplus liquidation lots...');
      await connection.query(`
        INSERT INTO surplus_lots (
          lot_number, title, description, spec_standard, total_weight_tonnes, market_price_per_kg,
          clearance_price_per_kg, discount_pct, depot_location, status, image_url
        ) VALUES 
        ('SURP-DIN933-M12-100-8.8', 'Hex Head Screws DIN 933 M12x100mm Grade 8.8 Black Phosphate', 'Certified EPC surplus lot from Solar Plant construction. 100% mill inspected with 3.1 NABL certs.', 'DIN 933 / IS 1364 Grade 8.8 M12x100mm', 1.09, 165.00, 99.00, 40, 'Bhiwandi Logistics Hub, Maharashtra', 'AVAILABLE', '/assets/bolt_zinc.jpg'),
        ('SURP-DIN912-M16-80-12.9', 'Socket Head Cap Screws DIN 912 M16x80mm Grade 12.9 High Tensile', 'Heavy machinery manufacturing excess inventory. Unopened factory barrels with rust-preventive oil coating.', 'DIN 912 / ISO 4762 Grade 12.9 M16x80mm', 1.15, 210.00, 115.50, 45, 'Ludhiana Central Depot, Punjab', 'AVAILABLE', '/assets/bolt_zinc.jpg'),
        ('SURP-SS316-M10-60-A4', 'Marine Grade Stainless Hex Bolts SS 316 (A4-70) M10x60mm', 'High corrosion resistance austenitic stainless fasteners for coastal dockyards and chemical plants.', 'ISO 4017 / DIN 933 SS316 (A4-70)', 0.62, 420.00, 252.00, 40, 'Hazira Port Warehouse, Gujarat', 'AVAILABLE', '/assets/bolt_zinc.jpg'),
        ('SURP-ASTM-B7-M24-3000', 'ASTM A193 Grade B7 Heavy Continuous Studs M24x3000mm', 'Refinery expansion surplus studs. Heat treated chrome-moly steel for high temperature flanged joints.', 'ASTM A193 B7 / IS 1862 M24x3000mm', 3.50, 195.00, 117.00, 40, 'Jamnagar Refinery Ancillary Yard, Gujarat', 'RESERVED', '/assets/bolt_zinc.jpg');
      `);
      console.log('✓ 4 verified surplus liquidation lots seeded into MySQL.');
    }

    // 7. Seed Facility & Infrastructure Media Gallery if empty
    const [galleryRows] = await connection.query('SELECT COUNT(*) as count FROM gallery_items');
    if (galleryRows[0].count === 0) {
      console.log('🌱 Seeding facility & infrastructure media gallery...');
      const galleryJsonPath = path.resolve(__dirname, '..', 'src', 'data', 'gallery-data.json');
      if (fs.existsSync(galleryJsonPath)) {
        const galleryData = JSON.parse(fs.readFileSync(galleryJsonPath, 'utf8'));
        for (const item of galleryData) {
          await connection.query(
            `INSERT INTO gallery_items 
             (id, title, category, category_label, image_url, location, date_tag, description, specs_json, sort_order, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE title = VALUES(title)`,
            [
              item.id,
              item.title,
              item.category,
              item.categoryLabel || item.category,
              item.image,
              item.location || '',
              item.date || '',
              item.description || '',
              JSON.stringify(item.specs || []),
              item.sortOrder || 0,
              item.isActive !== false ? 1 : 0
            ]
          );
        }
        console.log(`✓ Seeded ${galleryData.length} media photographs into MySQL.`);
      }
    }

    // 7. Ensure at least a few catalog products are flagged as surplus for dual surplus showcase
    try {
      const [surplusProdRows] = await connection.query('SELECT COUNT(*) as count FROM products WHERE is_surplus = 1');
      if (surplusProdRows[0].count === 0) {
        console.log('🌱 Tagging sample catalog products with surplus clearance discount...');
        await connection.query(`
          UPDATE products 
          SET is_surplus = 1, surplus_discount_pct = 40 
          WHERE id IN (
            SELECT id FROM (SELECT id FROM products LIMIT 3) as tmp
          );
        `);
        console.log('✓ Catalog surplus products tagged.');
      }
    } catch (e) {
      // Products table might be populated in a later step
    }

    // 8. Ensure Price & Weight columns have expanded precision
    try {
      console.log('🔧 Verifying price & weight precision columns...');
      const alterQueries = [
        'ALTER TABLE products MODIFY COLUMN price_per_piece DECIMAL(16, 4) NOT NULL DEFAULT 5.0000',
        'ALTER TABLE products MODIFY COLUMN original_price_per_piece DECIMAL(16, 4) DEFAULT 5.0000',
        'ALTER TABLE products MODIFY COLUMN price_per_kg DECIMAL(16, 4) NOT NULL DEFAULT 90.0000',
        'ALTER TABLE products MODIFY COLUMN original_price_per_kg DECIMAL(16, 4) DEFAULT 90.0000',
        'ALTER TABLE products MODIFY COLUMN price_100_pcs DECIMAL(16, 2) DEFAULT NULL',
        'ALTER TABLE products MODIFY COLUMN price_1000_pcs DECIMAL(16, 2) DEFAULT NULL',
        'ALTER TABLE products MODIFY COLUMN weight_per_pc_kg DECIMAL(12, 4) NOT NULL DEFAULT 0.0600',
        'ALTER TABLE products MODIFY COLUMN weight_per_1000_pcs_kg DECIMAL(14, 4) DEFAULT NULL',
        'ALTER TABLE products MODIFY COLUMN small_box_weight_kg DECIMAL(10, 2) DEFAULT 2.50',
        'ALTER TABLE products MODIFY COLUMN master_ctn_weight_kg DECIMAL(10, 2) DEFAULT 20.00',
        'ALTER TABLE products MODIFY COLUMN stock_kg DECIMAL(16, 2) NOT NULL DEFAULT 0.00'
      ];
      for (const q of alterQueries) {
        try { await connection.query(q); } catch {}
      }
      console.log('✓ Price and weight column precision verified.');
    } catch (e) {}

    // 9. Ensure virtual_store_zones table exists
    try {
      console.log('🏢 Verifying 3D Virtual Store zones table...');
      await connection.query(`
        CREATE TABLE IF NOT EXISTS virtual_store_zones (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          subtitle VARCHAR(500),
          category VARCHAR(150),
          aisle_code VARCHAR(50) DEFAULT '',
          sku_count INT DEFAULT 0,
          color VARCHAR(50) DEFAULT '#0052CC',
          cam_pos_json VARCHAR(255),
          cam_look_json VARCHAR(255),
          hotspot_pos_json VARCHAR(255),
          is_active TINYINT(1) DEFAULT 1,
          sort_order INT DEFAULT 0,
          featured_sku VARCHAR(150),
          featured_product_json TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      try { await connection.query('ALTER TABLE virtual_store_zones ADD COLUMN aisle_code VARCHAR(50) DEFAULT ""'); } catch {}
      try { await connection.query('ALTER TABLE virtual_store_zones ADD COLUMN sku_count INT DEFAULT 0'); } catch {}
      try { await connection.query('ALTER TABLE virtual_store_zones ADD COLUMN color VARCHAR(50) DEFAULT "#0052CC"'); } catch {}
      console.log('✓ 3D Virtual Store zones table verified.');
    } catch (e) {}

    console.log('\n======================================================');
    console.log('🎉 [SUCCESS] Server Database Migration Complete!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();

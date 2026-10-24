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

  const databaseUrl = process.env.DATABASE_URL;
  let connectionConfig = {};
  let targetDb = process.env.DB_NAME || 'cbh_fasteners';

  if (databaseUrl && (databaseUrl.startsWith('mysql://') || databaseUrl.startsWith('mysql2://'))) {
    try {
      const parsedUrl = new URL(databaseUrl.replace('mysql2://', 'mysql://'));
      connectionConfig = {
        host: parsedUrl.hostname || 'localhost',
        port: Number(parsedUrl.port) || 3306,
        user: decodeURIComponent(parsedUrl.username || 'root'),
        password: decodeURIComponent(parsedUrl.password || ''),
        multipleStatements: true,
      };
      targetDb = parsedUrl.pathname.replace('/', '') || targetDb;
    } catch {
      connectionConfig = {
        uri: databaseUrl,
        multipleStatements: true,
      };
    }
  } else {
    connectionConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
    };
  }

  console.log(`📡 Connecting to MySQL Server (${connectionConfig.host || 'localhost'}:${connectionConfig.port || 3306}) as [${connectionConfig.user || 'root'}]...`);

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

    // Execute schema statements
    await connection.query(schemaSql);
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

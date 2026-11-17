/**
 * CBH Fasteners - Product Inventory Counter & Cache Inspector
 * 
 * Usage:
 *   node scripts/count-products.js
 *   npm run db:count
 *   npm run db:count -- --clear-cache
 */

const fs = require('fs');
const path = require('path');

// Simple .env parser
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
  console.error('\n❌ mysql2 package is not installed.');
  process.exit(1);
}

async function checkProductCount() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || 'root';
  const database = process.env.DB_NAME || 'CBH';

  const shouldClearCache = process.argv.includes('--clear-cache') || process.argv.includes('-c');
  const cacheFile = path.resolve(__dirname, '..', 'src', 'data', 'products-cache.json');

  console.log('\n======================================================');
  console.log('       CBH FASTENERS - PRODUCT INVENTORY CHECK        ');
  console.log('======================================================');
  console.log(`Database Target: [${database}] on ${host}:${port} (user: ${user})\n`);

  // 1. Check Local JSON Cache file
  let cacheCount = 0;
  if (fs.existsSync(cacheFile)) {
    try {
      const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      cacheCount = Array.isArray(cacheData) ? cacheData.length : 0;
      console.log(`📁 Local JSON Cache (products-cache.json): ${cacheCount.toLocaleString()} products`);
    } catch {
      console.log('📁 Local JSON Cache (products-cache.json): [Error parsing file]');
    }
  } else {
    console.log('📁 Local JSON Cache (products-cache.json): 0 products (File not found)');
  }

  if (shouldClearCache) {
    try {
      fs.writeFileSync(cacheFile, JSON.stringify([], null, 2), 'utf8');
      console.log('🧹 Cleared Local JSON Cache file -> set to 0 products.');
      cacheCount = 0;
    } catch (err) {
      console.error('❌ Failed clearing cache file:', err.message);
    }
  }

  // 2. Query MySQL
  let conn;
  try {
    conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
    });

    const [countRows] = await conn.query('SELECT COUNT(*) AS total FROM products');
    const total = countRows[0]?.total || 0;

    const [stockRows] = await conn.query('SELECT COUNT(*) AS in_stock FROM products WHERE is_in_stock = 1 OR stock_pcs > 0');
    const inStock = stockRows[0]?.in_stock || 0;

    const [surplusRows] = await conn.query('SELECT COUNT(*) AS surplus FROM products WHERE is_surplus = 1');
    const surplus = surplusRows[0]?.surplus || 0;

    console.log(`\n🛢️  MySQL Database [${database}].[products]:`);
    console.log(`   ------------------------------------------`);
    console.log(`   Total Products Listed : ${total.toLocaleString()}`);
    console.log(`   In-Stock Fasteners    : ${inStock.toLocaleString()}`);
    console.log(`   Surplus Lots Listed   : ${surplus.toLocaleString()}`);
    console.log(`   ------------------------------------------`);

    if (total === 0 && cacheCount > 0) {
      console.log('\n⚠️  NOTE: MySQL has 0 products, but your local JSON cache still holds products.');
      console.log('   To synchronize local cache to 0 as well, run:');
      console.log('   node scripts/count-products.js --clear-cache\n');
    } else if (total === 0 && cacheCount === 0) {
      console.log('\n✅ Catalog is completely empty (0 in MySQL, 0 in JSON cache).\n');
    }

  } catch (err) {
    console.log(`\n⚠️  Could not connect to MySQL: ${err.message}`);
    console.log('   Make sure your MySQL service is running and credentials in .env are correct.');
  } finally {
    if (conn) await conn.end();
  }
}

checkProductCount();

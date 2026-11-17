const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

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
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}
loadEnv();

async function runMigration() {
  console.log('Connecting to MySQL...');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'cbh',
  });

  console.log('Altering products table columns to expand price and weight ranges...');
  
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
    'ALTER TABLE products MODIFY COLUMN stock_kg DECIMAL(16, 2) NOT NULL DEFAULT 0.00',
  ];

  for (const q of alterQueries) {
    try {
      await conn.query(q);
      console.log('✓ Executed:', q.split('MODIFY COLUMN ')[1]);
    } catch (err) {
      console.warn('⚠️ Warning on query:', q, err.message);
    }
  }

  console.log('\nVerifying updated columns...');
  const [cols] = await conn.query('SHOW FULL COLUMNS FROM products');
  for (const c of cols) {
    if (c.Field.includes('price') || c.Field.includes('weight')) {
      console.log(`  ${c.Field}: ${c.Type}`);
    }
  }

  await conn.end();
  console.log('\nMigration completed successfully!');
}

runMigration().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});

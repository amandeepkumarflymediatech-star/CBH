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
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnv();

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'CBH'
  });

  const cats = ['HEX SCREWS', 'HEX BOLTS', 'HSFG BOLTS', 'SOCKET HEAD', 'HEX FLANGE BOLTS', 'CARRIAGE BOLTS', 'THREADED RODS'];
  for (const c of cats) {
    const [rows] = await conn.query('SELECT sku, name, standard, grade, price_per_piece, stock_pcs FROM products WHERE category = ? AND stock_pcs > 0 ORDER BY stock_pcs DESC LIMIT 1', [c]);
    console.log(c, rows[0]);
  }
  await conn.end();
}
run().catch(console.error);

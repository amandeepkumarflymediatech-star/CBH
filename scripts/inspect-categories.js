const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

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

async function inspect() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'CBH'
  });

  const [categories] = await conn.query('SELECT category, count(*) as count FROM products GROUP BY category ORDER BY count DESC');
  console.log('Categories in DB:');
  console.table(categories);

  const [subgroups] = await conn.query('SELECT sub_group, count(*) as count FROM products GROUP BY sub_group ORDER BY count DESC LIMIT 10');
  console.log('Sub-groups in DB:');
  console.table(subgroups);

  const [standards] = await conn.query('SELECT standard, count(*) as count FROM products GROUP BY standard ORDER BY count DESC LIMIT 10');
  console.log('Top standards in DB:');
  console.table(standards);

  await conn.end();
}

inspect().catch(console.error);

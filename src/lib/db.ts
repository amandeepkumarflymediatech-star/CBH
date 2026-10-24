import mysql, { Pool, PoolOptions } from 'mysql2/promise';

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: Pool | undefined;
}

function createPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;

  let poolConfig: PoolOptions;

  if (databaseUrl && (databaseUrl.startsWith('mysql://') || databaseUrl.startsWith('mysql2://'))) {
    poolConfig = {
      uri: databaseUrl,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    };
  } else {
    poolConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'cbh_fasteners',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    };
  }

  return mysql.createPool(poolConfig);
}

// Preserve pool across hot-reloads in Next.js development
export const db: Pool = global.__mysqlPool ?? createPool();

if (process.env.NODE_ENV !== 'production') {
  global.__mysqlPool = db;
}

/**
 * Execute a parameterized SQL query against MySQL
 * @param sql - The SQL statement with '?' placeholders
 * @param values - Array of parameter values
 */
export async function query<T = any>(sql: string, values?: any[]): Promise<T> {
  const [rows] = await db.query(sql, values);
  return rows as T;
}

export default db;

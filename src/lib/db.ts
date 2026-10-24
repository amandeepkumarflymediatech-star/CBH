// Native MySQL Database Helper for CBH Fasteners Platform
// Bulletproof dynamic loader to prevent Next.js build-time type errors on remote servers

export type MySQLPool = any;

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: any | undefined;
}

function getMySQLDriver(): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('mysql2/promise');
  } catch {
    return null;
  }
}

function createPool(): any {
  const mysql = getMySQLDriver();
  if (!mysql) {
    return null;
  }

  const databaseUrl = process.env.DATABASE_URL;

  let poolConfig: any;

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
export const db: any = global.__mysqlPool ?? createPool();

if (process.env.NODE_ENV !== 'production' && db) {
  global.__mysqlPool = db;
}

/**
 * Execute a parameterized SQL query against MySQL
 * @param sql - The SQL statement with '?' placeholders
 * @param values - Array of parameter values
 */
export async function query<T = any>(sql: string, values?: any[]): Promise<T[]> {
  if (!db) {
    const freshPool = createPool();
    if (!freshPool) {
      console.warn('[MySQL DB] mysql2 driver not available. Please run: npm install mysql2');
      return [] as T[];
    }
    const [rows] = await freshPool.query(sql, values);
    return rows as T[];
  }
  const [rows] = await db.query(sql, values);
  return rows as T[];
}

export default db;

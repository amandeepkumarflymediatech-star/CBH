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

  host = host || '127.0.0.1';
  if (host === 'root') host = '127.0.0.1';
  user = user || 'root';
  password = password || '';

  const poolConfig = {
    host,
    port,
    user,
    password,
    database: targetDb,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  };

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

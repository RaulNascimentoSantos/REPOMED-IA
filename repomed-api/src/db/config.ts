import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import postgres from 'postgres';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Determine database type and create appropriate connection
const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';

let db: any;

if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
  // PostgreSQL connection
  console.log('🐘 Connecting to PostgreSQL...');
  const client = postgres(databaseUrl, { prepare: false });
  db = drizzlePg(client, { schema });
} else if (databaseUrl.startsWith('file:')) {
  // SQLite connection for development
  console.log('🗄️  Connecting to SQLite for development...');
  const dbPath = databaseUrl.replace('file:', '');
  const sqlite = new Database(dbPath);
  db = drizzleSqlite(sqlite, { schema });
  
  // Enable foreign keys and WAL mode for better performance
  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('journal_mode = WAL');
} else {
  throw new Error('Unsupported database URL format');
}

export { db };
export * from './schema';
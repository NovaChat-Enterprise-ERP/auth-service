import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { schema } from './schema.js';

export type Database = NodePgDatabase<typeof schema>;

export const createDatabase = (url: string, onError: (error: Error) => void = () => undefined): { db: Database; pool: Pool } => {
  const pool = new Pool({ connectionString: url, max: 10, idleTimeoutMillis: 300_000, keepAlive: true });
  pool.on('error', onError);
  return { db: drizzle(pool, { schema }), pool };
};

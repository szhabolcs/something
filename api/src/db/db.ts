import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';
import pkg from 'pg';
const { Pool } = pkg;

// Create database pool
const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_STRING,
  max: Number(process.env.DB_MAX_CONNECTIONS) ?? 10
});

const db = drizzle(pool, { schema });

export { db };

export type DrizzleDatabaseSession = typeof db;
export type DrizzleTransactionSession = Parameters<
  Parameters<typeof db.transaction>['0']
>['0'];

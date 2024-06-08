import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// Create database pool
const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_STRING,
  max: Number(process.env.DB_MAX_CONNECTIONS) ?? 10
});

const db = drizzle(pool);

export { db };

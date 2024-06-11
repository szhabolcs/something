import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;

// Create database pool
const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_STRING,
  max: Number(process.env.DB_MAX_CONNECTIONS) ?? 10
});

const db = drizzle(pool);

export { db };

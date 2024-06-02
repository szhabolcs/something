import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg; // Weird CJS/ESM import issue

// Create database pool
const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_STRING
});

const db = drizzleNode(pool);

export { db };

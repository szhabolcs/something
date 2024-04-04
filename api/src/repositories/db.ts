import { drizzle } from "drizzle-orm/postgres-js";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { Pool } from "pg";

// Initialize the database with migrations
async function initializeDatabase() {
  const sql = postgres(process.env.DB_CONNECTION_STRING || "", { max: 1 });
  const db = drizzle(sql);

  await sql`CREATE EXTENSION IF NOT EXISTS "postgis";`;
  
  // run migrations
  await migrate(db, { migrationsFolder: "drizzle" });
  await sql.end();
}

// Create database pool
const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_STRING,
});

const db = drizzleNode(pool);

export { initializeDatabase, db };

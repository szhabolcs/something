import 'dotenv/config';

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// Initialize the database with migrations
async function initializeDatabase() {
  const sql = postgres(process.env.DB_CONNECTION_STRING || '', { max: 1 });
  const db = drizzle(sql);

  // run migrations
  await migrate(db, { migrationsFolder: 'drizzle' });
  await sql.end();
}

initializeDatabase().catch((error) => {
  console.error('Failed to initialize database', error);
  process.exit(1);
});

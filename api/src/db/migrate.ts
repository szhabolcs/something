import 'dotenv/config';

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema.js';

const connection = postgres(process.env.DB_CONNECTION_STRING, { max: 1 });
const db = drizzle(connection, { schema });

await migrate(db, { migrationsFolder: './drizzle' });
await connection.end();

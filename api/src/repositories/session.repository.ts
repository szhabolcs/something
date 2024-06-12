import { eq } from 'drizzle-orm';
import {
  DrizzleDatabaseSession,
  DrizzleTransactionSession,
  db
} from '../db/db.js';
import { SessionTable } from '../db/schema.js';

export class SessionRepository {
  public async create(
    userId: string,
    refreshToken: string,
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db
  ) {
    return tx.insert(SessionTable).values({
      userId,
      refreshToken
    });
  }

  public async get(refreshToken: string) {
    try {
      const [session] = await db
        .select()
        .from(SessionTable)
        .where(eq(SessionTable.refreshToken, refreshToken))
        .limit(1);
      return session || null;
    } catch (error) {
      return null;
    }
  }

  public async delete(refreshToken: string) {
    return db
      .delete(SessionTable)
      .where(eq(SessionTable.refreshToken, refreshToken));
  }

  public async deleteAll(userId: string) {
    return db.delete(SessionTable).where(eq(SessionTable.userId, userId));
  }
}

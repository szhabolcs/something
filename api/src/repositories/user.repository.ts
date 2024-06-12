import {
  DrizzleDatabaseSession,
  DrizzleTransactionSession,
  db
} from '../db/db.js';
import { UserTable } from '../db/schema.js';
import { InferInsertModel, eq } from 'drizzle-orm';

export class UserRepository {
  public async getById(id: string) {
    try {
      const [user] = await db
        .select()
        .from(UserTable)
        .where(eq(UserTable.id, id))
        .limit(1);
      return user || null;
    } catch (error) {
      return null;
    }
  }

  public async getByUsername(username: string) {
    try {
      const [user] = await db
        .select()
        .from(UserTable)
        .where(eq(UserTable.username, username))
        .limit(1);
      return user || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * @throws {Error}
   */
  public async create(
    user: InferInsertModel<typeof UserTable>,
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db
  ) {
    return tx.insert(UserTable).values(user).returning();
  }

  public async updatePushToken(userId: string, pushToken: string) {
    return db
      .update(UserTable)
      .set({ pushToken })
      .where(eq(UserTable.id, userId));
  }
}

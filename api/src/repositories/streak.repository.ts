import { DrizzleDatabaseSession, DrizzleTransactionSession, db } from '../db/db.js';
import { StreakTable } from '../db/schema.js';
import { and, eq } from 'drizzle-orm';

export class StreakRepository {
  /**
   * @throws {Error}
   */
  public async getCurrent(
    userId: string,
    thingId: string,
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db,
    forUpdate: boolean = false
  ) {
    const query = tx
      .select({ streak: StreakTable.count })
      .from(StreakTable)
      .where(and(eq(StreakTable.userId, userId), eq(StreakTable.thingId, thingId)))
      .limit(1);

    if (forUpdate) {
      return query.for('update');
    } else {
      return query;
    }
  }

  public async setStreak(
    userId: string,
    thingId: string,
    value: number,
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db
  ) {
    return tx
      .update(StreakTable)
      .set({ count: value })
      .where(and(eq(StreakTable.userId, userId), eq(StreakTable.thingId, thingId)));
  }
}

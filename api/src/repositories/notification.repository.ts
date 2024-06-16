import { DrizzleDatabaseSession, DrizzleTransactionSession, db } from '../db/db.js';
import { NotificationTable } from '../db/schema.js';
import { and, between, eq } from 'drizzle-orm';

export class NotificationRepository {
  /**
   * @throws {Error}
   */
  public async getNotificationsBetween(
    userId: string,
    from: Date,
    to: Date,
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db
  ) {
    const query = await tx
      .select()
      .from(NotificationTable)
      .where(and(eq(NotificationTable.userId, userId), between(NotificationTable.createdAt, from, to)))
      .orderBy(NotificationTable.scheduledAt)
      .limit(1);

    return query;
  }
}

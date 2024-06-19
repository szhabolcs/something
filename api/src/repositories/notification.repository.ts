import { DrizzleDatabaseSession, DrizzleTransactionSession, db } from '../db/db.js';
import { NotificationTable } from '../db/schema.js';
import { InferInsertModel, and, between, eq, ne } from 'drizzle-orm';

export class NotificationRepository {
  /**
   * @throws {Error}
   */
  public async getUserNotificationsBetween(
    userId: string,
    from: string,
    to: string,
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

  /**
   * @throws {Error}
   */
  public async notificationExists(
    userId: string,
    thingId: string,
    from: string,
    to: string,
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db
  ) {
    const [query] = await tx
      .select()
      .from(NotificationTable)
      .where(
        and(
          eq(NotificationTable.userId, userId),
          eq(NotificationTable.thingId, thingId),
          between(NotificationTable.scheduledAt, from, to)
        )
      )
      .orderBy(NotificationTable.scheduledAt)
      .limit(1);

    return !!query;
  }

  public async getScheduledNotifications() {
    return db.select().from(NotificationTable).where(ne(NotificationTable.status, 'completed'));
  }

  public async changeNotificationStatus(
    notificationId: string,
    newStatus: InferInsertModel<typeof NotificationTable>['status']
  ) {
    return db.update(NotificationTable).set({ status: newStatus }).where(eq(NotificationTable.id, notificationId));
  }

  public async removeNotification(notificationId: string) {
    return db.delete(NotificationTable).where(eq(NotificationTable.id, notificationId));
  }

  public async create(notification: InferInsertModel<typeof NotificationTable>) {
    return db.insert(NotificationTable).values(notification);
  }
}

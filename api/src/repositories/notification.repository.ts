import { DrizzleDatabaseSession, DrizzleTransactionSession, db } from '../db/db.js';
import { NotificationTable, UserTable } from '../db/schema.js';
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

    return query ? query : undefined;
  }

  public async getScheduledNotifications() {
    return db
      .select()
      .from(NotificationTable)
      .where(ne(NotificationTable.status, 'completed'))
      .orderBy(NotificationTable.scheduledAt);
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

  public async create(
    notification: InferInsertModel<typeof NotificationTable>,
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db
  ) {
    const [data] = await tx.insert(NotificationTable).values(notification).returning();
    return data;
  }

  public async getNotificationDataById(notificationId: string) {
    const [data] = await db
      .select()
      .from(NotificationTable)
      .innerJoin(UserTable, eq(NotificationTable.userId, UserTable.id))
      .where(eq(NotificationTable.id, notificationId));
    return data;
  }
}

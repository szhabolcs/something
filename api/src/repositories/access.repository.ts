import { InferSelectModel, and, eq, ne } from 'drizzle-orm';
import { DrizzleDatabaseSession, DrizzleTransactionSession, db } from '../db/db.js';
import { ThingAccessTable, UserTable } from '../db/schema.js';

export class AccessRepository {
  /**
   * @throws {Error}
   */
  public async giveThingAccess(
    thingId: string,
    userIds: string[],
    role: InferSelectModel<typeof ThingAccessTable>['role'],
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db
  ) {
    await tx.insert(ThingAccessTable).values(userIds.map((userId) => ({ thingId, userId, role })));
  }

  /**
   * @throws {Error}
   */
  public async getThingAccess(
    userId: string,
    thingId: string,
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db
  ) {
    const [{ role }] = await tx
      .select({ role: ThingAccessTable.role })
      .from(ThingAccessTable)
      .where(and(eq(ThingAccessTable.userId, userId), eq(ThingAccessTable.thingId, thingId)));

    return role ? role : null;
  }

  /**
   * @throws {Error}
   */
  public async getSharedUsernames(
    userId: string,
    thingId: string,
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db
  ) {
    const usernames = await tx
      .select({ username: UserTable.username })
      .from(ThingAccessTable)
      .innerJoin(UserTable, eq(ThingAccessTable.userId, UserTable.id))
      .where(and(eq(ThingAccessTable.thingId, thingId), ne(ThingAccessTable.userId, userId)));

    return usernames.map((u) => u.username);
  }
}

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
  public async removeThingAccess(
    thingId: string,
    userId: string,
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db
  ) {
    await tx
      .delete(ThingAccessTable)
      .where(and(eq(ThingAccessTable.userId, userId), eq(ThingAccessTable.thingId, thingId)));
  }

  /**
   * @throws {Error}
   */
  public async getThingAccess(
    userId: string,
    thingId: string,
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db
  ) {
    const [data] = await tx
      .select({ role: ThingAccessTable.role })
      .from(ThingAccessTable)
      .where(and(eq(ThingAccessTable.userId, userId), eq(ThingAccessTable.thingId, thingId)));

    return data ? data.role : null;
  }

  /**
   * @throws {Error}
   */
  public async getSharedUsernames(
    userId: string,
    thingId: string,
    omitQueriedUser: boolean = true,
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db
  ) {
    let usernames;
    if (omitQueriedUser) {
      usernames = await tx
        .select({ username: UserTable.username })
        .from(ThingAccessTable)
        .innerJoin(UserTable, eq(ThingAccessTable.userId, UserTable.id))
        .where(and(eq(ThingAccessTable.thingId, thingId), ne(ThingAccessTable.userId, userId)));
    } else {
      usernames = await tx
        .select({ username: UserTable.username })
        .from(ThingAccessTable)
        .innerJoin(UserTable, eq(ThingAccessTable.userId, UserTable.id))
        .where(and(eq(ThingAccessTable.thingId, thingId)));
    }

    return usernames.map((u) => u.username);
  }

  /**
   * @throws {Error}
   */
  public async getUsersForThing(thingId: string) {
    const users = await db
      .select({ user: UserTable })
      .from(ThingAccessTable)
      .innerJoin(UserTable, eq(ThingAccessTable.userId, UserTable.id))
      .where(eq(ThingAccessTable.thingId, thingId));

    return users.map(({ user }) => user);
  }
}

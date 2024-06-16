import { DrizzleDatabaseSession, DrizzleTransactionSession, db } from '../db/db.js';
import {
  ImageTable,
  NotificationTable,
  ScheduleTable,
  StreakTable,
  ThingAccessTable,
  ThingTable,
  UserTable
} from '../db/schema.js';
import { and, between, eq, ne } from 'drizzle-orm';
import { ThingPreviewModel } from '../types/thing.types.js';

export class ThingRepository {
  /**
   * @throws {Error}
   */
  public async getDetails(thingId: string, tx: DrizzleDatabaseSession | DrizzleTransactionSession = db) {
    const [thing] = await tx.select().from(ThingTable).where(eq(ThingTable.id, thingId));
    return thing;
  }

  /**
   * @throws {Error}
   */
  public async create(
    userId: string,
    name: string,
    description: string,
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db
  ) {
    return tx.insert(ThingTable).values({ userId, name, description }).returning({ thingId: ThingTable.id });
  }

  public async getThingPreviewsScheduledBetween(
    userId: string,
    from: Date,
    to: Date,
    limit: number | undefined = undefined,
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db
  ): Promise<ThingPreviewModel[]> {
    const query = tx
      .select({
        id: ThingTable.id,
        name: ThingTable.name,
        startTime: ScheduleTable.startTime,
        endTime: ScheduleTable.endTime,
        streak: StreakTable.count
      })
      .from(ThingTable)
      .innerJoin(ScheduleTable, eq(ThingTable.id, ScheduleTable.thingId))
      .innerJoin(StreakTable, eq(ThingTable.id, StreakTable.thingId))
      .innerJoin(NotificationTable, eq(ThingTable.id, NotificationTable.thingId))
      .innerJoin(ThingAccessTable, eq(ThingTable.id, ThingAccessTable.thingId))
      .where(and(between(NotificationTable.createdAt, from, to), eq(ThingAccessTable.userId, userId)));

    if (limit) {
      return query.limit(limit);
    } else {
      return query;
    }
  }

  public async getThingPreviews(
    userId: string,
    limit: number | undefined = undefined,
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db
  ): Promise<ThingPreviewModel[]> {
    const query = tx
      .select({
        id: ThingTable.id,
        name: ThingTable.name,
        startTime: ScheduleTable.startTime,
        endTime: ScheduleTable.endTime,
        streak: StreakTable.count
      })
      .from(ThingTable)
      .innerJoin(ScheduleTable, eq(ThingTable.id, ScheduleTable.thingId))
      .innerJoin(StreakTable, eq(ThingTable.id, StreakTable.thingId))
      .innerJoin(ThingAccessTable, eq(ThingTable.id, ThingAccessTable.thingId))
      .where(eq(ThingAccessTable.userId, userId));

    if (limit) {
      return query.limit(limit);
    } else {
      return query;
    }
  }

  public async getOthersThingImagesCreatedBetween(
    userId: string,
    from: Date,
    to: Date,
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db
  ) {
    return tx
      .select({
        id: ThingTable.id,
        name: ThingTable.name,
        username: UserTable.username,
        filename: ImageTable.filename,
        createdAt: ImageTable.createdAt
      })
      .from(ThingTable)
      .innerJoin(UserTable, eq(ThingTable.userId, UserTable.id))
      .innerJoin(ImageTable, eq(ThingTable.id, ImageTable.thingId))
      .innerJoin(ThingAccessTable, eq(ThingTable.id, ThingAccessTable.thingId))
      .where(
        and(
          //
          between(ImageTable.createdAt, from, to),
          eq(ThingAccessTable.userId, userId),
          ne(ImageTable.userId, userId)
        )
      );
  }
}

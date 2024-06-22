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
import { and, between, eq, ne, count, like, desc } from 'drizzle-orm';
import { SocialThingPreviewModel, ThingPreviewModel } from '../types/thing.types.js';

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

  /**
   * @throws {Error}
   */
  public async createSocial(
    userId: string,
    name: string,
    description: string,
    location: string,
    coverFilename: string,
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db
  ) {
    return tx
      .insert(ThingTable)
      .values({ userId, name, description, location, coverFilename, type: 'social' })
      .returning({ thingId: ThingTable.id });
  }

  public async getThingPreviewsScheduledBetween(
    userId: string,
    from: string,
    to: string,
    limit: number | undefined = undefined,
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db
  ): Promise<ThingPreviewModel[]> {
    const query = tx
      .selectDistinct({
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
      .where(
        and(
          between(NotificationTable.createdAt, from, to),
          eq(ThingAccessTable.userId, userId),
          eq(ThingTable.type, 'personal')
        )
      )
      .orderBy(ScheduleTable.startTime);

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
      .where(and(eq(ThingAccessTable.userId, userId), eq(ThingTable.type, 'personal')));

    if (limit) {
      return query.limit(limit);
    } else {
      return query;
    }
  }

  public async getSocialThingPreviews(
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db
  ): Promise<SocialThingPreviewModel[]> {
    const things = await tx
      .select({
        id: ThingTable.id,
        name: ThingTable.name,
        startTime: ScheduleTable.startTime,
        endTime: ScheduleTable.endTime,
        location: ThingTable.location,
        date: ScheduleTable.specificDate
      })
      .from(ThingTable)
      .innerJoin(ScheduleTable, eq(ThingTable.id, ScheduleTable.thingId))
      .where(eq(ThingTable.type, 'social'))
      .orderBy(desc(ThingTable.createdAt));

    const data: SocialThingPreviewModel[] = [];
    for (const thing of things) {
      const [{ userCount }] = await tx
        .select({ userCount: count(ThingAccessTable.userId) })
        .from(ThingAccessTable)
        .where(eq(ThingAccessTable.thingId, thing.id));

      const [{ coverImage }] = await tx
        .select({ coverImage: ImageTable.filename })
        .from(ImageTable)
        .where(and(eq(ImageTable.thingId, thing.id), like(ImageTable.filename, 'cover-%')));
      // @ts-expect-error location is not null
      data.push({ userCount, coverImage, ...thing });
    }

    return data;
  }

  public async getOthersThingImagesCreatedBetween(
    userId: string,
    from: string,
    to: string,
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
          ne(ImageTable.userId, userId),
          eq(ThingTable.type, 'personal')
        )
      );
  }
}

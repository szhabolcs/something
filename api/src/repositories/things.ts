import { and, eq, gte, lt, inArray, isNotNull, ne, asc, desc } from 'drizzle-orm';
import { db } from '../db/db.js';
import { ThingTable, ScheduleTable, ImageTable, SharingTable, StreakTable, UserTable } from '../db/schema.js';
import { union } from 'drizzle-orm/pg-core';

export async function getUserThingsToday(user_uuid: string, limit: number | undefined = undefined) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const userThings = db
    .select({
      uuid: ThingTable.id
    })
    .from(ThingTable)
    .where(eq(ThingTable.userId, user_uuid));

  const sharedThins = db
    .select({
      uuid: SharingTable.thingId
    })
    .from(SharingTable)
    .where(eq(SharingTable.userId, user_uuid));

  const sq = await union(userThings, sharedThins);

  if (sq.length === 0) return [];

  const query = db
    .select({
      uuid: ThingTable.id,
      name: ThingTable.name,
      streakCount: StreakTable.count,
      startTime: ScheduleTable.startTime,
      endTime: ScheduleTable.endTime
    })
    .from(ThingTable)
    .leftJoin(StreakTable, and(eq(ThingTable.id, StreakTable.thingId), eq(StreakTable.userId, user_uuid)))
    .leftJoin(ScheduleTable, eq(ThingTable.id, ScheduleTable.thingId))
    .leftJoin(ImageTable, eq(ThingTable.id, ImageTable.thingId))
    .where(
      and(
        inArray(
          ThingTable.id,
          sq.map((thing) => thing.uuid)
        ),
        and(gte(ImageTable.createdAt, startOfToday), lt(ImageTable.createdAt, endOfToday)),
        isNotNull(ScheduleTable.startTime),
        isNotNull(ScheduleTable.endTime),
        eq(ImageTable.userId, user_uuid)
      )
    )
    .orderBy(asc(ScheduleTable.startTime))
    .groupBy(ThingTable.id, ThingTable.name, StreakTable.count, ScheduleTable.startTime, ScheduleTable.endTime);

  let result;
  if (limit) {
    result = await query.limit(limit);
  } else {
    result = await query;
  }

  return result;
}

export async function getOthersThingsToday(user_uuid: string) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const userThings = db
    .select({
      uuid: ThingTable.id
    })
    .from(ThingTable)
    .where(eq(ThingTable.userId, user_uuid));

  const sharedThins = db
    .select({
      uuid: SharingTable.thingId
    })
    .from(SharingTable)
    .where(eq(SharingTable.userId, user_uuid));

  const sq = await union(userThings, sharedThins);

  if (sq.length === 0) return [];

  const query = db
    .select({
      username: UserTable.username,
      thingName: ThingTable.name,
      thingUuid: ThingTable.id,
      filename: ImageTable.filename
    })
    .from(ImageTable)
    .leftJoin(ThingTable, eq(ThingTable.id, ImageTable.thingId))
    .leftJoin(UserTable, eq(ImageTable.userId, UserTable.id))
    .where(
      and(
        inArray(
          ImageTable.thingId,
          sq.map((thing) => thing.uuid)
        ),
        ne(ImageTable.userId, user_uuid),
        gte(ImageTable.createdAt, startOfDay),
        lt(ImageTable.createdAt, endOfDay)
      )
    )
    .orderBy(desc(ImageTable.createdAt));

  const result = await query;

  // add domain to photoUuid
  return result.map((thing) => ({
    ...thing,
    photoUuid: `${process.env.API_HOST}/images/${thing.filename}`
  }));
}

export async function getUserThings(user_uuid: string) {
  const userThings = db
    .select({
      uuid: ThingTable.id
    })
    .from(ThingTable)
    .where(eq(ThingTable.userId, user_uuid));

  const sharedThins = db
    .select({
      uuid: SharingTable.thingId
    })
    .from(SharingTable)
    .where(eq(SharingTable.userId, user_uuid));

  const sq = await union(userThings, sharedThins);

  if (sq.length === 0) return [];

  const query = db
    .select({
      uuid: ThingTable.id,
      name: ThingTable.name,
      streakCount: StreakTable.count,
      startTime: ScheduleTable.startTime,
      endTime: ScheduleTable.endTime
    })
    .from(ThingTable)
    .leftJoin(StreakTable, and(eq(ThingTable.id, StreakTable.thingId), eq(StreakTable.userId, user_uuid)))
    .leftJoin(ScheduleTable, eq(ThingTable.id, ScheduleTable.thingId))
    .leftJoin(ImageTable, eq(ThingTable.id, ImageTable.thingId))
    .where(
      and(
        inArray(
          ThingTable.id,
          sq.map((thing) => thing.uuid)
        ),
        isNotNull(ScheduleTable.startTime),
        isNotNull(ScheduleTable.endTime),
        eq(ImageTable.userId, user_uuid)
      )
    )
    .orderBy(desc(ScheduleTable.startTime))
    .groupBy(ThingTable.id, ThingTable.name, StreakTable.count, ScheduleTable.startTime, ScheduleTable.endTime);

  const result = await query;

  return result;
}

export async function getThingDetails(user_uuid: string, thing_uuid: string) {
  // Step1: Get thing type
  const thingTypeQuery = await db
    .select({
      name: ThingTable.name,
      description: ThingTable.description,
      type: ThingTable.type
    })
    .from(ThingTable)
    .where(eq(ThingTable.id, thing_uuid));

  // Step2: Get next occurrence
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  let nextOccurrenceQuery;
  if (thingTypeQuery.length > 0 && thingTypeQuery[0].type === 'personal') {
    // Get next occurrence (today’s checkpoint start and end time)
    // We will need to join chekpoints and schedules
    nextOccurrenceQuery = await db
      .select({
        startTime: ScheduleTable.startTime,
        endTime: ScheduleTable.endTime
      })
      .from(ScheduleTable)
      .leftJoin(
        ImageTable,
        and(
          eq(ImageTable.thingId, thing_uuid),
          gte(ImageTable.createdAt, startOfDay),
          lt(ImageTable.createdAt, endOfDay)
        )
      )
      .where(eq(ScheduleTable.thingId, thing_uuid))
      .groupBy(ScheduleTable.thingId, ScheduleTable.startTime, ScheduleTable.endTime, ImageTable.createdAt)
      .orderBy(asc(ImageTable.createdAt));
  }

  // Step3: Get list of people shared with
  const sharedWithQuery = await db
    .select({
      userUuid: SharingTable.userId,
      username: UserTable.username
    })
    .from(SharingTable)
    .leftJoin(UserTable, eq(SharingTable.userId, UserTable.id))
    .where(eq(SharingTable.thingId, thing_uuid));

  // Step4: Previous checkpoints (username, thing name, image url)
  // we will need to join chekpoints and schedules and things
  const previousCheckpointsQuery = await db
    .select({
      username: UserTable.username,
      thingName: ThingTable.name,
      filename: ImageTable.filename
    })
    .from(ImageTable)
    .leftJoin(UserTable, eq(ImageTable.userId, UserTable.id))
    .leftJoin(ThingTable, eq(ImageTable.thingId, ThingTable.id))
    .leftJoin(ScheduleTable, eq(ThingTable.id, ScheduleTable.thingId))
    .where(and(eq(ScheduleTable.thingId, thing_uuid)))
    .orderBy(desc(ImageTable.createdAt));

  // Alter the previous checkpoints query (add domain)
  previousCheckpointsQuery.map((checkpoint) => {
    checkpoint.filename = `${process.env.API_HOST}/images/${checkpoint.filename}`;
  });

  // Combine the above queries
  const result = {
    ...thingTypeQuery[0],
    nextOccurrence: nextOccurrenceQuery?.at(0),
    sharedWith: sharedWithQuery,
    previousCheckpoints: previousCheckpointsQuery
  };

  return result;
}

import {
  and,
  eq,
  gte,
  lt,
  inArray,
  isNotNull,
  ne,
  asc,
  desc
} from 'drizzle-orm';
import { db } from '../db/db.js';
import {
  ThingTable,
  ScheduleTable,
  CheckpointTable,
  SharingTable,
  StreakTable,
  UserTable
} from '../db/schema.js';
import { union } from 'drizzle-orm/pg-core';

export async function getUserThingsToday(
  user_uuid: string,
  limit: number | undefined = undefined
) {
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
    .leftJoin(
      StreakTable,
      and(
        eq(ThingTable.id, StreakTable.thingId),
        eq(StreakTable.userId, user_uuid)
      )
    )
    .leftJoin(ScheduleTable, eq(ThingTable.id, ScheduleTable.thingId))
    .leftJoin(CheckpointTable, eq(ThingTable.id, CheckpointTable.thingId))
    .where(
      and(
        inArray(
          ThingTable.id,
          sq.map((thing) => thing.uuid)
        ),
        and(
          gte(CheckpointTable.createdAt, startOfToday),
          lt(CheckpointTable.createdAt, endOfToday)
        ),
        isNotNull(ScheduleTable.startTime),
        isNotNull(ScheduleTable.endTime),
        eq(CheckpointTable.userId, user_uuid)
      )
    )
    .orderBy(asc(ScheduleTable.startTime))
    .groupBy(
      ThingTable.id,
      ThingTable.name,
      StreakTable.count,
      ScheduleTable.startTime,
      ScheduleTable.endTime
    );

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
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );

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
      filename: CheckpointTable.filename
    })
    .from(CheckpointTable)
    .leftJoin(ThingTable, eq(ThingTable.id, CheckpointTable.thingId))
    .leftJoin(UserTable, eq(CheckpointTable.userId, UserTable.id))
    .where(
      and(
        inArray(
          CheckpointTable.thingId,
          sq.map((thing) => thing.uuid)
        ),
        ne(CheckpointTable.userId, user_uuid),
        gte(CheckpointTable.createdAt, startOfDay),
        lt(CheckpointTable.createdAt, endOfDay)
      )
    )
    .orderBy(desc(CheckpointTable.createdAt));

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
    .leftJoin(
      StreakTable,
      and(
        eq(ThingTable.id, StreakTable.thingId),
        eq(StreakTable.userId, user_uuid)
      )
    )
    .leftJoin(ScheduleTable, eq(ThingTable.id, ScheduleTable.thingId))
    .leftJoin(CheckpointTable, eq(ThingTable.id, CheckpointTable.thingId))
    .where(
      and(
        inArray(
          ThingTable.id,
          sq.map((thing) => thing.uuid)
        ),
        isNotNull(ScheduleTable.startTime),
        isNotNull(ScheduleTable.endTime),
        eq(CheckpointTable.userId, user_uuid)
      )
    )
    .orderBy(desc(ScheduleTable.startTime))
    .groupBy(
      ThingTable.id,
      ThingTable.name,
      StreakTable.count,
      ScheduleTable.startTime,
      ScheduleTable.endTime
    );

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
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );

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
        CheckpointTable,
        and(
          eq(CheckpointTable.thingId, thing_uuid),
          gte(CheckpointTable.createdAt, startOfDay),
          lt(CheckpointTable.createdAt, endOfDay)
        )
      )
      .where(eq(ScheduleTable.thingId, thing_uuid))
      .groupBy(
        ScheduleTable.thingId,
        ScheduleTable.startTime,
        ScheduleTable.endTime,
        CheckpointTable.createdAt
      )
      .orderBy(asc(CheckpointTable.createdAt));
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
      filename: CheckpointTable.filename
    })
    .from(CheckpointTable)
    .leftJoin(UserTable, eq(CheckpointTable.userId, UserTable.id))
    .leftJoin(ThingTable, eq(CheckpointTable.thingId, ThingTable.id))
    .leftJoin(ScheduleTable, eq(ThingTable.id, ScheduleTable.thingId))
    .where(and(eq(ScheduleTable.thingId, thing_uuid)))
    .orderBy(desc(CheckpointTable.createdAt));

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

export async function createThing(
  user_uuid: string,
  name: string,
  description: string,
  occurances: any[] | null, // [{start, end, repeat, dayOfWeek}] only if user is not org
  sharedUsernames: string[]
) {
  // Step1: Create thing
  const newThing = await db
    .insert(ThingTable)
    .values({
      name: name,
      userId: user_uuid,
      description: description,
      type: 'personal'
    })
    .returning();

  // Step2: Add shared people to sharing table
  for (const username of sharedUsernames) {
    const sharedUserId = (
      await db
        .select({ uuid: UserTable.id })
        .from(UserTable)
        .where(eq(UserTable.username, username))
    )[0].uuid;
    await db
      .insert(SharingTable)
      .values({
        userId: sharedUserId,
        thingId: newThing[0].id
      })
      .returning();
  }

  // Get all users that the thing is shared with and the current user
  const usersWithThing = await db
    .select({ uuid: UserTable.id })
    .from(SharingTable)
    .innerJoin(UserTable, eq(SharingTable.userId, UserTable.id))
    .innerJoin(ThingTable, eq(ThingTable.id, SharingTable.thingId))
    .where(eq(SharingTable.thingId, newThing[0].id));

  // Add the current user to the list
  usersWithThing.push({ uuid: user_uuid });

  // Step2: Create schedules
  if (occurances) {
    for (const occurrence of occurances) {
      if (occurrence.repeat === 'once' || occurrence.repeat === 'daily') {
        occurrence.dayOfWeek = ['mon']; // arbitrary day
      }

      for (const day of occurrence.dayOfWeek) {
        await db
          .insert(ScheduleTable)
          .values({
            thingId: newThing[0].id,
            startTime: occurrence.startTime,
            endTime: occurrence.endTime,
            repeat: occurrence.repeat,
            dayOfWeek: day
          })
          .returning();
      }
    }
  }

  // Step3: Create, streak, and checkpoints for each user
  for (const userWithThing of usersWithThing) {
    // Create streak
    await db
      .insert(StreakTable)
      .values({
        userId: userWithThing.uuid,
        thingId: newThing[0].id,
        count: 0
      })
      .returning();

    // Add one checkpoint (create) for every user that has the thing

    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const timestamps: Date[] = [];

    if (occurances) {
      for (const occurrence of occurances) {
        if (occurrence.repeat === 'once' || occurrence.repeat === 'daily') {
          const [hours, minutes, seconds] = occurrence.startTime
            .split(':')
            .map(Number);
          const startTime = new Date(currentDate);
          startTime.setHours(hours);
          startTime.setMinutes(minutes);
          startTime.setSeconds(seconds);
          startTime.setMilliseconds(0);
          timestamps.push(startTime);
        } else if (occurrence.repeat === 'weekly') {
          for (const day of occurrence.dayOfWeek) {
            const dayIndex = getDayIndex(day);
            const diff = (dayIndex - currentDay + 7) % 7;
            const [hours, minutes, seconds] = occurrence.startTime
              .split(':')
              .map(Number);
            const startTime = new Date(currentDate);
            startTime.setDate(startTime.getDate() + diff);
            startTime.setHours(hours);
            startTime.setMinutes(minutes);
            startTime.setSeconds(seconds);
            startTime.setMilliseconds(0);
            timestamps.push(startTime);
          }
        } else if (occurrence.repeat === 'monthly') {
          const [hours, minutes, seconds] = occurrence.startTime
            .split(':')
            .map(Number);
          const startTime = new Date(currentDate);
          const dayOfMonth = occurrence.dayOfWeek[0];
          startTime.setDate(getDayOfMonth(startTime, dayOfMonth));
          startTime.setHours(hours);
          startTime.setMinutes(minutes);
          startTime.setSeconds(seconds);
          startTime.setMilliseconds(0);
          if (startTime < currentDate) {
            startTime.setMonth(startTime.getMonth() + 1);
          }
          timestamps.push(startTime);
        }
      }
    }

    for (const timestamp of timestamps) {
      // TEMPORARY: Add checkpoints for the next 7 days
      for (let i = 0; i < 7; i++) {
        await db.insert(CheckpointTable).values({
          userId: userWithThing.uuid,
          thingId: newThing[0].id,
          createdAt: timestamp,
          filename: null
        });
        timestamp.setDate(timestamp.getDate() + 1);
      }
    }
  }
}

function getDayIndex(day: string): number {
  const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return daysOfWeek.indexOf(day.toLowerCase());
}

function getDayOfMonth(date: Date, dayOfWeek: string): number {
  const targetDayIndex = getDayIndex(dayOfWeek);
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayOfMonthIndex = firstDayOfMonth.getDay();
  const diff = (targetDayIndex - firstDayOfMonthIndex + 7) % 7;
  return 1 + diff;
}

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
      uuid: ThingTable.uuid
    })
    .from(ThingTable)
    .where(eq(ThingTable.userUuid, user_uuid));

  const sharedThins = db
    .select({
      uuid: SharingTable.thingUuid
    })
    .from(SharingTable)
    .where(eq(SharingTable.userUuid, user_uuid));

  const sq = await union(userThings, sharedThins);

  if (sq.length === 0) return [];

  const query = db
    .select({
      uuid: ThingTable.uuid,
      name: ThingTable.name,
      streakCount: StreakTable.count,
      startTime: ScheduleTable.startTime,
      endTime: ScheduleTable.endTime
    })
    .from(ThingTable)
    .leftJoin(
      StreakTable,
      and(
        eq(ThingTable.uuid, StreakTable.thingUuid),
        eq(StreakTable.userUuid, user_uuid)
      )
    )
    .leftJoin(ScheduleTable, eq(ThingTable.uuid, ScheduleTable.thingUuid))
    .leftJoin(CheckpointTable, eq(ThingTable.uuid, CheckpointTable.thingUuid))
    .where(
      and(
        inArray(
          ThingTable.uuid,
          sq.map((thing) => thing.uuid)
        ),
        and(
          gte(CheckpointTable.createdAt, startOfToday),
          lt(CheckpointTable.createdAt, endOfToday)
        ),
        isNotNull(ScheduleTable.startTime),
        isNotNull(ScheduleTable.endTime),
        eq(CheckpointTable.userUuid, user_uuid)
      )
    )
    .orderBy(asc(ScheduleTable.startTime))
    .groupBy(
      ThingTable.uuid,
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
      uuid: ThingTable.uuid
    })
    .from(ThingTable)
    .where(eq(ThingTable.userUuid, user_uuid));

  const sharedThins = db
    .select({
      uuid: SharingTable.thingUuid
    })
    .from(SharingTable)
    .where(eq(SharingTable.userUuid, user_uuid));

  const sq = await union(userThings, sharedThins);

  if (sq.length === 0) return [];

  const query = db
    .select({
      username: UserTable.username,
      thingName: ThingTable.name,
      thingUuid: ThingTable.uuid,
      filename: CheckpointTable.filename
    })
    .from(CheckpointTable)
    .leftJoin(ThingTable, eq(ThingTable.uuid, CheckpointTable.thingUuid))
    .leftJoin(UserTable, eq(CheckpointTable.userUuid, UserTable.uuid))
    .where(
      and(
        inArray(
          CheckpointTable.thingUuid,
          sq.map((thing) => thing.uuid)
        ),
        ne(CheckpointTable.userUuid, user_uuid),
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
      uuid: ThingTable.uuid
    })
    .from(ThingTable)
    .where(eq(ThingTable.userUuid, user_uuid));

  const sharedThins = db
    .select({
      uuid: SharingTable.thingUuid
    })
    .from(SharingTable)
    .where(eq(SharingTable.userUuid, user_uuid));

  const sq = await union(userThings, sharedThins);

  if (sq.length === 0) return [];

  const query = db
    .select({
      uuid: ThingTable.uuid,
      name: ThingTable.name,
      streakCount: StreakTable.count,
      startTime: ScheduleTable.startTime,
      endTime: ScheduleTable.endTime
    })
    .from(ThingTable)
    .leftJoin(
      StreakTable,
      and(
        eq(ThingTable.uuid, StreakTable.thingUuid),
        eq(StreakTable.userUuid, user_uuid)
      )
    )
    .leftJoin(ScheduleTable, eq(ThingTable.uuid, ScheduleTable.thingUuid))
    .leftJoin(CheckpointTable, eq(ThingTable.uuid, CheckpointTable.thingUuid))
    .where(
      and(
        inArray(
          ThingTable.uuid,
          sq.map((thing) => thing.uuid)
        ),
        isNotNull(ScheduleTable.startTime),
        isNotNull(ScheduleTable.endTime),
        eq(CheckpointTable.userUuid, user_uuid)
      )
    )
    .orderBy(desc(ScheduleTable.startTime))
    .groupBy(
      ThingTable.uuid,
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
    .where(eq(ThingTable.uuid, thing_uuid));

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
          eq(CheckpointTable.thingUuid, thing_uuid),
          gte(CheckpointTable.createdAt, startOfDay),
          lt(CheckpointTable.createdAt, endOfDay)
        )
      )
      .where(eq(ScheduleTable.thingUuid, thing_uuid))
      .groupBy(
        ScheduleTable.thingUuid,
        ScheduleTable.startTime,
        ScheduleTable.endTime,
        CheckpointTable.createdAt
      )
      .orderBy(asc(CheckpointTable.createdAt));
  }

  // Step3: Get list of people shared with
  const sharedWithQuery = await db
    .select({
      userUuid: SharingTable.userUuid,
      username: UserTable.username
    })
    .from(SharingTable)
    .leftJoin(UserTable, eq(SharingTable.userUuid, UserTable.uuid))
    .where(eq(SharingTable.thingUuid, thing_uuid));

  // Step4: Previous checkpoints (username, thing name, image url)
  // we will need to join chekpoints and schedules and things
  const previousCheckpointsQuery = await db
    .select({
      username: UserTable.username,
      thingName: ThingTable.name,
      filename: CheckpointTable.filename
    })
    .from(CheckpointTable)
    .leftJoin(UserTable, eq(CheckpointTable.userUuid, UserTable.uuid))
    .leftJoin(ThingTable, eq(CheckpointTable.thingUuid, ThingTable.uuid))
    .leftJoin(ScheduleTable, eq(ThingTable.uuid, ScheduleTable.thingUuid))
    .where(and(eq(ScheduleTable.thingUuid, thing_uuid)))
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
      userUuid: user_uuid,
      description: description,
      type: 'personal'
    })
    .returning();

  // Step2: Add shared people to sharing table
  for (const username of sharedUsernames) {
    const sharedUserId = (
      await db
        .select({ uuid: UserTable.uuid })
        .from(UserTable)
        .where(eq(UserTable.username, username))
    )[0].uuid;
    await db
      .insert(SharingTable)
      .values({
        userUuid: sharedUserId,
        thingUuid: newThing[0].uuid
      })
      .returning();
  }

  // Get all users that the thing is shared with and the current user
  const usersWithThing = await db
    .select({ uuid: UserTable.uuid })
    .from(SharingTable)
    .innerJoin(UserTable, eq(SharingTable.userUuid, UserTable.uuid))
    .innerJoin(ThingTable, eq(ThingTable.uuid, SharingTable.thingUuid))
    .where(eq(SharingTable.thingUuid, newThing[0].uuid));

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
            thingUuid: newThing[0].uuid,
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
        userUuid: userWithThing.uuid,
        thingUuid: newThing[0].uuid,
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
          userUuid: userWithThing.uuid,
          thingUuid: newThing[0].uuid,
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

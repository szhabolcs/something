import {
  and,
  eq,
  gte,
  lt,
  or,
  isNull,
  inArray,
  isNotNull,
  ne,
  asc,
  desc,
  sql,
} from "drizzle-orm";
import { db } from "../db/db.js";
import {
  thing,
  schedule,
  checkpoint,
  sharing,
  streak,
  user,
} from "../db/schema.js";
import { union } from "drizzle-orm/pg-core";

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
      uuid: thing.uuid,
    })
    .from(thing)
    .where(eq(thing.userUuid, user_uuid));

  const sharedThins = db
    .select({
      uuid: sharing.thingUuid,
    })
    .from(sharing)
    .where(eq(sharing.userUuid, user_uuid));

  const sq = await union(userThings, sharedThins);

  if (sq.length === 0) return [];

  const query = db
    .select({
      uuid: thing.uuid,
      name: thing.name,
      streakCount: streak.count,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    })
    .from(thing)
    .leftJoin(streak, and(eq(thing.uuid, streak.thingUuid), eq(streak.userUuid, user_uuid)))
    .leftJoin(schedule, eq(thing.uuid, schedule.thingUuid))
    .leftJoin(checkpoint, eq(thing.uuid, checkpoint.thingUuid))
    .where(
      and(
        inArray(
          thing.uuid,
          sq.map((thing) => thing.uuid)
        ),
        and(
          gte(checkpoint.utcTimestamp, startOfToday),
          lt(checkpoint.utcTimestamp, endOfToday)
        ),
        eq(checkpoint.completed, false),
        isNotNull(schedule.startTime),
        isNotNull(schedule.endTime),
        eq(checkpoint.userUuid, user_uuid)
      )
    )
    .orderBy(desc(schedule.startTime))
    .groupBy(thing.uuid, thing.name, streak.count, schedule.startTime, schedule.endTime);

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
      uuid: thing.uuid,
    })
    .from(thing)
    .where(eq(thing.userUuid, user_uuid));

  const sharedThins = db
    .select({
      uuid: sharing.thingUuid,
    })
    .from(sharing)
    .where(eq(sharing.userUuid, user_uuid));

  const sq = await union(userThings, sharedThins);

  if (sq.length === 0) return [];

  const query = db
    .select({
      username: user.username,
      thingName: thing.name,
      thingUuid: thing.uuid,
      photoUuid: checkpoint.photoUuid,
    })
    .from(checkpoint)
    .leftJoin(thing, eq(thing.uuid, checkpoint.thingUuid))
    .leftJoin(user, eq(checkpoint.userUuid, user.uuid))
    .where(
      and(
        inArray(
          checkpoint.thingUuid,
          sq.map((thing) => thing.uuid)
        ),
        ne(checkpoint.userUuid, user_uuid),
        gte(checkpoint.utcTimestamp, startOfDay),
        lt(checkpoint.utcTimestamp, endOfDay),
        eq(checkpoint.completed, true)
      )
    )
    .orderBy(desc(checkpoint.createdAt));

  const result = await query;

  // add domain to photoUuid
  return result.map((thing) => ({
    ...thing,
    photoUuid: `${process.env.API_HOST}/images/${thing.photoUuid}`,
  }));
}

export async function getUserThings(user_uuid: string) {
  const userThings = db
    .select({
      uuid: thing.uuid,
    })
    .from(thing)
    .where(eq(thing.userUuid, user_uuid));

  const sharedThins = db
    .select({
      uuid: sharing.thingUuid,
    })
    .from(sharing)
    .where(eq(sharing.userUuid, user_uuid));

  const sq = await union(userThings, sharedThins);

  if (sq.length === 0) return [];

  const query = db
    .select({
      uuid: thing.uuid,
      name: thing.name,
      streakCount: streak.count,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    })
    .from(thing)
    .leftJoin(streak, and(eq(thing.uuid, streak.thingUuid), eq(streak.userUuid, user_uuid)))
    .leftJoin(schedule, eq(thing.uuid, schedule.thingUuid))
    .leftJoin(checkpoint, eq(thing.uuid, checkpoint.thingUuid))
    .where(
      and(
        inArray(
          thing.uuid,
          sq.map((thing) => thing.uuid)
        ),
        eq(checkpoint.completed, false),
        isNotNull(schedule.startTime),
        isNotNull(schedule.endTime),
        eq(checkpoint.userUuid, user_uuid)
      )
    )
    .orderBy(desc(schedule.startTime))
    .groupBy(thing.uuid, thing.name, streak.count, schedule.startTime, schedule.endTime);

  const result = await query;

  return result;
}

export async function getThingDetails(user_uuid: string, thing_uuid: string) {
  // Step1: Get thing type
  const thingTypeQuery = await db
    .select({
      name: thing.name,
      description: thing.description,
      type: thing.type,
    })
    .from(thing)
    .where(eq(thing.uuid, thing_uuid));

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
  if (thingTypeQuery.length > 0 && thingTypeQuery[0].type === "personal") {
    // Get next occurrence (today’s checkpoint start and end time)
    // We will need to join chekpoints and schedules
    nextOccurrenceQuery = await db
      .select({
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      })
      .from(schedule)
      .leftJoin(
        checkpoint,
        and(
          eq(checkpoint.thingUuid, thing_uuid),
          gte(checkpoint.utcTimestamp, startOfDay),
          lt(checkpoint.utcTimestamp, endOfDay)
        )
      )
      .where(eq(schedule.thingUuid, thing_uuid))
      .groupBy(
        schedule.thingUuid,
        schedule.startTime,
        schedule.endTime,
        checkpoint.utcTimestamp
      )
      .orderBy(asc(checkpoint.utcTimestamp));
  }

  // Step3: Get list of people shared with
  const sharedWithQuery = await db
    .select({
      userUuid: sharing.userUuid,
      username: user.username,
    })
    .from(sharing)
    .leftJoin(user, eq(sharing.userUuid, user.uuid))
    .where(eq(sharing.thingUuid, thing_uuid));

  // Step4: Previous checkpoints (username, thing name, image url)
  // we will need to join chekpoints and schedules and things
  const previousCheckpointsQuery = await db
    .select({
      username: user.username,
      thingName: thing.name,
      photoUuid: checkpoint.photoUuid,
    })
    .from(checkpoint)
    .leftJoin(user, eq(checkpoint.userUuid, user.uuid))
    .leftJoin(thing, eq(checkpoint.thingUuid, thing.uuid))
    .leftJoin(schedule, eq(thing.uuid, schedule.thingUuid))
    .where(
      and(eq(schedule.thingUuid, thing_uuid), eq(checkpoint.completed, true))
    )
    .orderBy(desc(checkpoint.createdAt));

  // Alter the previous checkpoints query (add domain)
  previousCheckpointsQuery.map((checkpoint) => {
    checkpoint.photoUuid = `${process.env.API_HOST}/images/${checkpoint.photoUuid}`;
  });

  // Combine the above queries
  const result = {
    ...thingTypeQuery[0],
    nextOccurrence: nextOccurrenceQuery?.at(0),
    sharedWith: sharedWithQuery,
    previousCheckpoints: previousCheckpointsQuery,
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
    .insert(thing)
    .values({
      name: name,
      userUuid: user_uuid,
      description: description,
      type: "personal",
    })
    .returning();

  // Step2: Add shared people to sharing table
  for (const username of sharedUsernames) {
    const sharedUserId = (
      await db
        .select({ uuid: user.uuid })
        .from(user)
        .where(eq(user.username, username))
    )[0].uuid;
    await db
      .insert(sharing)
      .values({
        userUuid: sharedUserId,
        thingUuid: newThing[0].uuid,
      })
      .returning();
  }

  // Get all users that the thing is shared with and the current user
  const usersWithThing = await db
    .select({ uuid: user.uuid })
    .from(sharing)
    .innerJoin(user, eq(sharing.userUuid, user.uuid))
    .innerJoin(thing, eq(thing.uuid, sharing.thingUuid))
    .where(eq(sharing.thingUuid, newThing[0].uuid));

  // Add the current user to the list
  usersWithThing.push({ uuid: user_uuid });

  // Step2: Create schedules
  if (occurances) {
    for (const occurrence of occurances) {
      if (occurrence.repeat === "once" || occurrence.repeat === "daily") {
        occurrence.dayOfWeek = ["mon"]; // arbitrary day
      }

      for (const day of occurrence.dayOfWeek) {
        await db
          .insert(schedule)
          .values({
            thingUuid: newThing[0].uuid,
            startTime: occurrence.startTime,
            endTime: occurrence.endTime,
            repeat: occurrence.repeat,
            dayOfWeek: day,
          })
          .returning();
      }
    }
  }

  // Step3: Create, streak, and checkpoints for each user
  for (const userWithThing of usersWithThing) {
    // Create streak
    await db
      .insert(streak)
      .values({
        userUuid: userWithThing.uuid,
        thingUuid: newThing[0].uuid,
        count: 0,
      })
      .returning();

    // Add one checkpoint (create) for every user that has the thing

    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const timestamps: Date[] = [];

    if (occurances) {
      for (const occurrence of occurances) {
        if (occurrence.repeat === "once" || occurrence.repeat === "daily") {
          const [hours, minutes, seconds] = occurrence.startTime
            .split(":")
            .map(Number);
          const startTime = new Date(currentDate);
          startTime.setHours(hours);
          startTime.setMinutes(minutes);
          startTime.setSeconds(seconds);
          startTime.setMilliseconds(0);
          timestamps.push(startTime);
        } else if (occurrence.repeat === "weekly") {
          for (const day of occurrence.dayOfWeek) {
            const dayIndex = getDayIndex(day);
            const diff = (dayIndex - currentDay + 7) % 7;
            const [hours, minutes, seconds] = occurrence.startTime
              .split(":")
              .map(Number);
            const startTime = new Date(currentDate);
            startTime.setDate(startTime.getDate() + diff);
            startTime.setHours(hours);
            startTime.setMinutes(minutes);
            startTime.setSeconds(seconds);
            startTime.setMilliseconds(0);
            timestamps.push(startTime);
          }
        } else if (occurrence.repeat === "monthly") {
          const [hours, minutes, seconds] = occurrence.startTime
            .split(":")
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
        await db
          .insert(checkpoint)
          .values({
            userUuid: userWithThing.uuid,
            thingUuid: newThing[0].uuid,
            utcTimestamp: timestamp,
            photoUuid: null,
            completed: false,
          });
        timestamp.setDate(timestamp.getDate() + 1);
      }
    }
  }
}

function getDayIndex(day: string): number {
  const daysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return daysOfWeek.indexOf(day.toLowerCase());
}

function getDayOfMonth(date: Date, dayOfWeek: string): number {
  const targetDayIndex = getDayIndex(dayOfWeek);
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayOfMonthIndex = firstDayOfMonth.getDay();
  const diff = (targetDayIndex - firstDayOfMonthIndex + 7) % 7;
  return 1 + diff;
}

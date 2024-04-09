import { eq, and, isNotNull, gte, lt } from "drizzle-orm";
import { db } from "../db/db.js";
import {
  user,
  checkpoint,
  thing,
  streak,
  point,
  sharing,
} from "../db/schema.js";

export async function updateCheckpoint(
  user_uuid: string,
  thing_uuid: string,
  photoUuid: string
) {
  const [previousCheckpoint] = await db
    .select()
    .from(checkpoint)
    .where(
      and(
        eq(checkpoint.userUuid, user_uuid),
        eq(checkpoint.thingUuid, thing_uuid),
        isNotNull(checkpoint.photoUuid)
      )
    );

  if (previousCheckpoint) {
    // If the user has already completed this checkpoint, we need to create a new one
    await db.insert(checkpoint).values({
      userUuid: user_uuid,
      thingUuid: previousCheckpoint.thingUuid,
      utcTimestamp: previousCheckpoint.utcTimestamp,
      photoUuid: photoUuid,
      completed: true,
    });

    await updateStreak(user_uuid, thing_uuid);
    await updatePoints(user_uuid, 5);
  }
  // If the user has not completed this checkpoint, we need to update the existing one
  else {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    await db
      .update(checkpoint)
      .set({
        completed: true,
        photoUuid: photoUuid,
      })
      .where(
        and(
          eq(checkpoint.userUuid, user_uuid),
          eq(checkpoint.thingUuid, thing_uuid),
          // on the same day as today
          and(
            gte(checkpoint.utcTimestamp, startOfToday),
            lt(checkpoint.utcTimestamp, endOfToday)
          )
        )
      );

    await updateStreak(user_uuid, thing_uuid);
    await updatePoints(user_uuid);
  }
}

async function updateStreak(user_uuid: string, thing_uuid: string) {
  // update streak
  const [currentStreak] = await db
    .select()
    .from(streak)
    .where(
      and(eq(streak.userUuid, user_uuid), eq(streak.thingUuid, thing_uuid))
    );

  if (currentStreak) {
    await db
      .update(streak)
      .set({
        count: currentStreak.count + 1,
      })
      .where(
        and(eq(streak.userUuid, user_uuid), eq(streak.thingUuid, thing_uuid))
      );
  }
}

async function updatePoints(user_uuid: string, by: number = 10) {
  const [currentPoints] = await db
    .select()
    .from(point)
    .where(eq(point.userUuid, user_uuid));

  if (currentPoints) {
    await db
      .update(point)
      .set({
        point: currentPoints.point + by,
      })
      .where(eq(point.userUuid, user_uuid));
  }
}

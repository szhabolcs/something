import { eq, and, isNotNull, gte, lt } from 'drizzle-orm';
import { db } from '../db/db.js';
import {
  UserTable,
  CheckpointTable,
  ThingTable,
  StreakTable,
  ScoreTable,
  SharingTable
} from '../db/schema.js';

export async function updateCheckpoint(
  user_uuid: string,
  thing_uuid: string,
  filename: string
) {
  const [previousCheckpoint] = await db
    .select()
    .from(CheckpointTable)
    .where(
      and(
        eq(CheckpointTable.userUuid, user_uuid),
        eq(CheckpointTable.thingUuid, thing_uuid),
        isNotNull(CheckpointTable.filename)
      )
    );

  if (previousCheckpoint) {
    // If the user has already completed this checkpoint, we need to create a new one
    await db.insert(CheckpointTable).values({
      userUuid: user_uuid,
      thingUuid: previousCheckpoint.thingUuid,
      filename
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
      .update(CheckpointTable)
      .set({ filename })
      .where(
        and(
          eq(CheckpointTable.userUuid, user_uuid),
          eq(CheckpointTable.thingUuid, thing_uuid),
          // on the same day as today
          and(
            gte(CheckpointTable.createdAt, startOfToday),
            lt(CheckpointTable.createdAt, endOfToday)
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
    .from(StreakTable)
    .where(
      and(
        eq(StreakTable.userUuid, user_uuid),
        eq(StreakTable.thingUuid, thing_uuid)
      )
    );

  if (currentStreak) {
    await db
      .update(StreakTable)
      .set({
        count: currentStreak.count + 1
      })
      .where(
        and(
          eq(StreakTable.userUuid, user_uuid),
          eq(StreakTable.thingUuid, thing_uuid)
        )
      );
  }
}

async function updatePoints(user_uuid: string, by: number = 10) {
  const [currentPoints] = await db
    .select()
    .from(ScoreTable)
    .where(eq(ScoreTable.userUuid, user_uuid));

  if (currentPoints) {
    await db
      .update(ScoreTable)
      .set({
        value: currentPoints.value + by
      })
      .where(eq(ScoreTable.userUuid, user_uuid));
  }
}

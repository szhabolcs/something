import { eq, desc } from 'drizzle-orm';
import { db } from '../db/db.js';
import { UserTable, LevelDefinitionTable, ScoreTable } from '../db/schema.js';
import { union } from 'drizzle-orm/pg-core';

export async function getLeaderBoard(limit: number = 100) {
  return await db
    .select({
      username: UserTable.username,
      points: ScoreTable.value
    })
    .from(ScoreTable)
    .leftJoin(UserTable, eq(UserTable.uuid, ScoreTable.userUuid))
    .where(eq(ScoreTable.public, true))
    .orderBy(desc(ScoreTable.value))
    .limit(limit);
}

export async function currentLeaderBoardVisibility(uuid: string) {
  return await db
    .select({ visibility: ScoreTable.public })
    .from(ScoreTable)
    .where(eq(ScoreTable.userUuid, uuid))
    .limit(1);
}

export async function toggleLeaderboardVisibility(uuid: string) {
  const visibility = await db
    .select({ visibility: ScoreTable.public })
    .from(ScoreTable)
    .where(eq(ScoreTable.userUuid, uuid))
    .limit(1);

  if (visibility[0].visibility) {
    return await db
      .update(ScoreTable)
      .set({ public: false })
      .where(eq(ScoreTable.userUuid, uuid));
  } else {
    return await db
      .update(ScoreTable)
      .set({ public: true })
      .where(eq(ScoreTable.userUuid, uuid));
  }
}

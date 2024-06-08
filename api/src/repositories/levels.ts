import { eq, desc, lte, gte } from 'drizzle-orm';
import { db } from '../db/db.js';
import { UserTable, LevelDefinitionTable, ScoreTable } from '../db/schema.js';
import { union } from 'drizzle-orm/pg-core';

export async function getLevels(user_uuid: string) {
  const userPoints = await db
    .select({ points: ScoreTable.value })
    .from(ScoreTable)
    .where(eq(ScoreTable.userUuid, user_uuid));

  const currentLevel = await db
    .select({
      level: LevelDefinitionTable.name,
      minThreshold: LevelDefinitionTable.minThreshold
    })
    .from(LevelDefinitionTable)
    .where(lte(LevelDefinitionTable.minThreshold, userPoints[0].points))
    .orderBy(desc(LevelDefinitionTable.minThreshold))
    .limit(1);

  const nextLevel = await db
    .select({
      level: LevelDefinitionTable.name,
      minThreshold: LevelDefinitionTable.minThreshold
    })
    .from(LevelDefinitionTable)
    .where(gte(LevelDefinitionTable.minThreshold, userPoints[0].points + 1))
    .orderBy(LevelDefinitionTable.minThreshold)
    .limit(1);

  return {
    currentLevel: currentLevel[0],
    nextLevel: nextLevel[0],
    currentPoints: userPoints[0].points
  };
}

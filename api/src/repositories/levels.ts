import { eq, desc, lte, gte } from "drizzle-orm";
import { db } from "./db";
import { user, levelDefinition, point } from "./schema";
import { union } from "drizzle-orm/pg-core";

export async function getLevels(user_uuid: string) {
  const userPoints = await db
    .select({ points: point.point })
    .from(point)
    .where(eq(point.userUuid, user_uuid));

  const currentLevel = await db
    .select({
      level: levelDefinition.name,
      minThreshold: levelDefinition.minThreshold,
    })
    .from(levelDefinition)
    .where(lte(levelDefinition.minThreshold, userPoints[0].points))
    .orderBy(desc(levelDefinition.minThreshold))
    .limit(1);

  const nextLevel = await db
    .select({
      level: levelDefinition.name,
      minThreshold: levelDefinition.minThreshold,
    })
    .from(levelDefinition)
    .where(gte(levelDefinition.minThreshold, userPoints[0].points + 1))
    .orderBy(levelDefinition.minThreshold)
    .limit(1);

  return {
    currentLevel: currentLevel[0],
    nextLevel: nextLevel[0],
  };
}

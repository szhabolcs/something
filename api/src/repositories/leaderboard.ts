import { eq, desc } from "drizzle-orm";
import { db } from "../db/db.js";
import { user, levelDefinition, point } from "../db/schema.js";
import { union } from "drizzle-orm/pg-core";

export async function getLeaderBoard(limit: number = 100) {
  return await db
    .select({
      username: user.username,
      points: point.point,
    })
    .from(point)
    .leftJoin(user, eq(user.uuid, point.userUuid))
    .where(eq(point.public, true))
    .orderBy(desc(point.point))
    .limit(limit);
}

export async function currentLeaderBoardVisibility(uuid: string) {
  return await db
    .select({ visibility: point.public })
    .from(point)
    .where(eq(point.userUuid, uuid))
    .limit(1);
}

export async function toggleLeaderboardVisibility(uuid: string) {
  const visibility = await db
    .select({ visibility: point.public })
    .from(point)
    .where(eq(point.userUuid, uuid))
    .limit(1);

  if (visibility[0].visibility) {
    return await db
      .update(point)
      .set({ public: false })
      .where(eq(point.userUuid, uuid));
  } else {
    return await db
      .update(point)
      .set({ public: true })
      .where(eq(point.userUuid, uuid));
  }
}

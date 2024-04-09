import { eq, desc } from "drizzle-orm";
import { db } from "../db/db.js";
import { UserTable, LevelDefinitionTable, PointTable } from "../db/schema.js";
import { union } from "drizzle-orm/pg-core";

export async function getLeaderBoard(limit: number = 100) {
  return await db
    .select({
      username: UserTable.username,
      points: PointTable.point,
    })
    .from(PointTable)
    .leftJoin(UserTable, eq(UserTable.uuid, PointTable.userUuid))
    .where(eq(PointTable.public, true))
    .orderBy(desc(PointTable.point))
    .limit(limit);
}

export async function currentLeaderBoardVisibility(uuid: string) {
  return await db
    .select({ visibility: PointTable.public })
    .from(PointTable)
    .where(eq(PointTable.userUuid, uuid))
    .limit(1);
}

export async function toggleLeaderboardVisibility(uuid: string) {
  const visibility = await db
    .select({ visibility: PointTable.public })
    .from(PointTable)
    .where(eq(PointTable.userUuid, uuid))
    .limit(1);

  if (visibility[0].visibility) {
    return await db
      .update(PointTable)
      .set({ public: false })
      .where(eq(PointTable.userUuid, uuid));
  } else {
    return await db
      .update(PointTable)
      .set({ public: true })
      .where(eq(PointTable.userUuid, uuid));
  }
}

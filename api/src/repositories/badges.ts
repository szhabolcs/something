import { eq, desc } from "drizzle-orm";
import { db } from "../db/db.js";
import { UserTable, BadgeDefinitionTable, BadgeTable } from "../db/schema.js";
import { union } from "drizzle-orm/pg-core";

export async function getTopBadges(user_uuid: string, limit: number = 3) {
  //   Get latest limit badges by creation time desc
  const topBadges = await db
    .select({
      icon: BadgeDefinitionTable.icon,
      name: BadgeDefinitionTable.name,
      description: BadgeDefinitionTable.description,
    })
    .from(BadgeTable)
    .leftJoin(
      BadgeDefinitionTable,
      eq(BadgeDefinitionTable.uuid, BadgeTable.badgeDefinitionUuid)
    )
    .leftJoin(UserTable, eq(UserTable.uuid, user_uuid))
    .orderBy(desc(BadgeTable.createdAt))
    .limit(limit);

  return topBadges;
}

export async function getAllBadges(user_uuid: string) {
  const topBadges = await db
    .select({
      icon: BadgeDefinitionTable.icon,
      name: BadgeDefinitionTable.name,
      description: BadgeDefinitionTable.description,
    })
    .from(BadgeTable)
    .leftJoin(
      BadgeDefinitionTable,
      eq(BadgeDefinitionTable.uuid, BadgeTable.badgeDefinitionUuid)
    )
    .leftJoin(UserTable, eq(UserTable.uuid, user_uuid))
    .orderBy(desc(BadgeTable.createdAt));

  return topBadges;
}

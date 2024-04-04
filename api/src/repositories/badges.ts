import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import { user, badgeDefinition, badge } from "./schema";
import { union } from "drizzle-orm/pg-core";

export async function getTopBadges(user_uuid: string, limit: number = 3) {
  //   Get latest limit badges by creation time desc
  const topBadges = await db
    .select({
      icon: badgeDefinition.icon,
      name: badgeDefinition.name,
      description: badgeDefinition.description,
    })
    .from(badge)
    .leftJoin(
      badgeDefinition,
      eq(badgeDefinition.uuid, badge.badgeDefinitionUuid)
    )
    .leftJoin(user, eq(user.uuid, user_uuid))
    .orderBy(desc(badge.createdAt))
    .limit(limit);

  return topBadges;
}

export async function getAllBadges(user_uuid: string) {
  const topBadges = await db
    .select({
      icon: badgeDefinition.icon,
      name: badgeDefinition.name,
      description: badgeDefinition.description,
    })
    .from(badge)
    .leftJoin(
      badgeDefinition,
      eq(badgeDefinition.uuid, badge.badgeDefinitionUuid)
    )
    .leftJoin(user, eq(user.uuid, user_uuid))
    .orderBy(desc(badge.createdAt));

  return topBadges;
}

import { except } from 'drizzle-orm/pg-core';
import { DrizzleDatabaseSession, DrizzleTransactionSession, db } from '../db/db.js';
import { BadgeDefinitionTable, BadgeTable } from '../db/schema.js';
import { InferInsertModel, and, desc, eq, lte } from 'drizzle-orm';

export class BadgeRepository {
  /**
   * @throws {Error}
   */
  public async getNextBadgeId(
    userId: string,
    actionType: Exclude<InferInsertModel<typeof BadgeDefinitionTable>['action'], undefined>,
    actionCount: number,
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db
  ) {
    const allPossibleBadges = tx
      .select({ id: BadgeDefinitionTable.id })
      .from(BadgeDefinitionTable)
      .where(and(eq(BadgeDefinitionTable.action, actionType), lte(BadgeDefinitionTable.action_count, actionCount)));

    const userEarnedBadges = tx
      .select({ id: BadgeTable.badgeDefinitionId })
      .from(BadgeTable)
      .where(eq(BadgeTable.userId, userId));

    const [{ id: nextBadge }] = await except(allPossibleBadges, userEarnedBadges).limit(1);

    return nextBadge as string | undefined;
  }

  /**
   * @throws {Error}
   */
  public async giveBadge(
    userId: string,
    badgeDefinitionId: string,
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db
  ) {
    return tx.insert(BadgeTable).values({ userId, badgeDefinitionId });
  }

  /**
   * @throws {Error}
   */
  public async getById(badgeDefinitionId: string, tx: DrizzleDatabaseSession | DrizzleTransactionSession = db) {
    return tx
      .select({
        icon: BadgeDefinitionTable.icon,
        name: BadgeDefinitionTable.name,
        description: BadgeDefinitionTable.description
      })
      .from(BadgeDefinitionTable)
      .where(eq(BadgeDefinitionTable.id, badgeDefinitionId));
  }

  /**
   * @throws {Error}
   */
  public async getTopBadges(userId: string) {
    return this.getUserBadges(userId, 3);
  }

  public async getUserBadges(userId: string, limit: number | undefined = undefined) {
    const query = db
      .select({
        icon: BadgeDefinitionTable.icon,
        name: BadgeDefinitionTable.name,
        description: BadgeDefinitionTable.description
      })
      .from(BadgeTable)
      .innerJoin(BadgeDefinitionTable, eq(BadgeDefinitionTable.id, BadgeTable.badgeDefinitionId))
      .where(eq(BadgeTable.userId, userId))
      .orderBy(desc(BadgeTable.createdAt));

    if (limit) {
      return query.limit(limit);
    } else {
      return query;
    }
  }
}

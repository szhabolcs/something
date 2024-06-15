import { desc, eq, gte, lte, sql } from 'drizzle-orm';
import { DrizzleDatabaseSession, DrizzleTransactionSession, db } from '../db/db.js';
import { LevelDefinitionTable, ScoreTable } from '../db/schema.js';

export class ScoreRepository {
  /**
   * @throws {Error}
   */
  public async init(userId: string, tx: DrizzleDatabaseSession | DrizzleTransactionSession = db) {
    return tx.insert(ScoreTable).values({
      userId,
      value: 0
    });
  }

  /**
   * @throws {Error}
   */
  public async getUserScore(userId: string) {
    return db.select({ score: ScoreTable.value }).from(ScoreTable).where(eq(ScoreTable.userId, userId));
  }

  /**
   * @throws {Error}
   */
  public async getUserLevel(userId: string, tx: DrizzleDatabaseSession | DrizzleTransactionSession = db) {
    const [{ score: currentScore }] = await tx
      .select({ score: ScoreTable.value })
      .from(ScoreTable)
      .where(eq(ScoreTable.userId, userId));

    const [currentLevel] = await tx
      .select({
        name: LevelDefinitionTable.name,
        minThreshold: LevelDefinitionTable.minThreshold
      })
      .from(LevelDefinitionTable)
      .where(lte(LevelDefinitionTable.minThreshold, currentScore))
      .orderBy(desc(LevelDefinitionTable.minThreshold))
      .limit(1);

    const [nextLevel] = await tx
      .select({
        name: LevelDefinitionTable.name,
        minThreshold: LevelDefinitionTable.minThreshold
      })
      .from(LevelDefinitionTable)
      .where(gte(LevelDefinitionTable.minThreshold, currentScore + 1))
      .orderBy(LevelDefinitionTable.minThreshold)
      .limit(1);

    return {
      currentLevel,
      nextLevel,
      currentScore
    };
  }

  /**
   * @throws {Error}
   */
  public async updateScore(userId: string, by: number, tx: DrizzleDatabaseSession | DrizzleTransactionSession = db) {
    return tx
      .update(ScoreTable)
      .set({ value: sql`${ScoreTable.value} + ${by}` })
      .where(eq(ScoreTable.userId, userId));
  }
}

import { db } from '../db/db.js';
import { ScoreTable, UserTable } from '../db/schema.js';
import { eq, not } from 'drizzle-orm';

export class LeaderboardRepository {
  public async getUserVisibility(userId: string) {
    const [{ visible }] = await db
      .select({ visible: ScoreTable.public })
      .from(ScoreTable)
      .where(eq(ScoreTable.userId, userId));

    return visible;
  }

  public toggleUserVisibility(userId: string) {
    return db
      .update(ScoreTable)
      .set({ public: not(ScoreTable.public) })
      .where(eq(ScoreTable.userId, userId));
  }

  public async getLeaderboard() {
    return db
      .select({ username: UserTable.username, score: ScoreTable.value })
      .from(ScoreTable)
      .innerJoin(UserTable, eq(ScoreTable.userId, UserTable.id))
      .where(eq(ScoreTable.public, true));
  }
}

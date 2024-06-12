import {
  DrizzleDatabaseSession,
  DrizzleTransactionSession,
  db
} from '../db/db.js';
import { ScoreTable } from '../db/schema.js';

export class ScoreRepository {
  /**
   * @throws {Error}
   */
  public async init(
    userId: string,
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db
  ) {
    return tx.insert(ScoreTable).values({
      userId,
      value: 0
    });
  }
}

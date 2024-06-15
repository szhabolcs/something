import { DrizzleDatabaseSession, DrizzleTransactionSession, db } from '../db/db.js';
import { ScheduleTable } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export class ScheduleRepository {
  /**
   * Returns the schedule
   * @throws {Error}
   */
  public async getThingSchedule(thingId: string, tx: DrizzleDatabaseSession | DrizzleTransactionSession = db) {
    return tx.select().from(ScheduleTable).where(eq(ScheduleTable.thingId, thingId)).limit(1);
  }
}

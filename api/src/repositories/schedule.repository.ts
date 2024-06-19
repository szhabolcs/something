import { DrizzleDatabaseSession, DrizzleTransactionSession, db } from '../db/db.js';
import { ScheduleTable } from '../db/schema.js';
import { InferSelectModel, eq, or } from 'drizzle-orm';
import type { ScheduleDTO } from '../types/thing.types.js';

export class ScheduleRepository {
  /**
   * @throws {Error}
   */
  public async create(thingId: string, data: ScheduleDTO, tx: DrizzleDatabaseSession | DrizzleTransactionSession = db) {
    return tx.insert(ScheduleTable).values({ ...data, thingId });
  }

  /**
   * Returns the schedule
   * @throws {Error}
   */
  public async getThingSchedule(thingId: string, tx: DrizzleDatabaseSession | DrizzleTransactionSession = db) {
    const [schedule] = await tx.select().from(ScheduleTable).where(eq(ScheduleTable.thingId, thingId)).limit(1);
    return schedule;
  }

  public async getSchedulesForToday(
    day: string,
    weekday: Exclude<InferSelectModel<typeof ScheduleTable>['dayOfWeek'], null>
  ) {
    return db
      .select()
      .from(ScheduleTable)
      .where(
        or(
          // once
          eq(ScheduleTable.specificDate, day),
          // daily
          eq(ScheduleTable.repeat, 'daily'),
          // weekly
          eq(ScheduleTable.dayOfWeek, weekday)
        )
      );
  }
}

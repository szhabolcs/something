import { DrizzleDatabaseSession, DrizzleTransactionSession, db } from '../db/db.js';
import { ScheduleTable, ThingTable } from '../db/schema.js';
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
    const data = await db
      .select({ schedules: ScheduleTable })
      .from(ScheduleTable)
      .innerJoin(ThingTable, eq(ScheduleTable.thingId, ThingTable.id))
      .where(
        or(
          // once
          eq(ScheduleTable.specificDate, day),
          // daily
          eq(ScheduleTable.repeat, 'daily'),
          // weekly
          eq(ScheduleTable.dayOfWeek, weekday),
          eq(ThingTable.type, 'personal')
        )
      );
    return data.map((d) => d.schedules);
  }
}

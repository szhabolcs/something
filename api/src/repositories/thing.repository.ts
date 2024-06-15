import { union } from 'drizzle-orm/pg-core';
import { db } from '../db/db.js';
import { SharingTable, ThingTable } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export class ThingRepository {
  static userThingsSQ(userId: string) {
    const thingsCreatedByUser = db
      .select({ thingId: ThingTable.id })
      .from(ThingTable)
      .where(eq(ThingTable.userId, userId));

    const thingsSharedWithUser = db
      .select({ thingId: SharingTable.thingId })
      .from(SharingTable)
      .where(eq(SharingTable.userId, userId));

    return union(thingsCreatedByUser, thingsSharedWithUser).as('userThingsSQ');
  }
}

import { DrizzleDatabaseSession, DrizzleTransactionSession, db } from '../db/db.js';
import { ImageTable } from '../db/schema.js';
import { and, between, count, eq, inArray, sql } from 'drizzle-orm';
import { ThingRepository } from './thing.repository.js';

export class ImageRepository {
  /**
   * @throws {Error}
   */
  public async getCountBetween(
    userId: string,
    thingId: string,
    from: Date,
    to: Date,
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db
  ) {
    return tx
      .select({ count: count(ImageTable.thingId) })
      .from(ImageTable)
      .where(
        and(eq(ImageTable.userId, userId), eq(ImageTable.thingId, thingId), between(ImageTable.createdAt, from, to))
      );
  }

  public async checkAccess(userId: string, filename: string) {
    try {
      const [{ id: hasAccess }] = await db
        .select({ id: ImageTable.thingId })
        .from(ImageTable)
        .where(
          and(eq(ImageTable.filename, filename), inArray(ImageTable.thingId, ThingRepository.userThingsSQ(userId)))
        );

      return Boolean(hasAccess);
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  /**
   * @throws {Error}
   */
  public async insert(
    userId: string,
    thingId: string,
    filename: string,
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db
  ) {
    const [{ thingId: hasAccess }] = await tx
      .select({ thingId: sql`userThingsSQ.thingId`.mapWith(String) })
      .from(ThingRepository.userThingsSQ(userId))
      .where(eq(sql`id`, thingId));

    if (!hasAccess) {
      throw new Error(`User (${userId}) has no access to thing (${thingId})`);
    }

    const [{ createdAt }] = await tx
      .insert(ImageTable)
      .values({
        userId,
        thingId,
        filename
      })
      .returning({ createdAt: ImageTable.createdAt });

    return createdAt;
  }

  /**
   * @throws {Error}
   */
  public async getCount(userId: string, tx: DrizzleDatabaseSession | DrizzleTransactionSession = db) {
    return tx
      .select({ count: count(ImageTable.thingId) })
      .from(ImageTable)
      .where(eq(ImageTable.userId, userId));
  }
}

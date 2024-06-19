import { DateTime } from 'luxon';
import { db } from '../db/db.js';
import { ThingCardModel, ThingDTO, ThingDetailsModel, ThingPreviewModel } from '../types/thing.types.js';
import { BaseService } from './base.service.js';
import { ImageService } from './image.service.js';

export class ThingService extends BaseService {
  public async create(userId: string, data: ThingDTO) {
    return db.transaction(async (tx) => {
      try {
        // Create thing
        const [{ thingId }] = await this.repositories.thing.create(userId, data.name, data.description, tx);

        // Schedule entry
        await this.repositories.schedule.create(thingId, data.schedule, tx);

        // Add user as admin
        await this.repositories.access.giveThingAccess(thingId, [userId], 'admin', tx);

        // Share with people
        if (data.sharedUsernames.length !== 0) {
          const res = await this.repositories.user.getUserIds(data.sharedUsernames, tx);
          const userIds = res.map((u) => u.userId);
          await this.repositories.access.giveThingAccess(thingId, userIds, 'viewer', tx);
          await this.repositories.streak.setStreaks(userIds, thingId, 0);
        }
      } catch (error) {
        console.error('Error creating thing: %o', error);
        tx.rollback();
      }
    });
  }

  public async getDetails(userId: string, thingId: string): Promise<ThingDetailsModel> {
    const access = await this.repositories.access.getThingAccess(userId, thingId);
    if (!access) {
      throw new Error(`User (${userId}) has no access to thing (${thingId})`);
    }

    const { name, description } = await this.repositories.thing.getDetails(thingId);
    const schedule = await this.repositories.schedule.getThingSchedule(thingId);
    const sharedWith = await this.repositories.access.getSharedUsernames(userId, thingId);
    const _images = await this.repositories.image.getThingImages(thingId);
    const images = _images.map(({ username, filename, createdAt }) => ({
      username,
      image: ImageService.getImageUrl(filename),
      createdAt
    }));

    return {
      name,
      description,
      schedule,
      sharedWith,
      images,
      access
    };
  }

  public async getUserThingsToday(userId: string, limit: number | undefined = undefined): Promise<ThingPreviewModel[]> {
    const dayStart = DateTime.utc().startOf('day').minus({ hours: 3 });
    const dayEnd = DateTime.utc().endOf('day').minus({ hours: 3 });
    return this.repositories.thing.getThingPreviewsScheduledBetween(userId, dayStart.toISO(), dayEnd.toISO(), limit);
  }

  public async getUserThings(userId: string, limit: number | undefined = undefined): Promise<ThingPreviewModel[]> {
    return this.repositories.thing.getThingPreviews(userId, limit);
  }

  public async getOthersThingsToday(userId: string): Promise<ThingCardModel[]> {
    const dayStart = DateTime.utc().startOf('day');
    const dayEnd = DateTime.utc().endOf('day');
    const things = await this.repositories.thing.getOthersThingImagesCreatedBetween(
      userId,
      dayStart.toISO(),
      dayEnd.toISO()
    );

    return things.map(({ id, name, username, filename, createdAt }) => ({
      id,
      name,
      username,
      image: ImageService.getImageUrl(filename),
      createdAt
    }));
  }
}

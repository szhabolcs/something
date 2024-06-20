import { DrizzleTransactionSession, db } from '../db/db.js';
import { PointInfoModel, RewardInfoModel, StreakInfoModel } from '../types/reward.js';
import { BaseService } from './base.service.js';
import { DateTime, Interval } from 'luxon';
import { NotificationService } from './notification.service.js';

export class RewardService extends BaseService {
  public async handleImageUpload(userId: string, thingId: string, filename: string) {
    return db.transaction(async (tx) => {
      try {
        // First of all, lock the streak table so the scheduler won't be able to update it
        const [{ streak: currentStreak }] = await this.repositories.streak.getCurrent(userId, thingId, tx, true);

        // Check if the user has access
        const hasAccess = await this.repositories.access.getThingAccess(userId, thingId);
        if (!hasAccess) {
          throw new Error(`User (${userId}) has no access to thing (${thingId})`);
        }

        // Add image to database
        const _createdAt = await this.repositories.image.insert(userId, thingId, filename, tx);
        const createdAt = DateTime.fromSQL(_createdAt, { zone: 'utc' });

        const schedule = await this.repositories.schedule.getThingSchedule(thingId, tx);
        const scheduleInterval = NotificationService.computeScheduleInterval(schedule.startTime, schedule.endTime);
        const dayInterval = this.computeDayInterval(scheduleInterval);

        const points: PointInfoModel[] = [];

        // Is the image created between the scheduled time?
        if (scheduleInterval.contains(createdAt)) {
          // + 20 points
          points.push({ value: 20, reason: 'ON_SCHEDULE' });
        }
        // Image created before or after scheduled time
        else {
          // + 5 points
          points.push({ value: 5, reason: 'OFF_SCHEDULE' });
        }

        // Check if the streak still stands
        const previousDayInterval = Interval.fromDateTimes(
          dayInterval.start.minus({ days: 1 }),
          dayInterval.end.minus({ days: 1 })
        ) as Interval<true>;

        // Get the number of images taken the day prior
        const [{ count: imageCount }] = await this.repositories.image.getCountBetween(
          userId,
          thingId,
          previousDayInterval.start?.toISO(),
          previousDayInterval.end.toISO(),
          tx
        );

        const streak: StreakInfoModel = {
          value: currentStreak,
          reset: false
        };
        // If no images were taken on the prior day:
        //    - the streak is already 0, if the scheduler reset it
        //    - the streak still has it's previous value
        // Either way, we reset it, because the previous day has been missed
        if (imageCount === 0) {
          // reset streak to 1
          await this.repositories.streak.setStreak(userId, thingId, 1, tx);
          streak.value = 1;

          if (currentStreak > 1) {
            // The user just lost their streak, show message
            streak.reset = true;
          }
          // If the current streak is 0, then the user did not loose the streak just now
          // so no explanation is needed
        }
        // There are images on the prior day
        else {
          // +1 streak count
          streak.value++;
          await this.repositories.streak.setStreak(userId, thingId, streak.value, tx);
          points.push({
            value: 5,
            reason: 'STREAK_KEPT'
          });
        }

        // Update user score
        const updateByPoints = points.reduce((sum, point) => sum + point.value, 0);
        await this.repositories.score.updateScore(userId, updateByPoints, tx);

        // Calculate if the user got a badge
        const badge = await this.computeCompletedBadges(userId, tx);

        // Get current user level
        const level = await this.repositories.score.getUserLevel(userId, tx);

        const rewards: RewardInfoModel = {
          points,
          streak,
          badge,
          level
        };
        return rewards;
      } catch (error) {
        console.error('Error uploading image: %o', error);
        tx.rollback();
      }
    });
  }

  private computeDayInterval(scheduleInterval: Interval<true>) {
    let dayStart = DateTime.utc().startOf('day');
    let dayEnd = DateTime.utc().endOf('day');

    // If the schedule overflows into the other day
    // the day needs to be shifted by the hours it overflows
    if (!scheduleInterval.hasSame('day')) {
      const overflownHours = scheduleInterval.end.hour;
      dayStart = dayStart.plus({ hours: overflownHours });
      dayEnd = dayEnd.plus({ hours: overflownHours });
    }

    return Interval.fromDateTimes(dayStart, dayEnd) as Interval<true>;
  }

  /**
   * @throws {Error}
   */
  private async computeCompletedBadges(userId: string, tx: DrizzleTransactionSession | undefined = undefined) {
    const [{ count: thingCount }] = await this.repositories.image.getCount(userId, tx);
    const nextBadgeId = await this.repositories.badge.getNextBadgeId(userId, 'complete', thingCount, tx);

    if (nextBadgeId) {
      await this.repositories.badge.giveBadge(userId, nextBadgeId, tx);
      const [data] = await this.repositories.badge.getById(nextBadgeId, tx);
      return data;
    }
  }

  public async getTopBadges(userId: string) {
    return this.repositories.badge.getTopBadges(userId);
  }

  public async getUserBadges(userId: string, limit: number | undefined = undefined) {
    return this.repositories.badge.getUserBadges(userId, limit);
  }

  public async getUserLevel(userId: string) {
    return this.repositories.score.getUserLevel(userId);
  }
}

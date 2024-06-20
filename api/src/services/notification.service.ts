import { BaseService } from './base.service.js';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { NotificationTable, ScheduleTable } from '../db/schema.js';
import { DateTime, Interval } from 'luxon';
import { CronJob } from 'cron';
import { Expo } from 'expo-server-sdk';
import { DrizzleDatabaseSession, DrizzleTransactionSession, db } from '../db/db.js';

export class NotificationService extends BaseService {
  private static _instance: NotificationService;
  /** notificationId -> job  */
  private readonly runningJobs: Map<string, CronJob> = new Map();
  private readonly expoClient = new Expo();

  constructor() {
    super();

    if (NotificationService._instance) {
      return NotificationService._instance;
    }

    NotificationService._instance = this;
  }

  public async start() {
    // Get scheduled notifications from database
    const scheduledNotifications = await this.repositories.notification.getScheduledNotifications();
    // Create jobs for these notifications
    for (const notification of scheduledNotifications) {
      await this.createNotificationJob(notification);
    }

    // Create a job, that runs on midnight, to schedule the day's notifications
    CronJob.from({
      cronTime: '0 0 * * *', // At 12:00 AM
      onTick: this.createNotificationsForToday.bind(this),
      start: true
    });

    await this.createNotificationsForToday();
  }

  /**
   * Create a notification and also schedule a job
   *
   * Does not create it if it exists already (aka user has a thing notification in the given interval)
   */
  public async createNotification(
    userId: string,
    thingId: string,
    thingName: string,
    interval: Interval<true>,
    tx: DrizzleDatabaseSession | DrizzleTransactionSession = db
  ) {
    const existingNotification = await this.repositories.notification.notificationExists(
      userId,
      thingId,
      interval.start.toISO(),
      interval.end.toISO()
    );

    if (existingNotification) {
      return;
    }

    // Generate random time between the interval
    // Generate a random millisecond value within the interval
    const randomMs = interval.start.toMillis() + Math.random() * interval.toDuration().toMillis();

    // Create a new DateTime object from the random millisecond value in UTC
    const randomDateTime = DateTime.fromMillis(randomMs, { zone: 'utc' }) as DateTime<true>;
    const notificationModel = this.createNotificationModel(userId, thingId, thingName, randomDateTime.toISO());

    const notification = await this.repositories.notification.create(notificationModel, tx);
    await this.createNotificationJob(notification);
  }

  /**
   * Delete a notification and also cancel a job
   */
  public async removeNotification(notificationId: string) {
    await this.repositories.notification.removeNotification(notificationId);
    const job = this.runningJobs.get(notificationId);
    if (job) {
      job.stop();
      this.runningJobs.delete(notificationId);
    }
  }

  private async createNotificationJob(notification: InferSelectModel<typeof NotificationTable>) {
    const scheduledDate = DateTime.fromSQL(notification.scheduledAt, { zone: 'utc' }).toJSDate();

    if (scheduledDate < new Date()) {
      await this.removeNotification(notification.id);
      console.log(`[Notifications][Job] ${notification.id} at ${scheduledDate} is late (removed)`);
      return;
    }

    if (this.runningJobs.has(notification.id)) {
      console.log(`[Notifications][Job] ${notification.id} at ${scheduledDate} exists already`);
      return;
    }

    this.runningJobs.set(
      notification.id,
      CronJob.from({
        cronTime: scheduledDate,
        onTick: (() => this.sendNotification(notification.id)).bind(this),
        start: true
      })
    );

    console.log(`[Notifications][Job] ${notification.id} at ${scheduledDate}`);
  }

  /**
   * Creates notifications that will be scheduled for today
   */
  private async createNotificationsForToday() {
    const today = DateTime.utc();
    const day = ScheduleTable.dayOfWeek.enumValues[today.weekday - 1];
    const schedules = await this.repositories.schedule.getSchedulesForToday(today.toISO(), day);

    for (const schedule of schedules) {
      const users = await this.repositories.access.getUsersForThing(schedule.thingId);
      const thing = await this.repositories.thing.getDetails(schedule.thingId);

      for (const user of users) {
        const interval = NotificationService.computeScheduleInterval(schedule.startTime, schedule.endTime);
        await this.createNotification(user.id, thing.id, thing.name, interval);
      }
    }

    console.log(`[Notifications][CreateToday] Created notifications`);
  }

  /**
   * Sends a single notification to the client
   */
  private async sendNotification(notificationId: string) {
    const data = await this.repositories.notification.getNotificationDataById(notificationId);

    if (data.user.pushToken) {
      try {
        await this.expoClient.sendPushNotificationsAsync([
          {
            to: data.user.pushToken,
            title: data.notification.title,
            body: data.notification.body,
            data: data.notification.data as any
          }
        ]);
      } catch (error) {
        console.log(
          `[Notifications][Send] Error on notification "${data.notification.body}" to "${data.user.username}"\n\t%o`,
          error
        );
      }
    }

    await this.repositories.notification.changeNotificationStatus(notificationId, 'completed');
    this.runningJobs.delete(notificationId);
    console.log(`[Notifications][Send] Sent notification "${data.notification.body}" to "${data.user.username}"`);
  }

  /**
   * Creates a notification model to be inserted in the database
   *
   * **scheduledAt is ISO**
   */
  private createNotificationModel(userId: string, thingId: string, thingName: string, scheduledAt: string) {
    const notification: InferInsertModel<typeof NotificationTable> = {
      title: 'You have a ✨thing✨ to do!',
      body: `Don't forget: ${thingName}`,
      data: { name: thingName, uuid: thingId },
      thingId: thingId,
      userId,
      scheduledAt
    };

    return notification;
  }

  /**
   * Helper function to parse start and end time, into actual Interval.
   * Note: Takes into account the fact that the end time might be on the next day
   */
  public static computeScheduleInterval(startTime: string, endTime: string) {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const scheduleStart = DateTime.utc().set({
      hour: startHour,
      minute: startMinute
    });

    const [endHour, endMinute] = endTime.split(':').map(Number);
    let scheduleEnd = DateTime.utc().set({
      hour: endHour,
      minute: endMinute
    });

    // If the end date is before the start
    // it means that the end hour is past midnight,
    // so one day needs to be added, since the end hour is technically "next day"
    if (scheduleEnd < scheduleStart) {
      scheduleEnd = scheduleEnd.plus({ days: 1 });
    }

    return Interval.fromDateTimes(scheduleStart, scheduleEnd) as Interval<true>;
  }
}

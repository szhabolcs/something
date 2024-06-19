import { BaseService } from './base.service.js';
import scheduler from 'node-schedule';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { NotificationTable, ScheduleTable, ThingTable } from '../db/schema.js';
import { DateTime, Interval } from 'luxon';

export class NotificationService extends BaseService {
  private static _instance: NotificationService;

  constructor() {
    super();

    if (NotificationService._instance) {
      return NotificationService._instance;
    }

    NotificationService._instance = this;
  }

  public async start() {
    await this.createNotificationsForToday();
    await this.scheduleForToday();

    // Create a job that runs every day
    const action = (async () => {
      console.log(`[Scheduler][Job] Started %o`, 'CreateNotificationsForToday');
      await this.createNotificationsForToday();
      await this.scheduleForToday();
      console.log(`[Scheduler][Job] Finished %o`, 'CreateNotificationsForToday');
    }).bind(this);

    const everyMinuteCron = '* * * * *';
    new scheduler.Job('CreateNotificationsForToday', action).schedule(everyMinuteCron);
    console.log(`[Scheduler][Job] Created %o`, 'CreateNotificationsForToday');
  }

  /**
   * Creates notifications that will be scheduled for today
   */
  public async createNotificationsForToday() {
    const today = DateTime.utc();
    const day = ScheduleTable.dayOfWeek.enumValues[today.weekday - 1];
    const schedules = await this.repositories.schedule.getSchedulesForToday(today.toISO(), day);

    for (const schedule of schedules) {
      const users = await this.repositories.access.getUsersForThing(schedule.thingId);
      const thing = await this.repositories.thing.getDetails(schedule.thingId);

      for (const user of users) {
        if (!user.pushToken) {
          continue;
        }
        const interval = NotificationService.computeScheduleInterval(schedule.startTime, schedule.endTime);

        const notificationExists = await this.repositories.notification.notificationExists(
          user.id,
          thing.id,
          interval.start.toISO(),
          interval.end.toISO()
        );

        if (notificationExists) {
          continue;
        }

        // Generate random time between the interval
        // Generate a random millisecond value within the interval
        const randomMs = interval.start.toMillis() + Math.random() * interval.toDuration().toMillis();

        // Create a new DateTime object from the random millisecond value in UTC
        const randomDateTime = DateTime.fromMillis(randomMs, { zone: 'utc' }) as DateTime<true>;
        const notification = this.createNotificationData(user.id, user.pushToken, randomDateTime.toISO(), thing);

        await this.repositories.notification.create(notification);
      }
    }
  }

  /**
   * Schedules uncompleted notifications
   */
  public async scheduleForToday() {
    console.log('[Scheduler] Scheduling notifications');

    const notifications = await this.repositories.notification.getScheduledNotifications();
    for (const notification of notifications) {
      const notificationDate = DateTime.fromSQL(notification.scheduledAt, { zone: 'utc' });

      if (notificationDate < DateTime.utc()) {
        console.log('[Scheduler] Notification is in the past');
        continue;
      }

      this.addNotificationToScheduler(notification);
    }

    console.log('[Scheduler] Notifications scheduled');
    console.log('[Scheduler] Jobs running ', this.jobsRunning);
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

  /**
   * Array of the names of the running jobs
   */
  private get jobsRunning() {
    return Object.keys(scheduler.scheduledJobs);
  }

  /**
   * Adds the notification to the scheduler
   */
  private addNotificationToScheduler(
    notification: InferSelectModel<typeof NotificationTable>,
    override: boolean = true
  ) {
    const name = notification.id;
    const date = notification.scheduledAt;

    if (override && Object.keys(scheduler.scheduledJobs).includes(name)) {
      scheduler.scheduledJobs[name].cancel();
    }

    const action = (async () => {
      console.log(`[Scheduler][Job] Started %o`, name);
      try {
        await this.sendNotification(notification);
      } catch (error) {
        console.error('[Scheduler][Job] Error %o', error);
        await this.repositories.notification.removeNotification(notification.id);
      } finally {
        console.log(`[Scheduler][Job] Finished %o`, name);
      }
    }).bind(this);

    const localDate = DateTime.fromSQL(date, { zone: 'utc' });
    new scheduler.Job(name, action).runOnDate(localDate.toJSDate());

    console.log(`[Scheduler][Job] Created %o`, name);
  }

  /**
   * Sends a single notification to the client
   */
  private async sendNotification(notification: InferSelectModel<typeof NotificationTable>) {
    await this.repositories.notification.changeNotificationStatus(notification.id, 'completed');
  }

  /**
   * Creates a notification object
   */
  private createNotificationData(
    userId: string,
    pushToken: string,
    scheduledAt: string,
    thing: InferSelectModel<typeof ThingTable>
  ) {
    const notification: InferInsertModel<typeof NotificationTable> = {
      title: 'You have a ✨thing✨ to do!',
      body: `Don't forder to ${thing.name}`,
      data: { name: thing.name, thingId: thing.id },
      thingId: thing.id,
      userId,
      pushToken,
      scheduledAt
    };

    return notification;
  }
}

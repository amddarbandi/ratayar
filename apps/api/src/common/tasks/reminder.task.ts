import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from '../../modules/notifications/notifications.service';

@Injectable()
export class ReminderTask {
  private readonly logger = new Logger(ReminderTask.name);

  constructor(private readonly notifications: NotificationsService) {}

  // هر روز ساعت ۸ صبح
  @Cron('0 8 * * *', { name: 'daily-reminders', timeZone: 'Asia/Tehran' })
  async handleDailyReminders() {
    this.logger.log('🔔 Running daily obligation reminders...');
    const result = await this.notifications.checkObligationReminders();
    this.logger.log(`✅ Daily reminders: ${result.created} created`);
  }

  // هر ۵ دقیقه — پردازش اعلان‌های در انتظار
  @Cron(CronExpression.EVERY_5_MINUTES, { name: 'process-notifications' })
  async handleProcessNotifications() {
    const result = await this.notifications.processScheduledNotifications();
    if (result.processed > 0) {
      this.logger.log(`📬 Processed ${result.processed} notifications`);
    }
  }
}

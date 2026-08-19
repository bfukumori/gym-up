import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { StorageService } from './storage';

export const NOTIFICATION_CHANNEL_ID = 'workout-reminders';

export const NOTIFICATION_IDS = {
  MORNING: 'gymup-morning-reminder',
  EVENING_PREFIX: 'gymup-evening-reminder',
  TEST: 'gymup-test-reminder',
};

// Configure how notifications should behave when received in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Returns YYYY-MM-DD in local time
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const NotificationService = {
  /**
   * Configure Android notification channel
   */
  async setupNotificationChannel(): Promise<void> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
        name: 'Lembretes de Treino',
        description: 'Notificações diárias e lembretes para manter seu streak e treinos em dia.',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366F1',
        enableLights: true,
        enableVibrate: true,
      });
    }
  },

  /**
   * Request user permissions for local push notifications
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const settings = await Notifications.getPermissionsAsync();
      if (
        settings.granted ||
        settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
      ) {
        return true;
      }

      const request = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      return (
        request.granted || request.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
      );
    } catch (e) {
      console.error('Error requesting notification permissions:', e);
      return false;
    }
  },

  /**
   * Check if notifications are currently permitted
   */
  async hasPermissions(): Promise<boolean> {
    try {
      const settings = await Notifications.getPermissionsAsync();
      return (
        settings.granted ||
        settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
      );
    } catch {
      return false;
    }
  },

  /**
   * Check whether user already completed a workout session today
   */
  async hasCompletedWorkoutToday(): Promise<boolean> {
    try {
      const todayStr = getLocalDateString();
      const stats = await StorageService.getUserStats();
      if (stats.lastWorkoutDate === todayStr) {
        return true;
      }

      const logs = await StorageService.getSessionLogs();
      return logs.some((log) => {
        if (!log.completedAt) return false;
        const logDateStr = getLocalDateString(new Date(log.completedAt));
        return logDateStr === todayStr;
      });
    } catch (e) {
      console.error('Error checking today workout completion:', e);
      return false;
    }
  },

  /**
   * Cancel today's 18:00 reminder if it is currently scheduled
   */
  async cancelTodayEveningReminder(): Promise<void> {
    try {
      const todayStr = getLocalDateString();
      const targetId = `${NOTIFICATION_IDS.EVENING_PREFIX}-${todayStr}`;
      await Notifications.cancelScheduledNotificationAsync(targetId);
    } catch (e) {
      console.error('Error canceling today evening reminder:', e);
    }
  },

  /**
   * Main synchronization routine:
   * 1. Sets up Android channel
   * 2. Schedules daily 11:30 AM reminder
   * 3. Checks if workout is done today:
   *    - If done: ensures today's 18:00 reminder is cancelled
   *    - If not done: schedules 18:00 reminder for today (if still before 18:00)
   * 4. Schedules 18:00 reminders for upcoming days (next 7 days)
   */
  async syncWorkoutReminders(): Promise<void> {
    try {
      const permitted = await this.hasPermissions();
      if (!permitted) {
        return;
      }

      await this.setupNotificationChannel();

      // 1. Schedule / ensure 11:30 AM daily reminder
      // We cancel existing morning reminder to avoid duplicate triggers
      await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.MORNING);

      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDS.MORNING,
        content: {
          title: 'Hora do treino! 💪',
          body: 'Mantenha o foco e seu streak em dia. Bora treinar hoje?',
          sound: true,
          data: { type: 'daily_morning_reminder' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 11,
          minute: 30,
          channelId: NOTIFICATION_CHANNEL_ID,
        },
      });

      // 2. Manage 18:00 evening reminders
      const alreadyTrainedToday = await this.hasCompletedWorkoutToday();
      const todayStr = getLocalDateString();
      const now = new Date();

      if (alreadyTrainedToday) {
        // Workout already done today: cancel 18:00 reminder for today
        await this.cancelTodayEveningReminder();
      } else {
        // Workout not done today: schedule for today at 18:00 if it is still in the future
        const today18h = new Date();
        today18h.setHours(18, 0, 0, 0);

        if (now.getTime() < today18h.getTime()) {
          const todayIdentifier = `${NOTIFICATION_IDS.EVENING_PREFIX}-${todayStr}`;
          await Notifications.cancelScheduledNotificationAsync(todayIdentifier);

          await Notifications.scheduleNotificationAsync({
            identifier: todayIdentifier,
            content: {
              title: 'Ainda dá tempo! 🔥',
              body: 'Você ainda não registrou seu treino de hoje. Bora fechar o dia com chave de ouro?',
              sound: true,
              data: { type: 'daily_evening_reminder', date: todayStr },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: today18h,
              channelId: NOTIFICATION_CHANNEL_ID,
            },
          });
        }
      }

      // 3. Pre-schedule upcoming 18:00 reminders for next 7 days
      // (When the user completes a workout on any of those days, that day's 18:00 reminder will be cancelled)
      for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + dayOffset);
        futureDate.setHours(18, 0, 0, 0);

        const futureDateStr = getLocalDateString(futureDate);
        const futureIdentifier = `${NOTIFICATION_IDS.EVENING_PREFIX}-${futureDateStr}`;

        // Cancel previous if exists before rescheduling
        await Notifications.cancelScheduledNotificationAsync(futureIdentifier);

        await Notifications.scheduleNotificationAsync({
          identifier: futureIdentifier,
          content: {
            title: 'Ainda dá tempo! 🔥',
            body: 'Você ainda não registrou seu treino de hoje. Bora fechar o dia com chave de ouro?',
            sound: true,
            data: { type: 'daily_evening_reminder', date: futureDateStr },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: futureDate,
            channelId: NOTIFICATION_CHANNEL_ID,
          },
        });
      }
    } catch (e) {
      console.error('Error syncing workout reminders:', e);
    }
  },

  /**
   * Called immediately when a workout session is submitted/completed.
   * Cancels today's 18:00 reminder.
   */
  async onWorkoutCompleted(): Promise<void> {
    try {
      await this.cancelTodayEveningReminder();
    } catch (e) {
      console.error('Error handling workout completed in notification service:', e);
    }
  },

  /**
   * Cancel all notifications scheduled by GymUp
   */
  async cancelAllGymUpNotifications(): Promise<void> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      for (const item of scheduled) {
        if (
          item.identifier === NOTIFICATION_IDS.MORNING ||
          item.identifier.startsWith(NOTIFICATION_IDS.EVENING_PREFIX) ||
          item.identifier === NOTIFICATION_IDS.TEST
        ) {
          await Notifications.cancelScheduledNotificationAsync(item.identifier);
        }
      }
    } catch (e) {
      console.error('Error cancelling all GymUp notifications:', e);
    }
  },

  /**
   * Send an immediate test notification (or in 2 seconds) to verify permissions and banner display
   */
  async sendTestNotification(): Promise<boolean> {
    try {
      const permitted = await this.requestPermissions();
      if (!permitted) return false;

      await this.setupNotificationChannel();
      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDS.TEST,
        content: {
          title: 'Notificações do GymUp ativas! 🚀',
          body: 'Lembretes diários às 11:30 e às 18:00 (se ainda não treinou) configurados com sucesso.',
          sound: true,
          data: { type: 'test' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
          channelId: NOTIFICATION_CHANNEL_ID,
        },
      });
      return true;
    } catch (e) {
      console.error('Error sending test notification:', e);
      return false;
    }
  },
};

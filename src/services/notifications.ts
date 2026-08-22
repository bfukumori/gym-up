import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { StorageService } from './storage';

export const NOTIFICATION_CHANNEL_ID = 'workout-reminders';

export const NOTIFICATION_IDS = {
  MORNING: 'gymup-morning-reminder',
  EVENING: 'gymup-evening-reminder',
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
   * Configure Android notification channel with MAX priority and sound
   */
  async setupNotificationChannel(): Promise<void> {
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
          name: 'Lembretes de Treino',
          description: 'Notificações diárias e lembretes para manter seu streak e treinos em dia.',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6366F1',
          enableLights: true,
          enableVibrate: true,
          showBadge: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
      } catch (e) {
        console.warn('Erro ao configurar canal de notificação Android:', e);
      }
    }
  },

  /**
   * Request user permissions for local push notifications
   */
  async requestPermissions(): Promise<boolean> {
    try {
      await this.setupNotificationChannel();

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
      await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.EVENING);
    } catch (e) {
      console.error('Error canceling today evening reminder:', e);
    }
  },

  /**
   * Main synchronization routine:
   * 1. Sets up Android channel
   * 2. Schedules daily 11:30 AM reminder (recurring)
   * 3. Checks if workout is done today:
   *    - If not done: ensures daily 18:00 reminder is active
   *    - If done: cancels evening reminder for today
   */
  async syncWorkoutReminders(): Promise<void> {
    try {
      await this.setupNotificationChannel();

      const permitted = await this.hasPermissions();
      if (!permitted) {
        return;
      }

      // 1. Schedule / ensure morning daily recurring reminder with user-configured time
      const morningTime = await StorageService.getMorningReminderTime();
      const [mHourStr, mMinStr] = morningTime.split(':');
      const mHour = Number.parseInt(mHourStr || '11', 10);
      const mMin = Number.parseInt(mMinStr || '30', 10);

      await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.MORNING);
      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDS.MORNING,
        content: {
          title: 'Hora do treino! 💪',
          body: 'Mantenha o foco e seu streak em dia. Bora treinar hoje?',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: { type: 'daily_morning_reminder' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: Number.isNaN(mHour) ? 11 : mHour,
          minute: Number.isNaN(mMin) ? 30 : mMin,
          channelId: NOTIFICATION_CHANNEL_ID,
        },
      });

      // 2. Manage 18:00 evening daily recurring reminder
      const alreadyTrainedToday = await this.hasCompletedWorkoutToday();
      await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.EVENING);

      if (!alreadyTrainedToday) {
        await Notifications.scheduleNotificationAsync({
          identifier: NOTIFICATION_IDS.EVENING,
          content: {
            title: 'Ainda dá tempo! 🔥',
            body: 'Você ainda não registrou seu treino de hoje. Bora fechar o dia com chave de ouro?',
            sound: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
            data: { type: 'daily_evening_reminder' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 18,
            minute: 0,
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
          item.identifier === NOTIFICATION_IDS.EVENING ||
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
   * Send an immediate test notification (in 2 seconds) to verify permissions and banner display
   */
  async sendTestNotification(): Promise<boolean> {
    try {
      await this.setupNotificationChannel();
      const permitted = await this.requestPermissions();
      if (!permitted) return false;

      const morningTime = await StorageService.getMorningReminderTime();

      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDS.TEST,
        content: {
          title: 'Notificações do GymUp ativas! 🚀',
          body: `Lembretes diários às ${morningTime} e às 18:00 configurados com sucesso.`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
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

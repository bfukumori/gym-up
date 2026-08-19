import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { INITIAL_ACHIEVEMENTS } from '../constants/achievements';
import type { Achievement, UserStats, WorkoutPlan, WorkoutSessionLog } from '../types';

const KEYS = {
  WORKOUT_PLAN: '@gymup_workout_plan',
  SESSION_LOGS: '@gymup_session_logs',
  USER_STATS: '@gymup_user_stats',
  ACHIEVEMENTS: '@gymup_achievements',
  LAST_ACTIVE_DAY: '@gymup_last_active_day',
};

const SECURE_KEYS = {
  CUSTOM_API_KEY: 'gymup_custom_gemini_api_key',
};

const DEFAULT_STATS: UserStats = {
  level: 1,
  currentXp: 0,
  xpToNextLevel: 300,
  currentStreakDays: 0,
  longestStreakDays: 0,
  totalWorkoutsCompleted: 0,
  totalSetsCompleted: 0,
  totalVolumeKg: 0,
  unlockedAchievementIds: [],
};

export const StorageService = {
  // --- Workout Plan ---
  async getWorkoutPlan(): Promise<WorkoutPlan | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.WORKOUT_PLAN);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error loading workout plan:', e);
      return null;
    }
  },

  async saveWorkoutPlan(plan: WorkoutPlan): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.WORKOUT_PLAN, JSON.stringify(plan));
    } catch (e) {
      console.error('Error saving workout plan:', e);
    }
  },

  async clearWorkoutPlan(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.WORKOUT_PLAN);
    } catch (e) {
      console.error('Error clearing workout plan:', e);
    }
  },

  // --- Session Logs ---
  async getSessionLogs(): Promise<WorkoutSessionLog[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SESSION_LOGS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading session logs:', e);
      return [];
    }
  },

  async saveSessionLog(log: WorkoutSessionLog): Promise<void> {
    try {
      const currentLogs = await this.getSessionLogs();
      const updated = [log, ...currentLogs];
      await AsyncStorage.setItem(KEYS.SESSION_LOGS, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving session log:', e);
    }
  },

  // --- User Stats & Gamification ---
  async getUserStats(): Promise<UserStats> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_STATS);
      return data ? { ...DEFAULT_STATS, ...JSON.parse(data) } : DEFAULT_STATS;
    } catch (e) {
      console.error('Error loading user stats:', e);
      return DEFAULT_STATS;
    }
  },

  async saveUserStats(stats: UserStats): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER_STATS, JSON.stringify(stats));
    } catch (e) {
      console.error('Error saving user stats:', e);
    }
  },

  // --- Achievements ---
  async getAchievements(): Promise<Achievement[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.ACHIEVEMENTS);
      if (!data) {
        await this.saveAchievements(INITIAL_ACHIEVEMENTS);
        return INITIAL_ACHIEVEMENTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error loading achievements:', e);
      return INITIAL_ACHIEVEMENTS;
    }
  },

  async saveAchievements(achievements: Achievement[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    } catch (e) {
      console.error('Error saving achievements:', e);
    }
  },

  // --- Custom Gemini API Key (Encrypted via expo-secure-store) ---
  async getCustomApiKey(): Promise<string | null> {
    try {
      const isSecureAvailable = await SecureStore.isAvailableAsync();
      if (isSecureAvailable) {
        const secureKey = await SecureStore.getItemAsync(SECURE_KEYS.CUSTOM_API_KEY);
        if (secureKey) return secureKey;
      }
      // Fallback for web or migration
      return await AsyncStorage.getItem(SECURE_KEYS.CUSTOM_API_KEY);
    } catch {
      return null;
    }
  },

  async saveCustomApiKey(key: string): Promise<void> {
    try {
      const trimmed = key.trim();
      const isSecureAvailable = await SecureStore.isAvailableAsync();

      if (!trimmed) {
        if (isSecureAvailable) {
          await SecureStore.deleteItemAsync(SECURE_KEYS.CUSTOM_API_KEY);
        }
        await AsyncStorage.removeItem(SECURE_KEYS.CUSTOM_API_KEY);
      } else {
        if (isSecureAvailable) {
          await SecureStore.setItemAsync(SECURE_KEYS.CUSTOM_API_KEY, trimmed);
        } else {
          await AsyncStorage.setItem(SECURE_KEYS.CUSTOM_API_KEY, trimmed);
        }
      }
    } catch (e) {
      console.error('Error saving secure custom API key:', e);
    }
  },

  // --- Reset All Data ---
  async resetAllData(): Promise<void> {
    try {
      const isSecureAvailable = await SecureStore.isAvailableAsync();
      if (isSecureAvailable) {
        await SecureStore.deleteItemAsync(SECURE_KEYS.CUSTOM_API_KEY);
      }
      await Promise.all([
        AsyncStorage.removeItem(KEYS.WORKOUT_PLAN),
        AsyncStorage.removeItem(KEYS.SESSION_LOGS),
        AsyncStorage.removeItem(KEYS.USER_STATS),
        AsyncStorage.removeItem(KEYS.ACHIEVEMENTS),
        AsyncStorage.removeItem(KEYS.LAST_ACTIVE_DAY),
        AsyncStorage.removeItem(SECURE_KEYS.CUSTOM_API_KEY),
      ]);
    } catch (e) {
      console.error('Error resetting all data:', e);
    }
  },
};

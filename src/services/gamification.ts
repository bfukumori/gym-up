import type { Achievement, UserStats, WorkoutSessionLog } from '../types';
import { getLocalDateString } from './notifications';
import { StorageService } from './storage';

export const XP_CONFIG = {
  PER_WORKOUT: 75,
  PER_SET: 5,
  BONUS_STREAK: 25, // extra XP for maintaining streak
  BASE_LEVEL_XP: 250, // XP needed for Level 1 -> 2
  LEVEL_SCALING: 1.25, // each level needs 25% more XP
};

export function getXpRequiredForLevel(level: number): number {
  return Math.round(XP_CONFIG.BASE_LEVEL_XP * XP_CONFIG.LEVEL_SCALING ** (level - 1));
}

export function getLevelTitle(level: number): string {
  if (level <= 1) return 'Iniciante do Ferro';
  if (level <= 3) return 'Praticante Dedicado';
  if (level <= 5) return 'Guerreiro da Academia';
  if (level <= 8) return 'Atleta Implacável';
  if (level <= 12) return 'Mestre do Treino';
  if (level <= 20) return 'Titã dos Halteres';
  return 'Lenda do Aço';
}

export const GamificationService = {
  calculateWorkoutXp(setsCompleted: number, isStreakActive: boolean): number {
    let xp = XP_CONFIG.PER_WORKOUT + setsCompleted * XP_CONFIG.PER_SET;
    if (isStreakActive) {
      xp += XP_CONFIG.BONUS_STREAK;
    }
    return xp;
  },

  async processCompletedWorkout(sessionLog: WorkoutSessionLog): Promise<{
    updatedStats: UserStats;
    newlyUnlockedAchievements: Achievement[];
    leveledUp: boolean;
    previousLevel: number;
    newLevel: number;
  }> {
    const currentStats = await StorageService.getUserStats();
    const achievements = await StorageService.getAchievements();

    const todayStr = getLocalDateString();
    let newStreak = currentStats.currentStreakDays;

    if (!currentStats.lastWorkoutDate) {
      newStreak = 1;
    } else {
      const lastDate = new Date(currentStats.lastWorkoutDate);
      const todayDate = new Date(todayStr);
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Trained yesterday, increment streak
        newStreak += 1;
      } else if (diffDays === 0) {
        // Already trained today, keep streak
        newStreak = Math.max(1, newStreak);
      } else {
        // Broken streak
        newStreak = 1;
      }
    }

    const longestStreak = Math.max(currentStats.longestStreakDays, newStreak);
    const totalWorkouts = currentStats.totalWorkoutsCompleted + 1;
    const totalSets = currentStats.totalSetsCompleted + sessionLog.totalSetsCompleted;
    const totalVolume = currentStats.totalVolumeKg + sessionLog.totalVolumeKg;

    // Calculate XP and level
    let currentXp = currentStats.currentXp + sessionLog.xpEarned;
    let level = currentStats.level;
    let xpNeeded = currentStats.xpToNextLevel;
    const previousLevel = level;
    let leveledUp = false;

    while (currentXp >= xpNeeded) {
      currentXp -= xpNeeded;
      level += 1;
      xpNeeded = getXpRequiredForLevel(level);
      leveledUp = true;
    }

    const updatedStats: UserStats = {
      level,
      currentXp,
      xpToNextLevel: xpNeeded,
      currentStreakDays: newStreak,
      longestStreakDays: longestStreak,
      lastWorkoutDate: todayStr,
      totalWorkoutsCompleted: totalWorkouts,
      totalSetsCompleted: totalSets,
      totalVolumeKg: totalVolume,
      unlockedAchievementIds: [...currentStats.unlockedAchievementIds],
    };

    // Check achievement unlock conditions
    const newlyUnlocked: Achievement[] = [];
    const updatedAchievements = achievements.map((ach) => {
      if (ach.unlockedAt) return ach; // already unlocked

      let isUnlocked = false;
      if (ach.id === 'first_workout' && totalWorkouts >= 1) isUnlocked = true;
      if (ach.id === 'streak_3' && newStreak >= 3) isUnlocked = true;
      if (ach.id === 'streak_7' && newStreak >= 7) isUnlocked = true;
      if (ach.id === 'sets_50' && totalSets >= 50) isUnlocked = true;
      if (ach.id === 'sets_200' && totalSets >= 200) isUnlocked = true;
      if (ach.id === 'volume_10k' && totalVolume >= 10000) isUnlocked = true;
      if (ach.id === 'level_5' && level >= 5) isUnlocked = true;
      if (ach.id === 'leg_day_champion' && sessionLog.dayName.toLowerCase().includes('perna'))
        isUnlocked = true;
      if (ach.id === 'month_master' && totalWorkouts >= 12) isUnlocked = true;

      if (isUnlocked) {
        const unlockedObj: Achievement = {
          ...ach,
          unlockedAt: new Date().toISOString(),
        };
        newlyUnlocked.push(unlockedObj);
        updatedStats.unlockedAchievementIds.push(ach.id);
        // Grant bonus XP for achievement
        updatedStats.currentXp += ach.xpReward;
        return unlockedObj;
      }
      return ach;
    });

    // Re-check level up in case achievement XP pushed to next level
    while (updatedStats.currentXp >= updatedStats.xpToNextLevel) {
      updatedStats.currentXp -= updatedStats.xpToNextLevel;
      updatedStats.level += 1;
      updatedStats.xpToNextLevel = getXpRequiredForLevel(updatedStats.level);
      leveledUp = true;
    }

    await StorageService.saveUserStats(updatedStats);
    await StorageService.saveAchievements(updatedAchievements);

    return {
      updatedStats,
      newlyUnlockedAchievements: newlyUnlocked,
      leveledUp,
      previousLevel,
      newLevel: updatedStats.level,
    };
  },
};

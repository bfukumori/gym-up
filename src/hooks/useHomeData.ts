import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StorageService } from '../services/storage';
import type { UserStats, WorkoutPlan, WorkoutSessionLog } from '../types';

const DEFAULT_STATS: UserStats = {
  level: 1,
  currentXp: 0,
  xpToNextLevel: 250,
  currentStreakDays: 0,
  longestStreakDays: 0,
  totalWorkoutsCompleted: 0,
  totalSetsCompleted: 0,
  totalVolumeKg: 0,
  unlockedAchievementIds: [],
};

export function useHomeData() {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [weeklyLogs, setWeeklyLogs] = useState<WorkoutSessionLog[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [userStats, workoutPlan, logs] = await Promise.all([
        StorageService.getUserStats(),
        StorageService.getWorkoutPlan(),
        StorageService.getSessionLogs(),
      ]);
      setStats(userStats);
      setPlan(workoutPlan);

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const recentLogs = logs.filter((l) => new Date(l.completedAt) >= oneWeekAgo);
      setWeeklyLogs(recentLogs);
    } catch (e) {
      console.error('Error loading home data:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const activeDay = plan?.days?.[selectedDayIndex] || plan?.days?.[0];
  const targetDaysPerWeek = plan?.answers?.daysPerWeek || 4;
  const workoutsThisWeek = weeklyLogs.length;
  const weekProgressPercent = Math.min(
    100,
    Math.round((workoutsThisWeek / targetDaysPerWeek) * 100)
  );

  return {
    stats,
    plan,
    activeDay,
    selectedDayIndex,
    setSelectedDayIndex,
    refreshing,
    onRefresh,
    workoutsThisWeek,
    targetDaysPerWeek,
    weekProgressPercent,
  };
}

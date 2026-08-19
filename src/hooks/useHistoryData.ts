import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StorageService } from '../services/storage';
import type { WorkoutPlan, WorkoutSessionLog } from '../types';

export type HistoryViewMode = 'weekly' | 'monthly' | 'logs';

export function useHistoryData() {
  const [viewMode, setViewMode] = useState<HistoryViewMode>('weekly');
  const [logs, setLogs] = useState<WorkoutSessionLog[]>([]);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);

  const loadData = useCallback(async () => {
    const [savedLogs, savedPlan] = await Promise.all([
      StorageService.getSessionLogs(),
      StorageService.getWorkoutPlan(),
    ]);
    setLogs(savedLogs);
    setPlan(savedPlan);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // --- Calculations for Weekly Summary ---
  const weeklyStats = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const weeklyLogs = logs.filter((l) => new Date(l.completedAt) >= sevenDaysAgo);
    const targetDays = plan?.answers?.daysPerWeek || 4;
    const workoutsDone = weeklyLogs.length;
    const adherence = Math.min(100, Math.round((workoutsDone / targetDays) * 100));
    const setsDone = weeklyLogs.reduce((acc, l) => acc + l.totalSetsCompleted, 0);
    const volume = weeklyLogs.reduce((acc, l) => acc + l.totalVolumeKg, 0);
    const xp = weeklyLogs.reduce((acc, l) => acc + l.xpEarned, 0);

    const musclesMap: Record<string, number> = {};
    weeklyLogs.forEach((l) => {
      l.exercises.forEach((ex) => {
        if (ex.sets.length > 0) {
          musclesMap[ex.muscleGroup] = (musclesMap[ex.muscleGroup] || 0) + ex.sets.length;
        }
      });
    });

    return {
      weeklyLogs,
      targetDays,
      workoutsDone,
      adherence,
      setsDone,
      volume,
      xp,
      musclesMap,
    };
  }, [logs, plan]);

  // --- Calculations for Monthly Summary ---
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const monthlyLogs = logs.filter((l) => new Date(l.completedAt) >= thirtyDaysAgo);
    const workoutsDone = monthlyLogs.length;
    const setsDone = monthlyLogs.reduce((acc, l) => acc + l.totalSetsCompleted, 0);
    const volume = monthlyLogs.reduce((acc, l) => acc + l.totalVolumeKg, 0);
    const xp = monthlyLogs.reduce((acc, l) => acc + l.xpEarned, 0);
    const avgDuration =
      workoutsDone > 0
        ? Math.round(monthlyLogs.reduce((acc, l) => acc + l.durationMinutes, 0) / workoutsDone)
        : 0;

    return {
      workoutsDone,
      setsDone,
      volume,
      xp,
      avgDuration,
    };
  }, [logs]);

  return {
    viewMode,
    setViewMode,
    logs,
    weeklyStats,
    monthlyStats,
  };
}

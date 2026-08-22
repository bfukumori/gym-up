import * as Haptics from 'expo-haptics';
import { Observe } from 'expo-observe';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import type { SetState } from '../components/ExerciseCard';
import { GamificationService } from '../services/gamification';
import { NotificationService } from '../services/notifications';
import { StorageService } from '../services/storage';
import type { Achievement, WorkoutDay, WorkoutPlan, WorkoutSessionLog } from '../types';

export function useWorkoutSession(dayId: string | undefined) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [day, setDay] = useState<WorkoutDay | null>(null);

  // Exercise & Set States: map from exerciseId -> SetState[]
  const [exerciseSets, setExerciseSets] = useState<Record<string, SetState[]>>({});

  // Timer State
  const [startTime] = useState<Date>(new Date());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Rest Timer Modal
  const [restTimerVisible, setRestTimerVisible] = useState(false);
  const [restTimerSeconds, setRestTimerSeconds] = useState(60);

  // Celebration Modal
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [newLevel, setNewLevel] = useState<number | undefined>(undefined);
  const [leveledUp, setLeveledUp] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState<Achievement[]>([]);

  const loadWorkoutData = useCallback(async () => {
    try {
      setLoading(true);
      const savedPlan = await StorageService.getWorkoutPlan();
      if (!savedPlan) {
        Alert.alert('Nenhum plano encontrado', 'Crie seu plano de treino primeiro.');
        router.replace('/(tabs)');
        return;
      }
      setPlan(savedPlan);

      const targetDay = savedPlan.days.find((d) => d.id === dayId) || savedPlan.days[0];
      setDay(targetDay);

      // Initialize set states
      const initialMap: Record<string, SetState[]> = {};
      targetDay.exercises.forEach((ex) => {
        initialMap[ex.id] = ex.targetSets.map((ts, idx) => ({
          setNumber: ts.setNumber || idx + 1,
          reps: (ts.targetReps || '10').replace(/[^0-9]/g, '').slice(0, 2) || '10',
          weightKg: ts.suggestedWeightKg ? String(ts.suggestedWeightKg) : '15',
          isCompleted: false,
        }));
      });
      setExerciseSets(initialMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [dayId, router]);

  useEffect(() => {
    loadWorkoutData();
  }, [loadWorkoutData]);

  // Elapsed timer clock
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSet = (exerciseId: string, setIndex: number, restSeconds: number) => {
    setExerciseSets((prev) => {
      const currentSets = [...(prev[exerciseId] || [])];
      const currentState = currentSets[setIndex];
      const willBeCompleted = !currentState.isCompleted;

      currentSets[setIndex] = {
        ...currentState,
        isCompleted: willBeCompleted,
      };

      if (willBeCompleted) {
        setRestTimerSeconds(restSeconds);
        setRestTimerVisible(true);
      }

      return {
        ...prev,
        [exerciseId]: currentSets,
      };
    });
  };

  const handleChangeWeight = (exerciseId: string, setIndex: number, weight: string) => {
    setExerciseSets((prev) => {
      const currentSets = [...(prev[exerciseId] || [])];
      currentSets[setIndex] = { ...currentSets[setIndex], weightKg: weight };
      return { ...prev, [exerciseId]: currentSets };
    });
  };

  const handleChangeReps = (exerciseId: string, setIndex: number, reps: string) => {
    setExerciseSets((prev) => {
      const currentSets = [...(prev[exerciseId] || [])];
      currentSets[setIndex] = { ...currentSets[setIndex], reps: reps };
      return { ...prev, [exerciseId]: currentSets };
    });
  };

  const calculateWorkoutProgress = () => {
    let total = 0;
    let completed = 0;
    Object.values(exerciseSets).forEach((sets) => {
      total += sets.length;
      completed += sets.filter((s) => s.isCompleted).length;
    });
    return { completed, total, percent: total > 0 ? (completed / total) * 100 : 0 };
  };

  const submitWorkout = async () => {
    if (!day || !plan) return;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      let totalVolume = 0;
      let totalCompletedSets = 0;
      const completedExercisesLog = day.exercises.map((ex) => {
        const sets = exerciseSets[ex.id] || [];
        const completedSets = sets
          .filter((s) => s.isCompleted)
          .map((s) => {
            const repsNum = Number.parseInt(s.reps, 10) || 0;
            const weightNum = Number.parseFloat(s.weightKg) || 0;
            totalVolume += repsNum * weightNum;
            totalCompletedSets += 1;
            return {
              setNumber: s.setNumber,
              reps: repsNum,
              weightKg: weightNum,
              completedAt: new Date().toISOString(),
            };
          });

        return {
          exerciseId: ex.id,
          exerciseName: ex.name,
          muscleGroup: ex.muscleGroup,
          sets: completedSets,
        };
      });

      const userStats = await StorageService.getUserStats();
      const isStreakActive = userStats.currentStreakDays > 0;
      const earnedXp = GamificationService.calculateWorkoutXp(totalCompletedSets, isStreakActive);

      const sessionLog: WorkoutSessionLog = {
        id: `session-${Date.now()}`,
        planId: plan.id,
        dayId: day.id,
        dayName: day.name,
        startedAt: startTime.toISOString(),
        completedAt: new Date().toISOString(),
        durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
        totalSetsCompleted: totalCompletedSets,
        totalVolumeKg: totalVolume,
        xpEarned: earnedXp,
        exercises: completedExercisesLog,
      };

      await StorageService.saveSessionLog(sessionLog);
      const result = await GamificationService.processCompletedWorkout(sessionLog);
      await NotificationService.onWorkoutCompleted();

      Observe.logEvent('workout.completed', {
        attributes: {
          durationMinutes: sessionLog.durationMinutes,
          totalSetsCompleted: totalCompletedSets,
          totalVolumeKg: totalVolume,
          xpEarned: earnedXp,
        },
      });

      if (result.leveledUp && result.newLevel) {
        Observe.logEvent('user.leveled_up', {
          attributes: {
            newLevel: result.newLevel,
          },
        });
      }

      setXpEarned(earnedXp);
      setLeveledUp(result.leveledUp);
      setNewLevel(result.newLevel);
      setUnlockedBadges(result.newlyUnlockedAchievements);
      setCelebrationVisible(true);
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível registrar a sessão.');
    }
  };

  const handleFinishWorkout = () => {
    const { completed, total } = calculateWorkoutProgress();

    if (completed === 0) {
      Alert.alert(
        'Nenhuma série concluída',
        'Marque pelo menos uma série antes de finalizar o treino.'
      );
      return;
    }

    Alert.alert(
      'Finalizar Treino',
      `Você concluiu ${completed} de ${total} séries. Deseja registrar e resgatar seu XP?`,
      [
        { text: 'Continuar Treinando', style: 'cancel' },
        {
          text: 'Finalizar!',
          style: 'default',
          onPress: async () => {
            await submitWorkout();
          },
        },
      ]
    );
  };

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timerFormatted = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return {
    loading,
    day,
    exerciseSets,
    handleToggleSet,
    handleChangeWeight,
    handleChangeReps,
    calculateWorkoutProgress,
    handleFinishWorkout,
    timerFormatted,
    restTimerVisible,
    setRestTimerVisible,
    restTimerSeconds,
    celebrationVisible,
    setCelebrationVisible,
    xpEarned,
    leveledUp,
    newLevel,
    unlockedBadges,
  };
}

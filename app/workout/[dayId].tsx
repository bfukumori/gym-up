import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CelebrationModal } from '../../src/components/CelebrationModal';
import { ExerciseCard, type SetState } from '../../src/components/ExerciseCard';
import { RestTimerModal } from '../../src/components/RestTimerModal';
import { BorderRadius, Colors, Spacing, Typography } from '../../src/constants/theme';
import { GamificationService } from '../../src/services/gamification';
import { StorageService } from '../../src/services/storage';
import type { Achievement, WorkoutDay, WorkoutPlan, WorkoutSessionLog } from '../../src/types';

export default function ActiveWorkoutScreen() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
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

  const handleFinishWorkout = async () => {
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
            const repsNum = parseInt(s.reps, 10) || 0;
            const weightNum = parseFloat(s.weightKg) || 0;
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

  if (loading || !day) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Carregando treino...</Text>
      </View>
    );
  }

  const { completed, total, percent } = calculateWorkoutProgress();
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timerStr = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            Alert.alert('Sair do Treino', 'Deseja realmente pausar/abandonar este treino?', [
              { text: 'Ficar no Treino', style: 'cancel' },
              { text: 'Sair', style: 'destructive', onPress: () => router.back() },
            ]);
          }}
          style={styles.backButton}
        >
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.topCenter}>
          <Text style={styles.topDayTitle} numberOfLines={1}>
            {day.name}
          </Text>
          <View style={styles.timeBadge}>
            <Ionicons name="stopwatch-outline" size={14} color={Colors.accentOrange} />
            <Text style={styles.timeText}>{timerStr}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.finishTopBtn} onPress={handleFinishWorkout}>
          <Text style={styles.finishTopBtnText}>Concluir</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.workoutProgressBarContainer}>
        <View style={[styles.workoutProgressBarFill, { width: `${percent}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
        {/* Exercise Cards */}
        {day.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            setStates={exerciseSets[exercise.id] || []}
            onToggleSet={(idx, rest) => handleToggleSet(exercise.id, idx, rest)}
            onChangeWeight={(idx, val) => handleChangeWeight(exercise.id, idx, val)}
            onChangeReps={(idx, val) => handleChangeReps(exercise.id, idx, val)}
          />
        ))}

        {/* Big Bottom Finish Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.bigFinishButton}
          onPress={handleFinishWorkout}
        >
          <Ionicons name="checkmark-done-circle" size={26} color="#000000" />
          <Text style={styles.bigFinishText}>
            Finalizar Treino ({completed}/{total} Séries)
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Rest Timer Modal */}
      <RestTimerModal
        visible={restTimerVisible}
        initialSeconds={restTimerSeconds}
        onClose={() => setRestTimerVisible(false)}
      />

      {/* Celebration Gamification Modal */}
      <CelebrationModal
        visible={celebrationVisible}
        xpEarned={xpEarned}
        leveledUp={leveledUp}
        newLevel={newLevel}
        unlockedAchievements={unlockedBadges}
        onDismiss={() => {
          setCelebrationVisible(false);
          router.replace('/(tabs)');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.base,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 6,
  },
  topCenter: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: Spacing.sm,
  },
  topDayTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  timeText: {
    color: Colors.accentOrange,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
  },
  finishTopBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
  },
  finishTopBtnText: {
    color: '#000000',
    fontSize: Typography.fontSizes.xs,
    fontWeight: '800',
  },
  workoutProgressBarContainer: {
    height: 4,
    backgroundColor: Colors.surface,
    width: '100%',
  },
  workoutProgressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  scrollList: {
    padding: Spacing.base,
    paddingBottom: 60,
  },
  bigFinishButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.lg,
  },
  bigFinishText: {
    color: '#000000',
    fontSize: Typography.fontSizes.base,
    fontWeight: '800',
  },
});

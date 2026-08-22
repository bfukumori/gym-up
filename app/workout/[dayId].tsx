import { Ionicons } from '@expo/vector-icons';
import { useObserve } from 'expo-observe';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CelebrationModal } from '../../src/components/CelebrationModal';
import { ExerciseCard } from '../../src/components/ExerciseCard';
import { RestTimerModal } from '../../src/components/RestTimerModal';
import { WorkoutTopBar } from '../../src/components/workout/WorkoutTopBar';
import { BorderRadius, Colors, Spacing, Typography } from '../../src/constants/theme';
import { useWorkoutSession } from '../../src/hooks/useWorkoutSession';

export default function ActiveWorkoutScreen() {
  const { markInteractive } = useObserve();
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    markInteractive();
  }, [markInteractive]);

  const {
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
  } = useWorkoutSession(dayId);

  if (loading || !day) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Carregando treino...</Text>
      </View>
    );
  }

  const { completed, total, percent } = calculateWorkoutProgress();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top Header Bar */}
        <WorkoutTopBar
          dayName={day.name}
          timerFormatted={timerFormatted}
          onClose={() => router.back()}
          onFinish={handleFinishWorkout}
        />

        {/* Progress Bar */}
        <View style={styles.workoutProgressBarContainer}>
          <View style={[styles.workoutProgressBarFill, { width: `${percent}%` }]} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
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
      </KeyboardAvoidingView>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardContainer: {
    flex: 1,
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

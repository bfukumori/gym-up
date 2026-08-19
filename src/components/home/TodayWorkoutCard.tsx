import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import type { WorkoutDay, WorkoutPlan } from '../../types';

interface TodayWorkoutCardProps {
  plan: WorkoutPlan;
  activeDay: WorkoutDay;
  selectedDayIndex: number;
  onSelectDayIndex: (index: number) => void;
}

export function TodayWorkoutCard({
  plan,
  activeDay,
  selectedDayIndex,
  onSelectDayIndex,
}: TodayWorkoutCardProps) {
  const router = useRouter();

  return (
    <View style={styles.todayCard}>
      <View style={styles.todayCardHeader}>
        <View style={styles.badgeToday}>
          <Ionicons name="flash" size={12} color={Colors.primary} />
          <Text style={styles.badgeTodayText}>PRÓXIMO TREINO</Text>
        </View>
        <Text style={styles.estimatedTimeText}>⏱ {activeDay.estimatedMinutes} min</Text>
      </View>

      <Text style={styles.dayNameText}>{activeDay.name}</Text>

      {/* Day Selector Pills */}
      {plan.days.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayPillsContainer}
        >
          {plan.days.map((d, idx) => (
            <TouchableOpacity
              key={d.id}
              style={[styles.dayPill, selectedDayIndex === idx && styles.dayPillActive]}
              onPress={() => {
                Haptics.selectionAsync();
                onSelectDayIndex(idx);
              }}
            >
              <Text
                style={[styles.dayPillText, selectedDayIndex === idx && styles.dayPillTextActive]}
              >
                {String.fromCharCode(65 + idx)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Muscle Groups Targets */}
      <View style={styles.muscleRow}>
        {activeDay.targetMuscleGroups.map((muscle) => (
          <View key={muscle} style={styles.muscleChip}>
            <Text style={styles.muscleChipText}>{muscle}</Text>
          </View>
        ))}
      </View>

      {/* Exercises Preview List */}
      <View style={styles.previewList}>
        {activeDay.exercises.map((ex, i) => (
          <View key={ex.id} style={styles.previewItem}>
            <Text style={styles.previewItemIndex}>{i + 1}.</Text>
            <Text style={styles.previewItemName} numberOfLines={1}>
              {ex.name}
            </Text>
            <Text style={styles.previewItemSets}>{ex.targetSets.length} séries</Text>
          </View>
        ))}
      </View>

      {/* Start Workout Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.startWorkoutButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push({
            pathname: '/workout/[dayId]',
            params: { dayId: activeDay.id },
          });
        }}
      >
        <Ionicons name="play" size={20} color="#000000" />
        <Text style={styles.startWorkoutButtonText}>COMEÇAR TREINO</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  todayCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    marginBottom: Spacing.base,
  },
  todayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  badgeToday: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    gap: 4,
  },
  badgeTodayText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  estimatedTimeText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
  },
  dayNameText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.lg,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  dayPillsContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  dayPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayPillText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
  },
  dayPillTextActive: {
    color: '#000000',
  },
  muscleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.md,
  },
  muscleChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  muscleChipText: {
    color: Colors.secondary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
  },
  previewList: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.base,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  previewItemIndex: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizes.xs,
    width: 20,
    fontWeight: '700',
  },
  previewItemName: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.xs,
    flex: 1,
    fontWeight: '500',
  },
  previewItemSets: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  startWorkoutButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  startWorkoutButtonText: {
    color: '#000000',
    fontSize: Typography.fontSizes.base,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

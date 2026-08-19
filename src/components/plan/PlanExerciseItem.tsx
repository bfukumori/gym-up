import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import type { Exercise } from '../../types';

interface PlanExerciseItemProps {
  exercise: Exercise;
  index: number;
}

export function PlanExerciseItem({ exercise, index }: PlanExerciseItemProps) {
  return (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseCardHeader}>
        <View style={styles.exerciseIndexBadge}>
          <Text style={styles.exerciseIndexText}>{index + 1}</Text>
        </View>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <View style={styles.exerciseTags}>
            <Text style={styles.tagText}>{exercise.muscleGroup}</Text>
            <Text style={styles.tagDot}>•</Text>
            <Text style={styles.tagText}>{exercise.equipment}</Text>
          </View>
        </View>
      </View>

      {exercise.notes ? (
        <View style={styles.exerciseNotes}>
          <Ionicons name="bulb-outline" size={14} color={Colors.accentGold} />
          <Text style={styles.exerciseNotesText}>{exercise.notes}</Text>
        </View>
      ) : null}

      {/* Target Sets Preview */}
      <View style={styles.setsTable}>
        {exercise.targetSets.map((ts, sIdx) => {
          const setNum = ts.setNumber || sIdx + 1;
          return (
            <View key={`target-set-${setNum}`} style={styles.setRow}>
              <Text style={styles.setLabel}>Série {setNum}</Text>
              <Text style={styles.setValue}>{ts.targetReps} reps</Text>
              {ts.suggestedWeightKg ? (
                <Text style={styles.setWeight}>~{ts.suggestedWeightKg} kg</Text>
              ) : null}
              <Text style={styles.setRest}>⏱ {ts.restSeconds}s desc.</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  exerciseCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  exerciseIndexBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseIndexText: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '800',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: '700',
  },
  exerciseTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  tagText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizes.xs,
  },
  tagDot: {
    color: Colors.textDisabled,
  },
  exerciseNotes: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
    gap: 6,
  },
  exerciseNotesText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    flex: 1,
  },
  setsTable: {
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  setLabel: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizes.xs,
    width: 60,
  },
  setValue: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
    flex: 1,
  },
  setWeight: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
    marginRight: Spacing.md,
  },
  setRest: {
    color: Colors.textMuted,
    fontSize: 10,
  },
});

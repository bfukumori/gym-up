import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/theme';
import type { Exercise } from '../types';

export interface SetState {
  setNumber: number;
  reps: string;
  weightKg: string;
  isCompleted: boolean;
}

interface ExerciseCardProps {
  exercise: Exercise;
  setStates: SetState[];
  onToggleSet: (setIndex: number, restSeconds: number) => void;
  onChangeWeight: (setIndex: number, weight: string) => void;
  onChangeReps: (setIndex: number, reps: string) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  setStates,
  onToggleSet,
  onChangeWeight,
  onChangeReps,
}) => {
  const completedCount = setStates.filter((s) => s.isCompleted).length;
  const totalCount = setStates.length;
  const isAllDone = totalCount > 0 && completedCount === totalCount;

  return (
    <View style={[styles.card, isAllDone && styles.cardCompleted]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleArea}>
          <Text style={[styles.exerciseName, isAllDone && styles.exerciseNameCompleted]}>
            {exercise.name}
          </Text>
          <View style={styles.badgeRow}>
            <View style={styles.badgeMuscle}>
              <Text style={styles.badgeMuscleText}>{exercise.muscleGroup}</Text>
            </View>
            <View style={styles.badgeEquip}>
              <Text style={styles.badgeEquipText}>{exercise.equipment}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.progressBadge, isAllDone && styles.progressBadgeDone]}>
          <Text style={[styles.progressBadgeText, isAllDone && styles.progressBadgeTextDone]}>
            {completedCount}/{totalCount}
          </Text>
        </View>
      </View>

      {/* Notes / Tips */}
      {exercise.notes ? (
        <View style={styles.notesContainer}>
          <Ionicons name="bulb-outline" size={14} color={Colors.accentGold} />
          <Text style={styles.notesText}>{exercise.notes}</Text>
        </View>
      ) : null}

      {/* Set Header */}
      <View style={styles.setRowHeader}>
        <Text style={[styles.colHeader, styles.colSet]}>SÉRIE</Text>
        <Text style={[styles.colHeader, styles.colTarget]}>ALVO</Text>
        <Text style={[styles.colHeader, styles.colInput]}>PESO (KG)</Text>
        <Text style={[styles.colHeader, styles.colInput]}>REPS</Text>
        <Text style={[styles.colHeader, styles.colAction]}>STATUS</Text>
      </View>

      {/* Set Rows */}
      {setStates.map((state, index) => {
        const target = exercise.targetSets[index];
        const restSec = target?.restSeconds || 60;

        return (
          <View
            key={`set-row-${state.setNumber}`}
            style={[styles.setRow, state.isCompleted && styles.setRowCompleted]}
          >
            <View style={styles.colSet}>
              <Text style={[styles.setNumberText, state.isCompleted && styles.completedText]}>
                #{state.setNumber}
              </Text>
            </View>

            <View style={styles.colTarget}>
              <Text style={styles.targetRepsText}>{target?.targetReps || '10-12'}</Text>
              <Text style={styles.restText}>{restSec}s</Text>
            </View>

            <View style={styles.colInput}>
              <TextInput
                style={[styles.input, state.isCompleted && styles.inputCompleted]}
                keyboardType="numeric"
                value={state.weightKg}
                onChangeText={(val) => onChangeWeight(index, val)}
                placeholder="0"
                placeholderTextColor={Colors.textDisabled}
                editable={!state.isCompleted}
              />
            </View>

            <View style={styles.colInput}>
              <TextInput
                style={[styles.input, state.isCompleted && styles.inputCompleted]}
                keyboardType="numeric"
                value={state.reps}
                onChangeText={(val) => onChangeReps(index, val)}
                placeholder="0"
                placeholderTextColor={Colors.textDisabled}
                editable={!state.isCompleted}
              />
            </View>

            <View style={styles.colAction}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.checkButton, state.isCompleted && styles.checkButtonActive]}
                onPress={() => {
                  Haptics.impactAsync(
                    state.isCompleted
                      ? Haptics.ImpactFeedbackStyle.Light
                      : Haptics.ImpactFeedbackStyle.Medium
                  );
                  onToggleSet(index, restSec);
                }}
              >
                <Ionicons
                  name={state.isCompleted ? 'checkmark-done' : 'checkmark'}
                  size={18}
                  color={state.isCompleted ? '#000000' : Colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
  },
  cardCompleted: {
    borderColor: Colors.primaryBorder,
    backgroundColor: 'rgba(21, 26, 34, 0.95)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  titleArea: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  exerciseName: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.md,
    fontWeight: '700',
    marginBottom: 6,
  },
  exerciseNameCompleted: {
    color: Colors.primary,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  badgeMuscle: {
    backgroundColor: Colors.secondaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  badgeMuscleText: {
    color: Colors.secondary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
  },
  badgeEquip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  badgeEquipText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
  },
  progressBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  progressBadgeDone: {
    backgroundColor: Colors.primaryMuted,
  },
  progressBadgeText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
  },
  progressBadgeTextDone: {
    color: Colors.primary,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginVertical: Spacing.sm,
    gap: 6,
  },
  notesText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    flex: 1,
    lineHeight: 16,
  },
  setRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginTop: Spacing.xs,
  },
  colHeader: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  colSet: { width: 44, alignItems: 'center' },
  colTarget: { width: 70, alignItems: 'center' },
  colInput: { flex: 1, paddingHorizontal: 4, alignItems: 'center' },
  colAction: { width: 50, alignItems: 'center' },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(36, 44, 61, 0.4)',
  },
  setRowCompleted: {
    backgroundColor: 'rgba(0, 230, 118, 0.04)',
    borderRadius: BorderRadius.sm,
  },
  setNumberText: {
    color: Colors.textSecondary,
    fontWeight: '700',
    fontSize: Typography.fontSizes.sm,
    textAlign: 'center',
  },
  completedText: {
    color: Colors.primary,
  },
  targetRepsText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  restText: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    borderRadius: BorderRadius.sm,
    paddingVertical: 6,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontSize: Typography.fontSizes.sm,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
  },
  inputCompleted: {
    backgroundColor: Colors.cardHover,
    borderColor: 'transparent',
    color: Colors.textMuted,
  },
  checkButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
});

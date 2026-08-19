import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import type { WorkoutDay } from '../../types';

interface DayOverviewCardProps {
  activeDay: WorkoutDay;
}

export function DayOverviewCard({ activeDay }: DayOverviewCardProps) {
  return (
    <View style={styles.daySummaryCard}>
      <Text style={styles.dayFullTitle}>{activeDay.name}</Text>
      <View style={styles.dayMetaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{activeDay.estimatedMinutes} min</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="barbell-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{activeDay.exercises.length} exercícios</Text>
        </View>
      </View>

      <View style={styles.musclesRow}>
        {activeDay.targetMuscleGroups.map((m) => (
          <View key={m} style={styles.muscleBadge}>
            <Text style={styles.muscleBadgeText}>{m}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  daySummaryCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
  },
  dayFullTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.md,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  dayMetaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
  },
  musclesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  muscleBadge: {
    backgroundColor: Colors.secondaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  muscleBadgeText: {
    color: Colors.secondary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
  },
});

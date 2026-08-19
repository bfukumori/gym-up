import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';

interface WeeklyAdherenceCardProps {
  workoutsThisWeek: number;
  targetDaysPerWeek: number;
  weekProgressPercent: number;
}

export function WeeklyAdherenceCard({
  workoutsThisWeek,
  targetDaysPerWeek,
  weekProgressPercent,
}: WeeklyAdherenceCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="calendar" size={16} color={Colors.primary} />
          <Text style={styles.title}>Meta Semanal</Text>
        </View>
        <Text style={styles.count}>
          {workoutsThisWeek} de {targetDaysPerWeek} treinos
        </Text>
      </View>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${weekProgressPercent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
  },
  count: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
});

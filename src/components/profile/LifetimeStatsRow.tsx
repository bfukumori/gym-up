import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import type { UserStats } from '../../types';

interface LifetimeStatsRowProps {
  stats: UserStats;
}

export function LifetimeStatsRow({ stats }: LifetimeStatsRowProps) {
  return (
    <View style={styles.statsRow}>
      <View style={styles.statMiniCard}>
        <Text style={styles.statNumber}>{stats.totalWorkoutsCompleted}</Text>
        <Text style={styles.statLabel}>Treinos</Text>
      </View>
      <View style={styles.statMiniCard}>
        <Text style={styles.statNumber}>{stats.totalSetsCompleted}</Text>
        <Text style={styles.statLabel}>Séries</Text>
      </View>
      <View style={styles.statMiniCard}>
        <Text style={styles.statNumber}>{(stats.totalVolumeKg / 1000).toFixed(1)}k</Text>
        <Text style={styles.statLabel}>Kg Tonnage</Text>
      </View>
      <View style={styles.statMiniCard}>
        <Text style={styles.statNumber}>{stats.longestStreakDays}d</Text>
        <Text style={styles.statLabel}>Recorde</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  statMiniCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.md,
    fontWeight: '800',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    marginTop: 2,
    textTransform: 'uppercase',
  },
});

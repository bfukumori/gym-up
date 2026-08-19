import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import type { UserStats } from '../../types';

interface QuickStatsGridProps {
  stats: UserStats;
}

export function QuickStatsGrid({ stats }: QuickStatsGridProps) {
  return (
    <View style={styles.statsGrid}>
      <View style={styles.statBox}>
        <Ionicons name="barbell-outline" size={20} color={Colors.primary} />
        <Text style={styles.statValue}>{stats.totalWorkoutsCompleted}</Text>
        <Text style={styles.statLabel}>Treinos Feitos</Text>
      </View>

      <View style={styles.statBox}>
        <Ionicons name="repeat-outline" size={20} color={Colors.secondary} />
        <Text style={styles.statValue}>{stats.totalSetsCompleted}</Text>
        <Text style={styles.statLabel}>Séries Feitas</Text>
      </View>

      <View style={styles.statBox}>
        <Ionicons name="trophy-outline" size={20} color={Colors.accentGold} />
        <Text style={styles.statValue}>{stats.unlockedAchievementIds.length}</Text>
        <Text style={styles.statLabel}>Conquistas</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.md,
    fontWeight: '800',
    marginTop: 4,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
});

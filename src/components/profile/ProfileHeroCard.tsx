import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { getLevelTitle } from '../../services/gamification';
import type { UserStats } from '../../types';

interface ProfileHeroCardProps {
  stats: UserStats;
}

export function ProfileHeroCard({ stats }: ProfileHeroCardProps) {
  return (
    <View style={styles.profileCard}>
      <View style={styles.avatarCircle}>
        <Ionicons name="barbell" size={32} color={Colors.primary} />
      </View>

      <Text style={styles.userName}>Atleta Gym-Up</Text>
      <Text style={styles.userTitle}>{getLevelTitle(stats.level)}</Text>

      <View style={styles.levelBadgeRow}>
        <View style={styles.levelPill}>
          <Text style={styles.levelPillText}>NÍVEL {stats.level}</Text>
        </View>
        <View style={styles.streakPill}>
          <Ionicons name="flame" size={14} color={Colors.accentOrange} />
          <Text style={styles.streakPillText}>{stats.currentStreakDays} dias de streak</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  userName: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.lg,
    fontWeight: '800',
  },
  userTitle: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  levelBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  levelPill: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  levelPillText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '800',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentOrangeMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  streakPillText: {
    color: Colors.accentOrange,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
  },
});

import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/theme';
import { getLevelTitle } from '../services/gamification';
import type { UserStats } from '../types';

interface XpHeaderProps {
  stats: UserStats;
}

export const XpHeader: React.FC<XpHeaderProps> = ({ stats }) => {
  const progressPercent = Math.min(
    100,
    Math.max(0, (stats.currentXp / (stats.xpToNextLevel || 1)) * 100)
  );

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.levelInfo}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelNumber}>{stats.level}</Text>
          </View>
          <View style={styles.levelTextContainer}>
            <Text style={styles.levelLabel}>NÍVEL {stats.level}</Text>
            <Text style={styles.levelTitle}>{getLevelTitle(stats.level)}</Text>
          </View>
        </View>

        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={18} color={Colors.accentOrange} />
          <Text style={styles.streakText}>{stats.currentStreakDays} dias</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <View style={styles.xpTextRow}>
          <Text style={styles.xpDetail}>
            {stats.currentXp} <Text style={styles.xpMuted}>/ {stats.xpToNextLevel} XP</Text>
          </Text>
          <Text style={styles.xpPercent}>{Math.round(progressPercent)}%</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  levelNumber: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.lg,
    fontWeight: '800',
  },
  levelTextContainer: {
    justifyContent: 'center',
  },
  levelLabel: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  levelTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: '700',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentOrangeMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 112, 67, 0.4)',
    gap: 4,
  },
  streakText: {
    color: Colors.accentOrange,
    fontWeight: '700',
    fontSize: Typography.fontSizes.sm,
  },
  progressContainer: {
    marginTop: 2,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  xpTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  xpDetail: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
  },
  xpMuted: {
    color: Colors.textMuted,
    fontWeight: '400',
  },
  xpPercent: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
  },
});

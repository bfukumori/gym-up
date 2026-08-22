import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import type { Achievement } from '../../types';

interface AchievementsGridProps {
  achievements: Achievement[];
  unlockedCount: number;
}

export function AchievementsGrid({ achievements, unlockedCount }: AchievementsGridProps) {
  // Chunk achievements into pairs of 2 for a symmetrical, pixel-perfect 2-column grid
  const rows: Achievement[][] = [];
  for (let i = 0; i < achievements.length; i += 2) {
    rows.push(achievements.slice(i, i + 2));
  }

  return (
    <View>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="trophy" size={20} color={Colors.accentGold} />
          <Text style={styles.sectionTitle}>Conquistas & Badges</Text>
        </View>
        <Text style={styles.sectionBadgeCount}>
          {unlockedCount}/{achievements.length}
        </Text>
      </View>

      <View style={styles.gridContainer}>
        {rows.map((pair, rowIdx) => (
          <View key={pair[0]?.id || rowIdx} style={styles.row}>
            {pair.map((ach) => {
              const isUnlocked = Boolean(ach.unlockedAt);
              return (
                <View
                  key={ach.id}
                  style={[styles.achievementCard, isUnlocked && styles.achievementCardUnlocked]}
                >
                  <View
                    style={[
                      styles.achievementIconBox,
                      isUnlocked && styles.achievementIconBoxUnlocked,
                    ]}
                  >
                    <Ionicons
                      name={isUnlocked ? 'ribbon' : 'lock-closed'}
                      size={22}
                      color={isUnlocked ? Colors.accentGold : Colors.textDisabled}
                    />
                  </View>
                  <Text
                    style={[styles.achievementName, isUnlocked && styles.achievementNameUnlocked]}
                    numberOfLines={1}
                  >
                    {ach.title}
                  </Text>
                  <Text style={styles.achievementDesc} numberOfLines={2}>
                    {ach.description}
                  </Text>
                  <View style={styles.achievementXpPill}>
                    <Text
                      style={[
                        styles.achievementXpText,
                        isUnlocked && styles.achievementXpTextUnlocked,
                      ]}
                    >
                      +{ach.xpReward} XP
                    </Text>
                  </View>
                </View>
              );
            })}
            {pair.length === 1 && <View style={[styles.achievementCard, styles.placeholderCard]} />}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: '800',
  },
  sectionBadgeCount: {
    color: Colors.accentGold,
    fontSize: Typography.fontSizes.sm,
    fontWeight: '800',
  },
  gridContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  achievementCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  placeholderCard: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  achievementCardUnlocked: {
    borderColor: 'rgba(255, 215, 0, 0.4)',
    backgroundColor: 'rgba(255, 215, 0, 0.04)',
  },
  achievementIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  achievementIconBoxUnlocked: {
    backgroundColor: Colors.accentGoldMuted,
  },
  achievementName: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  achievementNameUnlocked: {
    color: Colors.textPrimary,
  },
  achievementDesc: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
    height: 28,
  },
  achievementXpPill: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  achievementXpText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  achievementXpTextUnlocked: {
    color: Colors.accentGold,
  },
});

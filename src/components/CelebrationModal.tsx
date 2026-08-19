import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/theme';
import type { Achievement } from '../types';

interface CelebrationModalProps {
  visible: boolean;
  xpEarned: number;
  newLevel?: number;
  leveledUp?: boolean;
  unlockedAchievements: Achievement[];
  onDismiss: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  visible,
  xpEarned,
  newLevel,
  leveledUp,
  unlockedAchievements,
  onDismiss,
}) => {
  if (!visible) return null;

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Top Banner Icon */}
          <View style={styles.iconCircle}>
            <Ionicons
              name={leveledUp ? 'sparkles' : 'trophy'}
              size={36}
              color={Colors.accentGold}
            />
          </View>

          <Text style={styles.title}>{leveledUp ? 'SUBIU DE NÍVEL!' : 'TREINO CONCLUÍDO!'}</Text>

          <Text style={styles.subtitle}>
            {leveledUp
              ? `Parabéns! Você alcançou o Nível ${newLevel} no Gym-Up!`
              : 'Excelente consistência! Mais um passo rumo ao seu objetivo.'}
          </Text>

          {/* XP Gained Highlight */}
          <View style={styles.xpCard}>
            <Ionicons name="flash" size={24} color={Colors.primary} />
            <View style={styles.xpTextGroup}>
              <Text style={styles.xpAmount}>+{xpEarned} XP</Text>
              <Text style={styles.xpDesc}>Adicionados à sua evolução</Text>
            </View>
          </View>

          {/* Unlocked Badges Section */}
          {unlockedAchievements.length > 0 ? (
            <View style={styles.achievementsSection}>
              <Text style={styles.achievementsTitle}>Conquistas Desbloqueadas:</Text>
              <ScrollView style={styles.achievementsList}>
                {unlockedAchievements.map((ach) => (
                  <View key={ach.id} style={styles.achievementRow}>
                    <View style={styles.achIconBox}>
                      <Ionicons name="ribbon" size={20} color={Colors.accentGold} />
                    </View>
                    <View style={styles.achInfo}>
                      <Text style={styles.achName}>{ach.title}</Text>
                      <Text style={styles.achDesc}>{ach.description}</Text>
                    </View>
                    <View style={styles.achXpBadge}>
                      <Text style={styles.achXpText}>+{ach.xpReward} XP</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* Action Button */}
          <TouchableOpacity activeOpacity={0.8} style={styles.continueBtn} onPress={onDismiss}>
            <Text style={styles.continueBtnText}>Continuar</Text>
            <Ionicons name="arrow-forward" size={18} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accentGoldMuted,
    borderWidth: 2,
    borderColor: Colors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.xl,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.sm,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  xpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    gap: Spacing.md,
    marginBottom: Spacing.base,
  },
  xpTextGroup: {
    flex: 1,
  },
  xpAmount: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.xl,
    fontWeight: '900',
  },
  xpDesc: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizes.xs,
  },
  achievementsSection: {
    width: '100%',
    marginBottom: Spacing.base,
  },
  achievementsTitle: {
    color: Colors.accentGold,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  achievementsList: {
    maxHeight: 160,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  achIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accentGoldMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achInfo: {
    flex: 1,
  },
  achName: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
  },
  achDesc: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  achXpBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  achXpText: {
    color: Colors.accentGold,
    fontSize: 10,
    fontWeight: '700',
  },
  continueBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  continueBtnText: {
    color: '#000000',
    fontSize: Typography.fontSizes.md,
    fontWeight: '800',
  },
});

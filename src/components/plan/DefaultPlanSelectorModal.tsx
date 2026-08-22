import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEFAULT_PLANS, type DefaultPlanOption } from '../../constants/defaultPlans';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import type { WorkoutPlan } from '../../types';

interface DefaultPlanSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPlan: (plan: WorkoutPlan) => Promise<void> | void;
  hasGeminiKey: boolean;
  onOpenQuiz?: () => void;
  onOpenProfile?: () => void;
}

export function DefaultPlanSelectorModal({
  visible,
  onClose,
  onSelectPlan,
  hasGeminiKey,
  onOpenQuiz,
  onOpenProfile,
}: DefaultPlanSelectorModalProps) {
  const insets = useSafeAreaInsets();
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(
    'intermediate'
  );

  const currentOption = DEFAULT_PLANS[selectedLevel];

  const handleConfirmSelect = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await onSelectPlan(currentOption.plan);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top || Spacing.md }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Escolha sua Ficha de Treino</Text>
            <Text style={styles.headerSubtitle}>
              Selecione o nível ideal para seu momento atual. Fichas estruturadas e prontas.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom > 0 ? insets.bottom + 90 : 110 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* AI Banner / Callout */}
          <View style={styles.aiBanner}>
            <View style={styles.aiBannerIcon}>
              <Ionicons name="sparkles" size={20} color={Colors.primary} />
            </View>
            <View style={styles.aiBannerText}>
              <Text style={styles.aiBannerTitle}>
                {hasGeminiKey ? 'Chave Gemini Ativa!' : 'Quer uma Ficha 100% Personalizada?'}
              </Text>
              <Text style={styles.aiBannerDesc}>
                {hasGeminiKey
                  ? 'Você possui IA habilitada. Pode usar as fichas padrão ou montar uma rotina sob medida.'
                  : 'Adicione sua chave gratuita do Google AI Studio no Perfil para gerar treinos adaptados às suas dores e rotina.'}
              </Text>
              {hasGeminiKey && onOpenQuiz ? (
                <TouchableOpacity
                  style={styles.aiActionBtn}
                  onPress={() => {
                    onClose();
                    onOpenQuiz();
                  }}
                >
                  <Text style={styles.aiActionBtnText}>Abrir Assistente com IA →</Text>
                </TouchableOpacity>
              ) : onOpenProfile ? (
                <TouchableOpacity
                  style={styles.aiActionBtn}
                  onPress={() => {
                    onClose();
                    onOpenProfile();
                  }}
                >
                  <Text style={styles.aiActionBtnText}>Configurar Chave no Perfil →</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Level Tabs */}
          <Text style={styles.sectionTitle}>SELECIONE O NÍVEL:</Text>
          <View style={styles.levelTabsContainer}>
            {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => {
              const opt = DEFAULT_PLANS[lvl];
              const isSelected = selectedLevel === lvl;
              return (
                <TouchableOpacity
                  key={lvl}
                  style={[styles.levelTab, isSelected && styles.levelTabActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedLevel(lvl);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.levelTabBadge, isSelected && styles.levelTabBadgeActive]}>
                    {opt.levelBadge}
                  </Text>
                  <Text style={[styles.levelTabDays, isSelected && styles.levelTabDaysActive]}>
                    {opt.daysCount}x / semana
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Active Plan Detail Card */}
          <View style={styles.detailCard}>
            <View style={styles.detailCardHeader}>
              <View>
                <Text style={styles.detailCardTitle}>{currentOption.title}</Text>
                <Text style={styles.detailCardSubtitle}>{currentOption.subtitle}</Text>
              </View>
            </View>

            <Text style={styles.detailCardDesc}>{currentOption.description}</Text>

            {/* Highlights */}
            <View style={styles.highlightsBox}>
              <Text style={styles.highlightsTitle}>DESTAQUES DA FICHA:</Text>
              {currentOption.highlights.map((h, i) => (
                <View key={`h-${i}`} style={styles.highlightRow}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                  <Text style={styles.highlightText}>{h}</Text>
                </View>
              ))}
            </View>

            {/* Days Preview */}
            <Text style={[styles.highlightsTitle, { marginTop: Spacing.base }]}>
              DIVISÃO DOS TREINOS ({currentOption.plan.days.length} DIAS):
            </Text>
            <View style={styles.daysList}>
              {currentOption.plan.days.map((d, dIdx) => (
                <View key={d.id} style={styles.dayItem}>
                  <View style={styles.dayBadge}>
                    <Text style={styles.dayBadgeText}>DIA {dIdx + 1}</Text>
                  </View>
                  <View style={styles.dayInfo}>
                    <Text style={styles.dayName}>{d.name}</Text>
                    <Text style={styles.dayMuscles}>
                      {d.targetMuscleGroups.join(' • ')} ({d.exercises.length} exercícios)
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : Spacing.base },
          ]}
        >
          <TouchableOpacity
            style={styles.activateBtn}
            onPress={handleConfirmSelect}
            activeOpacity={0.8}
          >
            <Ionicons name="flash" size={18} color="#000000" />
            <Text style={styles.activateBtnText}>
              ATIVAR FICHA {currentOption.levelBadge.toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.lg,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    marginTop: 2,
    lineHeight: 18,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scrollContent: {
    padding: Spacing.base,
  },
  aiBanner: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    padding: Spacing.base,
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  aiBannerIcon: {
    marginTop: 2,
  },
  aiBannerText: {
    flex: 1,
  },
  aiBannerTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
    marginBottom: 2,
  },
  aiBannerDesc: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    lineHeight: 17,
    marginBottom: 6,
  },
  aiActionBtn: {
    alignSelf: 'flex-start',
  },
  aiActionBtnText: {
    color: Colors.accentBlue,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  levelTabsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  levelTab: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  levelTabActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  levelTabBadge: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    marginBottom: 4,
  },
  levelTabBadgeActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  levelTabDays: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  levelTabDaysActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  detailCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailCardHeader: {
    marginBottom: Spacing.sm,
  },
  detailCardTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.md,
    fontWeight: '800',
  },
  detailCardSubtitle: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    marginTop: 2,
  },
  detailCardDesc: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  highlightsBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  highlightsTitle: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  highlightText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    flex: 1,
    lineHeight: 16,
  },
  daysList: {
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  dayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayBadge: {
    backgroundColor: Colors.card,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayBadgeText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
  },
  dayMuscles: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  activateBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  activateBtnText: {
    color: '#000000',
    fontSize: Typography.fontSizes.base,
    fontWeight: '800',
  },
});

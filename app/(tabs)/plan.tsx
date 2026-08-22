import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useObserve } from 'expo-observe';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DayOverviewCard } from '../../src/components/plan/DayOverviewCard';
import { DaySelectorTabs } from '../../src/components/plan/DaySelectorTabs';
import { DefaultPlanSelectorModal } from '../../src/components/plan/DefaultPlanSelectorModal';
import { PlanExerciseItem } from '../../src/components/plan/PlanExerciseItem';
import { BorderRadius, Colors, Spacing, Typography } from '../../src/constants/theme';
import { usePlanData } from '../../src/hooks/usePlanData';

export default function PlanScreen() {
  const { markInteractive } = useObserve();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    markInteractive();
  }, [markInteractive]);
  const {
    plan,
    selectedDayIdx,
    setSelectedDayIdx,
    activeDay,
    hasGeminiKey,
    defaultPlansModalVisible,
    setDefaultPlansModalVisible,
    handleSelectPlan,
    handleResetPlan,
  } = usePlanData();

  if (!plan?.days || plan.days.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Ionicons
              name={hasGeminiKey ? 'sparkles' : 'barbell-outline'}
              size={40}
              color={Colors.primary}
            />
          </View>
          <Text style={styles.emptyTitle}>Nenhuma ficha ativa</Text>
          <Text style={styles.emptyDesc}>
            {hasGeminiKey
              ? 'Monte sua rotina personalizada com inteligência artificial ou escolha um dos nossos treinos padrão prontos.'
              : 'Selecione uma ficha padrão balanceada (Iniciante, Intermediário ou Avançado) em 1 clique.'}
          </Text>

          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => setDefaultPlansModalVisible(true)}
          >
            <Ionicons name="flash" size={18} color="#000000" />
            <Text style={styles.createBtnText}>Escolher Treino Padrão</Text>
          </TouchableOpacity>

          {hasGeminiKey ? (
            <TouchableOpacity
              style={styles.secondaryQuizBtn}
              onPress={() => router.push('/onboarding/quiz')}
            >
              <Ionicons name="sparkles" size={16} color={Colors.primary} />
              <Text style={styles.secondaryQuizBtnText}>Montar com Assistente IA</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.secondaryQuizBtn}
              onPress={() => router.navigate('/(tabs)/profile')}
            >
              <Ionicons name="sparkles" size={14} color={Colors.accentBlue} />
              <Text style={styles.secondaryLinkText}>
                Adicionar chave Gemini para IA personalizada
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <DefaultPlanSelectorModal
          visible={defaultPlansModalVisible}
          onClose={() => setDefaultPlansModalVisible(false)}
          onSelectPlan={handleSelectPlan}
          hasGeminiKey={hasGeminiKey}
          onOpenQuiz={() => router.push('/onboarding/quiz')}
          onOpenProfile={() => router.navigate('/(tabs)/profile')}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>{plan.title}</Text>
          <Text style={styles.headerSubtitle} numberOfLines={2}>
            {plan.description}
          </Text>
        </View>

        <TouchableOpacity style={styles.recreateBtn} onPress={handleResetPlan}>
          <Ionicons name="swap-horizontal" size={16} color={Colors.primary} />
          <Text style={styles.recreateBtnText}>Trocar</Text>
        </TouchableOpacity>
      </View>

      {/* Day Selector Tabs */}
      <DaySelectorTabs
        days={plan.days}
        selectedDayIdx={selectedDayIdx}
        onSelectDayIdx={setSelectedDayIdx}
      />

      {/* Day Content */}
      <ScrollView contentContainerStyle={styles.contentList} showsVerticalScrollIndicator={false}>
        {activeDay && (
          <>
            <DayOverviewCard activeDay={activeDay} />

            <Text style={styles.exercisesSectionTitle}>Exercícios Programados</Text>

            {activeDay.exercises.map((exercise, exIdx) => (
              <PlanExerciseItem key={exercise.id} exercise={exercise} index={exIdx} />
            ))}

            {/* Start Workout Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.startDayBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push({
                  pathname: '/workout/[dayId]',
                  params: { dayId: activeDay.id },
                });
              }}
            >
              <Ionicons name="play" size={20} color="#000000" />
              <Text style={styles.startDayBtnText}>INICIAR {activeDay.name.toUpperCase()}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Default Plan Selector Modal */}
      <DefaultPlanSelectorModal
        visible={defaultPlansModalVisible}
        onClose={() => setDefaultPlansModalVisible(false)}
        onSelectPlan={handleSelectPlan}
        hasGeminiKey={hasGeminiKey}
        onOpenQuiz={() => router.push('/onboarding/quiz')}
        onOpenProfile={() => router.navigate('/(tabs)/profile')}
      />
    </View>
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
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.md,
    fontWeight: '800',
    lineHeight: 22,
  },
  headerSubtitle: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizes.xs,
    marginTop: 4,
    lineHeight: 16,
  },
  recreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
    gap: 4,
    alignSelf: 'flex-start',
  },
  recreateBtnText: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
  },
  contentList: {
    padding: Spacing.base,
    paddingBottom: 40,
  },
  exercisesSectionTitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  startDayBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.base,
  },
  startDayBtnText: {
    color: '#000000',
    fontSize: Typography.fontSizes.base,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.xl,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  emptyDesc: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  createBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    width: '100%',
    justifyContent: 'center',
  },
  createBtnText: {
    color: '#000000',
    fontSize: Typography.fontSizes.base,
    fontWeight: '800',
  },
  secondaryQuizBtn: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.xs,
  },
  secondaryQuizBtnText: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
  },
  secondaryLinkText: {
    color: Colors.accentBlue,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
  },
});

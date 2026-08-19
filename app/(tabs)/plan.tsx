import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing, Typography } from '../../src/constants/theme';
import { StorageService } from '../../src/services/storage';
import type { WorkoutPlan } from '../../src/types';

export default function PlanScreen() {
  const router = useRouter();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  const loadPlan = useCallback(async () => {
    const saved = await StorageService.getWorkoutPlan();
    setPlan(saved);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPlan();
    }, [loadPlan])
  );

  const handleResetPlan = () => {
    Alert.alert(
      'Recriar Ficha',
      'Deseja criar uma nova ficha de treino respondendo ao questionário do Gemini?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Recriar',
          style: 'destructive',
          onPress: () => router.push('/onboarding/quiz'),
        },
      ]
    );
  };

  if (!plan?.days || plan.days.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="barbell-outline" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Nenhuma ficha ativa</Text>
          <Text style={styles.emptyDesc}>
            Crie sua rotina personalizada em poucos segundos com a inteligência do Gemini.
          </Text>

          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => router.push('/onboarding/quiz')}
          >
            <Ionicons name="sparkles" size={18} color="#000000" />
            <Text style={styles.createBtnText}>Montar Treino com IA</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const activeDay = plan.days[selectedDayIdx] || plan.days[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>{plan.title}</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {plan.description}
          </Text>
        </View>

        <TouchableOpacity style={styles.recreateBtn} onPress={handleResetPlan}>
          <Ionicons name="refresh" size={18} color={Colors.primary} />
          <Text style={styles.recreateBtnText}>Nova IA</Text>
        </TouchableOpacity>
      </View>

      {/* Day Selector Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {plan.days.map((d, index) => {
            const isSelected = selectedDayIdx === index;
            const letter = String.fromCharCode(65 + index);
            return (
              <TouchableOpacity
                key={d.id}
                style={[styles.tabButton, isSelected && styles.tabButtonActive]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedDayIdx(index);
                }}
              >
                <Text style={[styles.tabButtonText, isSelected && styles.tabButtonTextActive]}>
                  Treino {letter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Day Content */}
      <ScrollView contentContainerStyle={styles.contentList} showsVerticalScrollIndicator={false}>
        {/* Day Card Header */}
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

        {/* Exercises List */}
        <Text style={styles.exercisesSectionTitle}>Exercícios Programados</Text>

        {activeDay.exercises.map((exercise, exIdx) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseCardHeader}>
              <View style={styles.exerciseIndexBadge}>
                <Text style={styles.exerciseIndexText}>{exIdx + 1}</Text>
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <View style={styles.exerciseTags}>
                  <Text style={styles.tagText}>{exercise.muscleGroup}</Text>
                  <Text style={styles.tagDot}>•</Text>
                  <Text style={styles.tagText}>{exercise.equipment}</Text>
                </View>
              </View>
            </View>

            {exercise.notes ? (
              <View style={styles.exerciseNotes}>
                <Ionicons name="bulb-outline" size={14} color={Colors.accentGold} />
                <Text style={styles.exerciseNotesText}>{exercise.notes}</Text>
              </View>
            ) : null}

            {/* Target Sets Preview */}
            <View style={styles.setsTable}>
              {exercise.targetSets.map((ts, sIdx) => {
                const setNum = ts.setNumber || sIdx + 1;
                return (
                  <View key={`target-set-${setNum}`} style={styles.setRow}>
                    <Text style={styles.setLabel}>Série {setNum}</Text>
                    <Text style={styles.setValue}>{ts.targetReps} reps</Text>
                    {ts.suggestedWeightKg ? (
                      <Text style={styles.setWeight}>~{ts.suggestedWeightKg} kg</Text>
                    ) : null}
                    <Text style={styles.setRest}>⏱ {ts.restSeconds}s desc.</Text>
                  </View>
                );
              })}
            </View>
          </View>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.lg,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizes.xs,
    marginTop: 2,
  },
  recreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  recreateBtnText: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
  },
  tabsWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  tabsContainer: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  tabButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabButtonText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: '#000000',
  },
  contentList: {
    padding: Spacing.base,
    paddingBottom: 40,
  },
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
  exercisesSectionTitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  exerciseCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  exerciseIndexBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseIndexText: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '800',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: '700',
  },
  exerciseTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  tagText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizes.xs,
  },
  tagDot: {
    color: Colors.textDisabled,
  },
  exerciseNotes: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
    gap: 6,
  },
  exerciseNotesText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    flex: 1,
  },
  setsTable: {
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  setLabel: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizes.xs,
    width: 60,
  },
  setValue: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
    flex: 1,
  },
  setWeight: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
    marginRight: Spacing.md,
  },
  setRest: {
    color: Colors.textMuted,
    fontSize: 10,
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
  },
  createBtnText: {
    color: '#000000',
    fontSize: Typography.fontSizes.base,
    fontWeight: '800',
  },
});

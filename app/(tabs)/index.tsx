import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XpHeader } from '../../src/components/XpHeader';
import { BorderRadius, Colors, Spacing, Typography } from '../../src/constants/theme';
import { StorageService } from '../../src/services/storage';
import type { UserStats, WorkoutPlan, WorkoutSessionLog } from '../../src/types';

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    level: 1,
    currentXp: 0,
    xpToNextLevel: 250,
    currentStreakDays: 0,
    longestStreakDays: 0,
    totalWorkoutsCompleted: 0,
    totalSetsCompleted: 0,
    totalVolumeKg: 0,
    unlockedAchievementIds: [],
  });
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [weeklyLogs, setWeeklyLogs] = useState<WorkoutSessionLog[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [userStats, workoutPlan, logs] = await Promise.all([
        StorageService.getUserStats(),
        StorageService.getWorkoutPlan(),
        StorageService.getSessionLogs(),
      ]);
      setStats(userStats);
      setPlan(workoutPlan);

      // Filter logs for this week (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const recentLogs = logs.filter((l) => new Date(l.completedAt) >= oneWeekAgo);
      setWeeklyLogs(recentLogs);
    } catch (e) {
      console.error('Error loading home data:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const activeDay = plan?.days?.[selectedDayIndex] || plan?.days?.[0];
  const targetDaysPerWeek = plan?.answers?.daysPerWeek || 4;
  const workoutsThisWeek = weeklyLogs.length;
  const weekProgressPercent = Math.min(
    100,
    Math.round((workoutsThisWeek / targetDaysPerWeek) * 100)
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* App Title & Greeting */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.appTitle}>
              GYM<Text style={styles.appTitleAccent}>UP</Text>
            </Text>
            <Text style={styles.appSubtitle}>Treino inteligente & gamificado</Text>
          </View>

          <TouchableOpacity
            style={styles.settingsIconBtn}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Ionicons name="settings-sharp" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Gamified Level & XP Header */}
        <XpHeader stats={stats} />

        {/* Weekly Adherence Mini-Bar */}
        <View style={styles.weeklySummaryCard}>
          <View style={styles.weeklySummaryHeader}>
            <View style={styles.weeklySummaryTitleRow}>
              <Ionicons name="calendar" size={16} color={Colors.primary} />
              <Text style={styles.weeklySummaryTitle}>Meta Semanal</Text>
            </View>
            <Text style={styles.weeklySummaryCount}>
              {workoutsThisWeek} de {targetDaysPerWeek} treinos
            </Text>
          </View>
          <View style={styles.weeklyProgressBarBg}>
            <View style={[styles.weeklyProgressBarFill, { width: `${weekProgressPercent}%` }]} />
          </View>
        </View>

        {/* Workout Plan Section */}
        {plan && activeDay ? (
          <View style={styles.todayCard}>
            <View style={styles.todayCardHeader}>
              <View style={styles.badgeToday}>
                <Ionicons name="flash" size={12} color={Colors.primary} />
                <Text style={styles.badgeTodayText}>PRÓXIMO TREINO</Text>
              </View>
              <Text style={styles.estimatedTimeText}>⏱ {activeDay.estimatedMinutes} min</Text>
            </View>

            <Text style={styles.dayNameText}>{activeDay.name}</Text>

            {/* Day Selector Pills if multiple days */}
            {plan.days.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dayPillsContainer}
              >
                {plan.days.map((d, idx) => (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.dayPill, selectedDayIndex === idx && styles.dayPillActive]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedDayIndex(idx);
                    }}
                  >
                    <Text
                      style={[
                        styles.dayPillText,
                        selectedDayIndex === idx && styles.dayPillTextActive,
                      ]}
                    >
                      {String.fromCharCode(65 + idx)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Muscle Groups Targets */}
            <View style={styles.muscleRow}>
              {activeDay.targetMuscleGroups.map((muscle) => (
                <View key={muscle} style={styles.muscleChip}>
                  <Text style={styles.muscleChipText}>{muscle}</Text>
                </View>
              ))}
            </View>

            {/* Exercises Preview List */}
            <View style={styles.previewList}>
              {activeDay.exercises.map((ex, i) => (
                <View key={ex.id} style={styles.previewItem}>
                  <Text style={styles.previewItemIndex}>{i + 1}.</Text>
                  <Text style={styles.previewItemName} numberOfLines={1}>
                    {ex.name}
                  </Text>
                  <Text style={styles.previewItemSets}>{ex.targetSets.length} séries</Text>
                </View>
              ))}
            </View>

            {/* Start Workout Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.startWorkoutButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push({
                  pathname: '/workout/[dayId]',
                  params: { dayId: activeDay.id },
                });
              }}
            >
              <Ionicons name="play" size={20} color="#000000" />
              <Text style={styles.startWorkoutButtonText}>COMEÇAR TREINO</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Empty State - No Plan Generated Yet */
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="sparkles" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Monte seu Treino com IA</Text>
            <Text style={styles.emptyDesc}>
              Responda a 4 perguntas rápidas e o Gemini vai estruturar a melhor ficha personalizada
              para sua rotina e objetivos.
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.createPlanBtn}
              onPress={() => router.push('/onboarding/quiz')}
            >
              <Ionicons name="flash" size={18} color="#000000" />
              <Text style={styles.createPlanBtnText}>Criar Ficha com Gemini</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Stats Grid */}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 30,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  appTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.xl,
    fontWeight: '900',
    letterSpacing: 1,
  },
  appTitleAccent: {
    color: Colors.primary,
  },
  appSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
  },
  settingsIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklySummaryCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
  },
  weeklySummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  weeklySummaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weeklySummaryTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
  },
  weeklySummaryCount: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
  },
  weeklyProgressBarBg: {
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginTop: 4,
  },
  weeklyProgressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  todayCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    marginBottom: Spacing.base,
  },
  todayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  badgeToday: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    gap: 4,
  },
  badgeTodayText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  estimatedTimeText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
  },
  dayNameText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.lg,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  dayPillsContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  dayPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayPillText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
  },
  dayPillTextActive: {
    color: '#000000',
  },
  muscleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.md,
  },
  muscleChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  muscleChipText: {
    color: Colors.secondary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
  },
  previewList: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.base,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  previewItemIndex: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizes.xs,
    width: 20,
    fontWeight: '700',
  },
  previewItemName: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.xs,
    flex: 1,
    fontWeight: '500',
  },
  previewItemSets: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  startWorkoutButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  startWorkoutButtonText: {
    color: '#000000',
    fontSize: Typography.fontSizes.base,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.lg,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  emptyDesc: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  createPlanBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  createPlanBtnText: {
    color: '#000000',
    fontSize: Typography.fontSizes.base,
    fontWeight: '800',
  },
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

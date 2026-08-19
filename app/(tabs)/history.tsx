import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing, Typography } from '../../src/constants/theme';
import { StorageService } from '../../src/services/storage';
import type { WorkoutPlan, WorkoutSessionLog } from '../../src/types';

export default function HistoryScreen() {
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly' | 'logs'>('weekly');
  const [logs, setLogs] = useState<WorkoutSessionLog[]>([]);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);

  const loadData = useCallback(async () => {
    const [savedLogs, savedPlan] = await Promise.all([
      StorageService.getSessionLogs(),
      StorageService.getWorkoutPlan(),
    ]);
    setLogs(savedLogs);
    setPlan(savedPlan);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // --- Calculations for Weekly Summary ---
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const weeklyLogs = logs.filter((l) => new Date(l.completedAt) >= sevenDaysAgo);
  const weeklyTargetDays = plan?.answers?.daysPerWeek || 4;
  const weeklyWorkoutsDone = weeklyLogs.length;
  const weeklyAdherence = Math.min(100, Math.round((weeklyWorkoutsDone / weeklyTargetDays) * 100));
  const weeklySetsDone = weeklyLogs.reduce((acc, l) => acc + l.totalSetsCompleted, 0);
  const weeklyVolume = weeklyLogs.reduce((acc, l) => acc + l.totalVolumeKg, 0);
  const weeklyXp = weeklyLogs.reduce((acc, l) => acc + l.xpEarned, 0);

  // Muscle groups stimulated in week
  const weeklyMusclesMap: Record<string, number> = {};
  weeklyLogs.forEach((l) => {
    l.exercises.forEach((ex) => {
      if (ex.sets.length > 0) {
        weeklyMusclesMap[ex.muscleGroup] = (weeklyMusclesMap[ex.muscleGroup] || 0) + ex.sets.length;
      }
    });
  });

  // --- Calculations for Monthly Summary ---
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const monthlyLogs = logs.filter((l) => new Date(l.completedAt) >= thirtyDaysAgo);
  const monthlyWorkoutsDone = monthlyLogs.length;
  const monthlySetsDone = monthlyLogs.reduce((acc, l) => acc + l.totalSetsCompleted, 0);
  const monthlyVolume = monthlyLogs.reduce((acc, l) => acc + l.totalVolumeKg, 0);
  const monthlyXp = monthlyLogs.reduce((acc, l) => acc + l.xpEarned, 0);
  const monthlyAvgDuration =
    monthlyWorkoutsDone > 0
      ? Math.round(monthlyLogs.reduce((acc, l) => acc + l.durationMinutes, 0) / monthlyWorkoutsDone)
      : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Screen Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Relatórios & Progresso</Text>
        <Text style={styles.headerSubtitle}>Acompanhe sua consistência e evolução</Text>
      </View>

      {/* Segmented Switcher */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabButton, viewMode === 'weekly' && styles.tabButtonActive]}
          onPress={() => {
            Haptics.selectionAsync();
            setViewMode('weekly');
          }}
        >
          <Text style={[styles.tabText, viewMode === 'weekly' && styles.tabTextActive]}>
            Semanal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, viewMode === 'monthly' && styles.tabButtonActive]}
          onPress={() => {
            Haptics.selectionAsync();
            setViewMode('monthly');
          }}
        >
          <Text style={[styles.tabText, viewMode === 'monthly' && styles.tabTextActive]}>
            Mensal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, viewMode === 'logs' && styles.tabButtonActive]}
          onPress={() => {
            Haptics.selectionAsync();
            setViewMode('logs');
          }}
        >
          <Text style={[styles.tabText, viewMode === 'logs' && styles.tabTextActive]}>
            Histórico ({logs.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* --- WEEKLY VIEW --- */}
        {viewMode === 'weekly' && (
          <View>
            {/* Adherence Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryCardHeader}>
                <Text style={styles.cardTitle}>Aderência da Semana</Text>
                <Text style={styles.adherencePercent}>{weeklyAdherence}%</Text>
              </View>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${weeklyAdherence}%` }]} />
              </View>

              <Text style={styles.adherenceSubtitle}>
                {weeklyWorkoutsDone} de {weeklyTargetDays} treinos completados nos últimos 7 dias.
              </Text>
            </View>

            {/* Metrics Grid */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Ionicons name="repeat" size={22} color={Colors.primary} />
                <Text style={styles.metricValue}>{weeklySetsDone}</Text>
                <Text style={styles.metricLabel}>Séries Feitas</Text>
              </View>

              <View style={styles.metricCard}>
                <Ionicons name="barbell" size={22} color={Colors.accentBlue} />
                <Text style={styles.metricValue}>{(weeklyVolume / 1000).toFixed(1)}k</Text>
                <Text style={styles.metricLabel}>Kg Levantados</Text>
              </View>

              <View style={styles.metricCard}>
                <Ionicons name="flash" size={22} color={Colors.accentGold} />
                <Text style={styles.metricValue}>+{weeklyXp}</Text>
                <Text style={styles.metricLabel}>XP Conquistado</Text>
              </View>
            </View>

            {/* Muscle Breakdown */}
            <View style={styles.summaryCard}>
              <Text style={styles.cardTitle}>Estímulo Muscular Semanal</Text>
              {Object.keys(weeklyMusclesMap).length > 0 ? (
                <View style={styles.musclesList}>
                  {Object.entries(weeklyMusclesMap).map(([muscle, setsCount]) => (
                    <View key={muscle} style={styles.muscleRowItem}>
                      <Text style={styles.muscleName}>{muscle}</Text>
                      <View style={styles.muscleBarArea}>
                        <View
                          style={[
                            styles.muscleBarFill,
                            {
                              width: `${Math.min(100, (setsCount / (weeklySetsDone || 1)) * 100 * 2)}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.muscleSetsCount}>{setsCount} séries</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptySubtext}>
                  Nenhum treino registrado nos últimos 7 dias. Conclua uma sessão para visualizar o
                  mapa muscular.
                </Text>
              )}
            </View>
          </View>
        )}

        {/* --- MONTHLY VIEW --- */}
        {viewMode === 'monthly' && (
          <View>
            <View style={styles.summaryCard}>
              <View style={styles.summaryCardHeader}>
                <Text style={styles.cardTitle}>Retrospectiva dos 30 Dias</Text>
                <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.adherenceSubtitle}>
                Consistência e volume acumulado no último mês.
              </Text>
            </View>

            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Ionicons name="fitness" size={22} color={Colors.primary} />
                <Text style={styles.metricValue}>{monthlyWorkoutsDone}</Text>
                <Text style={styles.metricLabel}>Treinos no Mês</Text>
              </View>

              <View style={styles.metricCard}>
                <Ionicons name="time" size={22} color={Colors.accentOrange} />
                <Text style={styles.metricValue}>{monthlyAvgDuration}m</Text>
                <Text style={styles.metricLabel}>Média por Treino</Text>
              </View>

              <View style={styles.metricCard}>
                <Ionicons name="layers" size={22} color={Colors.secondary} />
                <Text style={styles.metricValue}>{monthlySetsDone}</Text>
                <Text style={styles.metricLabel}>Total Séries</Text>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.cardTitle}>Toneladas Movimentadas</Text>
              <Text style={styles.tonnageValue}>
                {monthlyVolume >= 1000
                  ? `${(monthlyVolume / 1000).toFixed(1)} Toneladas`
                  : `${monthlyVolume} kg`}
              </Text>
              <Text style={styles.adherenceSubtitle}>
                Soma de todas as repetições multiplicadas pelo peso em cada série neste mês.
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.cardTitle}>XP Mensal Acumulado</Text>
              <Text style={styles.xpMonthValue}>+{monthlyXp} XP</Text>
              <Text style={styles.adherenceSubtitle}>
                Pontos de experiência gerados através da sua dedicação aos treinos.
              </Text>
            </View>
          </View>
        )}

        {/* --- LOGS / HISTORY LIST --- */}
        {viewMode === 'logs' && (
          <View>
            {logs.length === 0 ? (
              <View style={styles.emptyLogsCard}>
                <Ionicons name="document-text-outline" size={44} color={Colors.textMuted} />
                <Text style={styles.emptyLogsTitle}>Nenhum registro ainda</Text>
                <Text style={styles.emptyLogsDesc}>
                  Seus treinos finalizados aparecerão aqui com todos os detalhes de séries, cargas e
                  XP ganho.
                </Text>
              </View>
            ) : (
              logs.map((log) => {
                const dateFormatted = new Date(log.completedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <View key={log.id} style={styles.logCard}>
                    <View style={styles.logCardHeader}>
                      <View style={styles.logTitleArea}>
                        <Text style={styles.logDayName}>{log.dayName}</Text>
                        <Text style={styles.logDate}>{dateFormatted}</Text>
                      </View>
                      <View style={styles.logXpTag}>
                        <Text style={styles.logXpText}>+{log.xpEarned} XP</Text>
                      </View>
                    </View>

                    <View style={styles.logDetailsRow}>
                      <View style={styles.logDetailItem}>
                        <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                        <Text style={styles.logDetailText}>{log.durationMinutes} min</Text>
                      </View>
                      <View style={styles.logDetailItem}>
                        <Ionicons name="repeat-outline" size={14} color={Colors.textMuted} />
                        <Text style={styles.logDetailText}>{log.totalSetsCompleted} séries</Text>
                      </View>
                      <View style={styles.logDetailItem}>
                        <Ionicons name="barbell-outline" size={14} color={Colors.textMuted} />
                        <Text style={styles.logDetailText}>
                          {(log.totalVolumeKg / 1000).toFixed(1)}k kg
                        </Text>
                      </View>
                    </View>

                    {/* Exercises Summary List */}
                    <View style={styles.logExercisesPreview}>
                      {log.exercises.map((ex) => (
                        <Text key={ex.exerciseId} style={styles.logExerciseItem}>
                          • {ex.exerciseName} ({ex.sets.length} séries)
                        </Text>
                      ))}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
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
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    padding: 4,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#000000',
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: '800',
  },
  adherencePercent: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.lg,
    fontWeight: '900',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  adherenceSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    lineHeight: 18,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  metricValue: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.lg,
    fontWeight: '900',
    marginTop: Spacing.xs,
  },
  metricLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  musclesList: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  muscleRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  muscleName: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    width: 100,
  },
  muscleBarArea: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  muscleBarFill: {
    height: '100%',
    backgroundColor: Colors.secondary,
  },
  muscleSetsCount: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
    width: 55,
    textAlign: 'right',
  },
  tonnageValue: {
    color: Colors.accentBlue,
    fontSize: Typography.fontSizes.xxl,
    fontWeight: '900',
    marginVertical: Spacing.xs,
  },
  xpMonthValue: {
    color: Colors.accentGold,
    fontSize: Typography.fontSizes.xxl,
    fontWeight: '900',
    marginVertical: Spacing.xs,
  },
  emptySubtext: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizes.xs,
    marginTop: Spacing.sm,
  },
  emptyLogsCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.xl,
  },
  emptyLogsTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: '700',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyLogsDesc: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
  logCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  logCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  logTitleArea: {
    flex: 1,
  },
  logDayName: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: '700',
  },
  logDate: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizes.xs,
    marginTop: 2,
  },
  logXpTag: {
    backgroundColor: Colors.accentGoldMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  logXpText: {
    color: Colors.accentGold,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
  },
  logDetailsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginVertical: Spacing.sm,
  },
  logDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logDetailText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
  },
  logExercisesPreview: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
  },
  logExerciseItem: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
});

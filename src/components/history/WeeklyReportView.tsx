import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';

interface WeeklyReportViewProps {
  adherence: number;
  workoutsDone: number;
  targetDays: number;
  setsDone: number;
  volume: number;
  xp: number;
  musclesMap: Record<string, number>;
}

export function WeeklyReportView({
  adherence,
  workoutsDone,
  targetDays,
  setsDone,
  volume,
  xp,
  musclesMap,
}: WeeklyReportViewProps) {
  return (
    <View>
      {/* Adherence Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryCardHeader}>
          <Text style={styles.cardTitle}>Aderência da Semana</Text>
          <Text style={styles.adherencePercent}>{adherence}%</Text>
        </View>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${adherence}%` }]} />
        </View>

        <Text style={styles.adherenceSubtitle}>
          {workoutsDone} de {targetDays} treinos completados nos últimos 7 dias.
        </Text>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Ionicons name="repeat" size={22} color={Colors.primary} />
          <Text style={styles.metricValue}>{setsDone}</Text>
          <Text style={styles.metricLabel}>Séries Feitas</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="barbell" size={22} color={Colors.accentBlue} />
          <Text style={styles.metricValue}>{(volume / 1000).toFixed(1)}k</Text>
          <Text style={styles.metricLabel}>Kg Levantados</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="flash" size={22} color={Colors.accentGold} />
          <Text style={styles.metricValue}>+{xp}</Text>
          <Text style={styles.metricLabel}>XP Conquistado</Text>
        </View>
      </View>

      {/* Muscle Breakdown */}
      <View style={styles.summaryCard}>
        <Text style={styles.cardTitle}>Estímulo Muscular Semanal</Text>
        {Object.keys(musclesMap).length > 0 ? (
          <View style={styles.musclesList}>
            {Object.entries(musclesMap).map(([muscle, setsCount]) => (
              <View key={muscle} style={styles.muscleRowItem}>
                <Text style={styles.muscleName}>{muscle}</Text>
                <View style={styles.muscleBarArea}>
                  <View
                    style={[
                      styles.muscleBarFill,
                      {
                        width: `${Math.min(100, (setsCount / (setsDone || 1)) * 100 * 2)}%`,
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
            Nenhum treino registrado nos últimos 7 dias. Conclua uma sessão para visualizar o mapa
            muscular.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  emptySubtext: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizes.xs,
    marginTop: Spacing.sm,
  },
});

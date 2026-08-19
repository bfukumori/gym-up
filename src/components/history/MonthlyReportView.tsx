import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';

interface MonthlyReportViewProps {
  workoutsDone: number;
  avgDuration: number;
  setsDone: number;
  volume: number;
  xp: number;
}

export function MonthlyReportView({
  workoutsDone,
  avgDuration,
  setsDone,
  volume,
  xp,
}: MonthlyReportViewProps) {
  const formattedVolume = Math.round(volume).toLocaleString('pt-BR');

  return (
    <View>
      <View style={styles.summaryCard}>
        <View style={styles.summaryCardHeader}>
          <Text style={styles.cardTitle}>Retrospectiva dos 30 Dias</Text>
          <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
        </View>
        <Text style={styles.adherenceSubtitle}>Consistência e volume acumulado no último mês.</Text>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Ionicons name="fitness" size={22} color={Colors.primary} />
          <Text style={styles.metricValue}>{workoutsDone}</Text>
          <Text style={styles.metricLabel}>Treinos no Mês</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="time" size={22} color={Colors.accentOrange} />
          <Text style={styles.metricValue}>{avgDuration}m</Text>
          <Text style={styles.metricLabel}>Média por Treino</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="layers" size={22} color={Colors.secondary} />
          <Text style={styles.metricValue}>{setsDone}</Text>
          <Text style={styles.metricLabel}>Total Séries</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.cardTitle}>Volume Total Movimentado</Text>
        <Text style={styles.volumeValue}>{formattedVolume} kg</Text>
        <Text style={styles.adherenceSubtitle}>
          Soma do volume acumulado de todas as séries no mês (Séries × Reps × Peso).
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.cardTitle}>XP Mensal Acumulado</Text>
        <Text style={styles.xpMonthValue}>+{xp} XP</Text>
        <Text style={styles.adherenceSubtitle}>
          Pontos de experiência gerados através da sua dedicação aos treinos.
        </Text>
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
  volumeValue: {
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
});

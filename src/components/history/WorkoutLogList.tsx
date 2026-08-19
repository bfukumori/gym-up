import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import type { WorkoutSessionLog } from '../../types';

interface WorkoutLogListProps {
  logs: WorkoutSessionLog[];
}

export function WorkoutLogList({ logs }: WorkoutLogListProps) {
  if (logs.length === 0) {
    return (
      <View style={styles.emptyLogsCard}>
        <Ionicons name="document-text-outline" size={44} color={Colors.textMuted} />
        <Text style={styles.emptyLogsTitle}>Nenhum registro ainda</Text>
        <Text style={styles.emptyLogsDesc}>
          Seus treinos finalizados aparecerão aqui com todos os detalhes de séries, cargas e XP
          ganho.
        </Text>
      </View>
    );
  }

  return (
    <View>
      {logs.map((log) => {
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
                  {Math.round(log.totalVolumeKg).toLocaleString('pt-BR')} kg
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
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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

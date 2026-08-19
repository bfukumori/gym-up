import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';

interface AvailabilityStepProps {
  daysPerWeek: number;
  onSelectDaysPerWeek: (days: number) => void;
  minutesPerSession: number;
  onSelectMinutesPerSession: (mins: number) => void;
}

export function AvailabilityStep({
  daysPerWeek,
  onSelectDaysPerWeek,
  minutesPerSession,
  onSelectMinutesPerSession,
}: AvailabilityStepProps) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>Sua disponibilidade</Text>
      <Text style={styles.sectionSubtitle}>
        Quantos dias na semana e quanto tempo você tem para treinar?
      </Text>

      <Text style={styles.fieldLabel}>DIAS POR SEMANA: {daysPerWeek} dias</Text>
      <View style={styles.daysSelectorRow}>
        {[2, 3, 4, 5, 6].map((num) => (
          <TouchableOpacity
            key={`day-option-${num}`}
            style={[styles.dayPill, daysPerWeek === num && styles.dayPillActive]}
            onPress={() => {
              Haptics.selectionAsync();
              onSelectDaysPerWeek(num);
            }}
          >
            <Text style={[styles.dayPillText, daysPerWeek === num && styles.dayPillTextActive]}>
              {num}x
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.fieldLabel, { marginTop: Spacing.xl }]}>
        TEMPO POR TREINO: {minutesPerSession} minutos
      </Text>
      <View style={styles.timeSelectorRow}>
        {[30, 45, 60, 75, 90].map((mins) => (
          <TouchableOpacity
            key={`mins-option-${mins}`}
            style={[styles.timePill, minutesPerSession === mins && styles.timePillActive]}
            onPress={() => {
              Haptics.selectionAsync();
              onSelectMinutesPerSession(mins);
            }}
          >
            <Text
              style={[styles.timePillText, minutesPerSession === mins && styles.timePillTextActive]}
            >
              {mins} min
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.xl,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.sm,
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  fieldLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  daysSelectorRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dayPill: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayPillActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  dayPillText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.md,
    fontWeight: '700',
  },
  dayPillTextActive: {
    color: Colors.primary,
  },
  timeSelectorRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  timePill: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timePillActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  timePillText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
  },
  timePillTextActive: {
    color: Colors.primary,
  },
});

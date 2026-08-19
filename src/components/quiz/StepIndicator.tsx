import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';

interface StepIndicatorProps {
  step: number;
  totalSteps?: number;
}

export function StepIndicator({ step, totalSteps = 4 }: StepIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View style={styles.headerIndicator}>
      <View style={styles.stepsRow}>
        {steps.map((s) => (
          <View
            key={`step-dot-${s}`}
            style={[
              styles.stepDot,
              step === s && styles.stepDotActive,
              step > s && styles.stepDotDone,
            ]}
          />
        ))}
      </View>
      <Text style={styles.stepTitleText}>
        Etapa {step} de {totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerIndicator: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
  },
  stepsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  stepDot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.surface,
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
    width: 32,
  },
  stepDotDone: {
    backgroundColor: Colors.primaryMuted,
  },
  stepTitleText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
  },
});

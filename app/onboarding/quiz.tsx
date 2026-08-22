import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AvailabilityStep } from '../../src/components/quiz/AvailabilityStep';
import { ExperienceStep } from '../../src/components/quiz/ExperienceStep';
import { FocusStep } from '../../src/components/quiz/FocusStep';
import { GoalStep } from '../../src/components/quiz/GoalStep';
import { StepIndicator } from '../../src/components/quiz/StepIndicator';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import { useQuizForm } from '../../src/hooks/useQuizForm';

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const {
    step,
    loading,
    goal,
    setGoal,
    daysPerWeek,
    setDaysPerWeek,
    minutesPerSession,
    setMinutesPerSession,
    experience,
    setExperience,
    equipment,
    setEquipment,
    focusMuscles,
    toggleMuscle,
    limitations,
    setLimitations,
    notes,
    setNotes,
    handleNext,
    handleBack,
  } = useQuizForm();

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        {/* Step Indicator Header */}
        <StepIndicator step={step} totalSteps={4} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {step === 1 && <GoalStep selectedGoal={goal} onSelectGoal={setGoal} />}

          {step === 2 && (
            <AvailabilityStep
              daysPerWeek={daysPerWeek}
              onSelectDaysPerWeek={setDaysPerWeek}
              minutesPerSession={minutesPerSession}
              onSelectMinutesPerSession={setMinutesPerSession}
            />
          )}

          {step === 3 && (
            <ExperienceStep
              experience={experience}
              onSelectExperience={setExperience}
              equipment={equipment}
              onSelectEquipment={setEquipment}
            />
          )}

          {step === 4 && (
            <FocusStep
              focusMuscles={focusMuscles}
              onToggleMuscle={toggleMuscle}
              limitations={limitations}
              onChangeLimitations={setLimitations}
              notes={notes}
              onChangeNotes={setNotes}
            />
          )}
        </ScrollView>

        {/* Footer Navigation */}
        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : Spacing.base },
          ]}
        >
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} disabled={loading}>
            <Text style={styles.backBtnText}>{step === 1 ? 'Cancelar' : 'Voltar'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <>
                <Text style={styles.primaryBtnText}>{step === 4 ? 'Gerar com IA' : 'Próximo'}</Text>
                <Ionicons
                  name={step === 4 ? 'sparkles' : 'arrow-forward'}
                  size={18}
                  color="#000000"
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  footer: {
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backBtn: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  backBtnText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.base,
    fontWeight: '600',
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#000000',
    fontSize: Typography.fontSizes.base,
    fontWeight: '800',
  },
});

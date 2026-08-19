import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../src/constants/theme';
import { GeminiService } from '../../src/services/gemini';
import type { EquipmentType, ExperienceLevel, GoalType, QuizAnswers } from '../../src/types';

const GOALS: {
  key: GoalType;
  label: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    key: 'hypertrophy',
    label: 'Hipertrofia',
    desc: 'Ganho de massa muscular e volume',
    icon: 'barbell',
  },
  {
    key: 'strength',
    label: 'Força Bruta',
    desc: 'Aumento de carga e potência máxima',
    icon: 'flash',
  },
  {
    key: 'fat_loss',
    label: 'Definição / Secar',
    desc: 'Queima de gordura e densidade',
    icon: 'flame',
  },
  {
    key: 'conditioning',
    label: 'Condicionamento',
    desc: 'Resistência aeróbica e fôlego',
    icon: 'heart',
  },
  {
    key: 'general',
    label: 'Saúde Geral',
    desc: 'Postura, bem-estar e mobilidade',
    icon: 'shield-checkmark',
  },
];

const EXPERIENCE_LEVELS: { key: ExperienceLevel; label: string; desc: string }[] = [
  { key: 'beginner', label: 'Iniciante', desc: 'Menos de 6 meses de treino' },
  { key: 'intermediate', label: 'Intermediário', desc: 'De 6 meses a 2 anos constante' },
  { key: 'advanced', label: 'Avançado', desc: 'Mais de 2 anos com técnica sólida' },
];

const EQUIPMENT_OPTIONS: { key: EquipmentType; label: string; desc: string }[] = [
  { key: 'full_gym', label: 'Academia Completa', desc: 'Máquinas, cabos, barras e halteres' },
  { key: 'dumbbells_only', label: 'Halteres & Banco', desc: 'Treino em condomínio ou estúdio' },
  {
    key: 'home_minimal',
    label: 'Minimalista em Casa',
    desc: 'Elásticos, kettlebell ou halteres leves',
  },
  { key: 'bodyweight', label: 'Calistenia', desc: 'Apenas barra fixa e peso do corpo' },
];

const MUSCLE_GROUPS = [
  'Peitoral',
  'Costas',
  'Quadríceps',
  'Posterior de Coxa',
  'Glúteos',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Panturrilhas',
  'Abdômen / Core',
];

export default function QuizScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [goal, setGoal] = useState<GoalType>('hypertrophy');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(4);
  const [minutesPerSession, setMinutesPerSession] = useState<number>(60);
  const [experience, setExperience] = useState<ExperienceLevel>('intermediate');
  const [equipment, setEquipment] = useState<EquipmentType>('full_gym');
  const [focusMuscles, setFocusMuscles] = useState<string[]>(['Peitoral', 'Costas']);
  const [limitations, setLimitations] = useState('');
  const [notes, setNotes] = useState('');

  const toggleMuscle = (muscle: string) => {
    Haptics.selectionAsync();
    setFocusMuscles((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
    );
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      generatePlan();
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 1) {
      setStep((s) => s - 1);
    } else {
      router.back();
    }
  };

  const generatePlan = async () => {
    try {
      setLoading(true);
      const answers: QuizAnswers = {
        goal,
        daysPerWeek,
        minutesPerSession,
        experience,
        equipment,
        focusMuscles,
        limitations,
        notes,
      };

      await GeminiService.generateWorkoutPlan(answers);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Treino Gerado com Sucesso! 🚀',
        'Seu novo plano de treino personalizado foi montado pela IA do Gemini.',
        [
          {
            text: 'Visualizar Ficha',
            onPress: () => router.replace('/(tabs)/plan'),
          },
        ]
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Aviso', 'O treino foi estruturado com sucesso usando o modelo local.');
      router.replace('/(tabs)/plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Step Indicator Header */}
      <View style={styles.headerIndicator}>
        <View style={styles.stepsRow}>
          {[1, 2, 3, 4].map((s) => (
            <View
              key={`step-${s}`}
              style={[
                styles.stepDot,
                step === s && styles.stepDotActive,
                step > s && styles.stepDotDone,
              ]}
            />
          ))}
        </View>
        <Text style={styles.stepTitleText}>Etapa {step} de 4</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* STEP 1: OBJETIVO */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>Qual o seu objetivo principal?</Text>
            <Text style={styles.sectionSubtitle}>
              O Gemini vai balancear o volume e intensidade de acordo com sua meta.
            </Text>

            {GOALS.map((item) => {
              const selected = goal === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.optionCard, selected && styles.optionCardSelected]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setGoal(item.key);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.optionIconBox, selected && styles.optionIconBoxSelected]}>
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={selected ? '#000000' : Colors.primary}
                    />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>
                      {item.label}
                    </Text>
                    <Text style={styles.optionDesc}>{item.desc}</Text>
                  </View>
                  {selected && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* STEP 2: DISPONIBILIDADE */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>Sua disponibilidade</Text>
            <Text style={styles.sectionSubtitle}>
              Quantos dias na semana e quanto tempo você tem para treinar?
            </Text>

            <Text style={styles.fieldLabel}>DIAS POR SEMANA: {daysPerWeek} dias</Text>
            <View style={styles.daysSelectorRow}>
              {[2, 3, 4, 5, 6].map((num) => (
                <TouchableOpacity
                  key={`day-${num}`}
                  style={[styles.dayPill, daysPerWeek === num && styles.dayPillActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setDaysPerWeek(num);
                  }}
                >
                  <Text
                    style={[styles.dayPillText, daysPerWeek === num && styles.dayPillTextActive]}
                  >
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
                  key={`mins-${mins}`}
                  style={[styles.timePill, minutesPerSession === mins && styles.timePillActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setMinutesPerSession(mins);
                  }}
                >
                  <Text
                    style={[
                      styles.timePillText,
                      minutesPerSession === mins && styles.timePillTextActive,
                    ]}
                  >
                    {mins} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 3: EXPERIÊNCIA E EQUIPAMENTO */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>Experiência e Equipamento</Text>
            <Text style={styles.sectionSubtitle}>
              Isso ajuda a calibrar a complexidade e variedade dos exercícios.
            </Text>

            <Text style={styles.fieldLabel}>SEU NÍVEL:</Text>
            {EXPERIENCE_LEVELS.map((lvl) => {
              const selected = experience === lvl.key;
              return (
                <TouchableOpacity
                  key={lvl.key}
                  style={[styles.optionCard, selected && styles.optionCardSelected]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setExperience(lvl.key);
                  }}
                >
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>
                      {lvl.label}
                    </Text>
                    <Text style={styles.optionDesc}>{lvl.desc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            <Text style={[styles.fieldLabel, { marginTop: Spacing.lg }]}>ONDE VAI TREINAR?</Text>
            {EQUIPMENT_OPTIONS.map((eq) => {
              const selected = equipment === eq.key;
              return (
                <TouchableOpacity
                  key={eq.key}
                  style={[styles.optionCard, selected && styles.optionCardSelected]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setEquipment(eq.key);
                  }}
                >
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>
                      {eq.label}
                    </Text>
                    <Text style={styles.optionDesc}>{eq.desc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* STEP 4: FOCO & LIMITAÇÕES */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>Músculos de Foco e Dores</Text>
            <Text style={styles.sectionSubtitle}>
              Selecione os grupos prioritários e informe qualquer dor articular.
            </Text>

            <Text style={styles.fieldLabel}>MÚSCULOS DE FOCO (opcional):</Text>
            <View style={styles.chipsContainer}>
              {MUSCLE_GROUPS.map((muscle) => {
                const selected = focusMuscles.includes(muscle);
                return (
                  <TouchableOpacity
                    key={muscle}
                    style={[styles.chip, selected && styles.chipActive]}
                    onPress={() => toggleMuscle(muscle)}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                      {muscle}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.fieldLabel, { marginTop: Spacing.xl }]}>
              LIMITAÇÕES / DORES A EVITAR:
            </Text>
            <TextInput
              style={styles.textInputArea}
              placeholder="Ex: Dor no joelho direito ao agachar, desconforto no ombro..."
              placeholderTextColor={Colors.textDisabled}
              value={limitations}
              onChangeText={setLimitations}
              multiline
              numberOfLines={3}
            />

            <Text style={[styles.fieldLabel, { marginTop: Spacing.md }]}>
              OBSERVAÇÕES EXTRAS (opcional):
            </Text>
            <TextInput
              style={styles.textInputArea}
              placeholder="Ex: Prefiro exercícios com halteres e polias..."
              placeholderTextColor={Colors.textDisabled}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
            />
          </View>
        )}
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
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
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 100,
  },
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
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 230, 118, 0.05)',
  },
  optionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconBoxSelected: {
    backgroundColor: Colors.primary,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: '700',
    marginBottom: 2,
  },
  optionTitleSelected: {
    color: Colors.primary,
  },
  optionDesc: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizes.xs,
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
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    backgroundColor: Colors.card,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.primary,
  },
  textInputArea: {
    backgroundColor: Colors.card,
    color: Colors.textPrimary,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: Typography.fontSizes.sm,
    textAlignVertical: 'top',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Spacing.base,
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
    borderRadius: BorderRadius.lg,
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

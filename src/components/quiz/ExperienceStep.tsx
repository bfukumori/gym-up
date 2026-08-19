import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import type { EquipmentType, ExperienceLevel } from '../../types';

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

interface ExperienceStepProps {
  experience: ExperienceLevel;
  onSelectExperience: (lvl: ExperienceLevel) => void;
  equipment: EquipmentType;
  onSelectEquipment: (eq: EquipmentType) => void;
}

export function ExperienceStep({
  experience,
  onSelectExperience,
  equipment,
  onSelectEquipment,
}: ExperienceStepProps) {
  return (
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
              onSelectExperience(lvl.key);
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
              onSelectEquipment(eq.key);
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
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 230, 118, 0.05)',
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
});

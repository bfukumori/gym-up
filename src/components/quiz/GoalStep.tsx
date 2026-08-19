import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import type { GoalType } from '../../types';

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

interface GoalStepProps {
  selectedGoal: GoalType;
  onSelectGoal: (goal: GoalType) => void;
}

export function GoalStep({ selectedGoal, onSelectGoal }: GoalStepProps) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>Qual o seu objetivo principal?</Text>
      <Text style={styles.sectionSubtitle}>
        O Gemini vai balancear o volume e intensidade de acordo com sua meta.
      </Text>

      {GOALS.map((item) => {
        const selected = selectedGoal === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.optionCard, selected && styles.optionCardSelected]}
            onPress={() => {
              Haptics.selectionAsync();
              onSelectGoal(item.key);
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIconBox, selected && styles.optionIconBoxSelected]}>
              <Ionicons name={item.icon} size={22} color={selected ? '#000000' : Colors.primary} />
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>
                {item.label}
              </Text>
              <Text style={styles.optionDesc}>{item.desc}</Text>
            </View>
            {selected && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
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
});

import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';

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

interface FocusStepProps {
  focusMuscles: string[];
  onToggleMuscle: (muscle: string) => void;
  limitations: string;
  onChangeLimitations: (val: string) => void;
  notes: string;
  onChangeNotes: (val: string) => void;
}

export function FocusStep({
  focusMuscles,
  onToggleMuscle,
  limitations,
  onChangeLimitations,
  notes,
  onChangeNotes,
}: FocusStepProps) {
  return (
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
              onPress={() => onToggleMuscle(muscle)}
            >
              <Text style={[styles.chipText, selected && styles.chipTextActive]}>{muscle}</Text>
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
        onChangeText={onChangeLimitations}
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
        onChangeText={onChangeNotes}
        multiline
        numberOfLines={2}
      />
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
});

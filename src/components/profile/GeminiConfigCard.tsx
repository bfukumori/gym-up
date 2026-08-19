import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';

interface GeminiConfigCardProps {
  customKey: string;
  onChangeKey: (key: string) => void;
  isSavedKey: boolean;
  onSaveKey: () => void;
}

export function GeminiConfigCard({
  customKey,
  onChangeKey,
  isSavedKey,
  onSaveKey,
}: GeminiConfigCardProps) {
  const hasKey = customKey.trim().length > 0;

  return (
    <View style={styles.configCard}>
      <View style={styles.configHeader}>
        <Ionicons name="sparkles" size={20} color={Colors.primary} />
        <Text style={styles.configTitle}>Inteligência Artificial (Gemini)</Text>
      </View>

      <Text style={styles.configDesc}>
        Conecte sua chave gratuita do Google AI Studio para gerar fichas ilimitadas e 100%
        personalizadas com IA.
      </Text>

      <Text style={styles.configSubDesc}>
        {hasKey
          ? 'Sua chave personalizada está configurada e ativa para criar seus treinos.'
          : 'Se preferir não usar uma chave, o Gym-Up montará sua rotina automaticamente com nosso treino padrão inteligente.'}
      </Text>

      <TextInput
        style={styles.keyInput}
        placeholder="Cole sua chave API aqui (opcional)"
        placeholderTextColor={Colors.textDisabled}
        value={customKey}
        onChangeText={onChangeKey}
        secureTextEntry
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.saveKeyBtn, !hasKey && styles.saveKeyBtnMuted]}
        onPress={onSaveKey}
      >
        <Text style={[styles.saveKeyBtnText, !hasKey && styles.saveKeyBtnTextMuted]}>
          {isSavedKey
            ? 'Chave Salva com Sucesso ✓'
            : hasKey
              ? 'Salvar Chave API'
              : 'Salvar Alterações'}
        </Text>
      </TouchableOpacity>

      <View style={styles.freeKeyHint}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.accentBlue} />
        <Text style={styles.freeKeyHintText}>
          Você pode gerar uma chave gratuita a qualquer momento em{' '}
          <Text style={styles.linkText}>aistudio.google.com</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  configCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  configHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  configTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: '700',
  },
  configDesc: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    lineHeight: 18,
    marginBottom: 4,
  },
  configSubDesc: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  keyInput: {
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: Typography.fontSizes.sm,
    marginBottom: Spacing.sm,
  },
  saveKeyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
  },
  saveKeyBtnMuted: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveKeyBtnText: {
    color: '#000000',
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
  },
  saveKeyBtnTextMuted: {
    color: Colors.textSecondary,
  },
  freeKeyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  freeKeyHintText: {
    color: Colors.textMuted,
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
  linkText: {
    color: Colors.accentBlue,
    fontWeight: '600',
  },
});

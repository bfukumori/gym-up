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
  return (
    <View style={styles.configCard}>
      <View style={styles.configHeader}>
        <Ionicons name="key-outline" size={20} color={Colors.primary} />
        <Text style={styles.configTitle}>Configuração do Gemini IA</Text>
      </View>

      <Text style={styles.configDesc}>
        A chave do Google AI Studio pode vir do arquivo <Text style={styles.codeText}>.env</Text>{' '}
        (chave padrão) ou ser sobrescrita abaixo:
      </Text>

      <TextInput
        style={styles.keyInput}
        placeholder="AIzaSy... (Chave API do Gemini)"
        placeholderTextColor={Colors.textDisabled}
        value={customKey}
        onChangeText={onChangeKey}
        secureTextEntry
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.saveKeyBtn} onPress={onSaveKey}>
        <Text style={styles.saveKeyBtnText}>
          {isSavedKey ? 'Chave Atualizada ✓' : 'Salvar Chave no App'}
        </Text>
      </TouchableOpacity>

      <View style={styles.freeKeyHint}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.accentBlue} />
        <Text style={styles.freeKeyHintText}>
          O Gemini 2.5 Flash é 100% gratuito no Google AI Studio (aistudio.google.com).
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
    marginBottom: Spacing.sm,
  },
  codeText: {
    color: Colors.primary,
    fontWeight: '700',
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
  saveKeyBtnText: {
    color: '#000000',
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
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
  },
});

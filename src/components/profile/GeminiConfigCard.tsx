import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';

interface GeminiConfigCardProps {
  customKey: string;
  onChangeKey: (key: string) => void;
  isSavedKey: boolean;
  onSaveKey: () => void;
  onRemoveKey?: () => void;
}

export function GeminiConfigCard({
  customKey,
  onChangeKey,
  isSavedKey,
  onSaveKey,
  onRemoveKey,
}: GeminiConfigCardProps) {
  const [showKey, setShowKey] = useState(false);
  const trimmedKey = customKey.trim();
  const hasKey = trimmedKey.length > 0;
  const isLikelyValidKey = trimmedKey.startsWith('AIza') || trimmedKey.length >= 35;

  const handleOpenAiStudio = () => {
    Linking.openURL('https://aistudio.google.com/app/apikey').catch((err) => {
      console.warn('Não foi possível abrir o link do Google AI Studio:', err);
    });
  };

  const handleClear = () => {
    onChangeKey('');
  };

  return (
    <View style={styles.configCard}>
      {/* Header */}
      <View style={styles.configHeader}>
        <View style={styles.titleRow}>
          <Ionicons name="sparkles" size={20} color={Colors.primary} />
          <Text style={styles.configTitle}>Inteligência Artificial (Gemini)</Text>
        </View>
        {isSavedKey && hasKey && (
          <View style={styles.savedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
            <Text style={styles.savedBadgeText}>Ativa</Text>
          </View>
        )}
      </View>

      <Text style={styles.configDesc}>
        Conecte sua chave gratuita do Google AI Studio para gerar fichas ilimitadas e 100%
        personalizadas com IA.
      </Text>

      {/* Step 1: Quick Access Button */}
      <View style={styles.stepBox}>
        <Text style={styles.stepNumber}>PASSO 1</Text>
        <TouchableOpacity
          style={styles.aiStudioBtn}
          onPress={handleOpenAiStudio}
          activeOpacity={0.8}
        >
          <Ionicons name="logo-google" size={18} color="#FFFFFF" />
          <Text style={styles.aiStudioBtnText}>Obter Chave Grátis no AI Studio</Text>
          <Ionicons name="open-outline" size={16} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.stepHint}>
          Faça login com sua conta Google e clique em "Create API key" (não exige cartão).
        </Text>
      </View>

      {/* Step 2: Paste & Input Field */}
      <View style={styles.stepBox}>
        <Text style={styles.stepNumber}>PASSO 2: COLE SUA CHAVE ABAIXO</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.keyInput, isSavedKey && hasKey && styles.keyInputSaved]}
            placeholder="Cole sua chave API aqui (ex: AIzaSy...)"
            placeholderTextColor={Colors.textDisabled}
            value={customKey}
            onChangeText={(val) => onChangeKey(val.trim().replace(/^["']|["']$/g, ''))}
            secureTextEntry={!showKey}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.inputActions}>
            {hasKey && (
              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={handleClear}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Limpar chave"
              >
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}

            {hasKey && (
              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={() => setShowKey((prev) => !prev)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel={showKey ? 'Ocultar chave' : 'Mostrar chave'}
              >
                <Ionicons
                  name={showKey ? 'eye-off-outline' : 'eye-outline'}
                  size={19}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {hasKey && !isLikelyValidKey && (
          <Text style={styles.validationWarning}>
            <Ionicons name="warning-outline" size={12} color={Colors.warning} /> A chave parece
            curta ou incompleta. Verifique se copiou todo o código.
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.saveKeyBtn, !hasKey && styles.saveKeyBtnMuted]}
          onPress={onSaveKey}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isSavedKey ? 'checkmark-circle' : 'save-outline'}
            size={16}
            color={!hasKey ? Colors.textSecondary : '#000000'}
          />
          <Text style={[styles.saveKeyBtnText, !hasKey && styles.saveKeyBtnTextMuted]}>
            {isSavedKey
              ? 'Chave Salva com Sucesso ✓'
              : hasKey
                ? 'Salvar Chave API'
                : 'Salvar Alterações'}
          </Text>
        </TouchableOpacity>

        {isSavedKey && hasKey && onRemoveKey && (
          <TouchableOpacity style={styles.removeKeyBtn} onPress={onRemoveKey} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={16} color={Colors.danger} />
            <Text style={styles.removeKeyBtnText}>Remover</Text>
          </TouchableOpacity>
        )}
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
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  configTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: '700',
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  savedBadgeText: {
    color: Colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  configDesc: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  stepBox: {
    marginBottom: Spacing.md,
  },
  stepNumber: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  aiStudioBtn: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  aiStudioBtnText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSizes.xs + 1,
    fontWeight: '700',
  },
  stepHint: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  keyInput: {
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 2,
    paddingLeft: Spacing.sm + 2,
    paddingRight: 70,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: Typography.fontSizes.sm,
  },
  keyInputSaved: {
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  inputActions: {
    position: 'absolute',
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionIconBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  validationWarning: {
    color: Colors.warning,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  saveKeyBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
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
  removeKeyBtn: {
    backgroundColor: Colors.dangerMuted,
    borderWidth: 1,
    borderColor: 'rgba(239, 83, 80, 0.3)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  removeKeyBtnText: {
    color: Colors.danger,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
  },
});

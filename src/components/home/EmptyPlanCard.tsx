import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';

interface EmptyPlanCardProps {
  hasGeminiKey?: boolean;
  onOpenDefaultPlans?: () => void;
  onOpenQuiz?: () => void;
}

export function EmptyPlanCard({
  hasGeminiKey = false,
  onOpenDefaultPlans,
  onOpenQuiz,
}: EmptyPlanCardProps) {
  const router = useRouter();

  const handleOpenQuiz = () => {
    if (onOpenQuiz) {
      onOpenQuiz();
    } else {
      router.push('/onboarding/quiz');
    }
  };

  const handleOpenDefaultPlans = () => {
    if (onOpenDefaultPlans) {
      onOpenDefaultPlans();
    }
  };

  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIconBox}>
        <Ionicons
          name={hasGeminiKey ? 'sparkles' : 'barbell-outline'}
          size={32}
          color={Colors.primary}
        />
      </View>
      <Text style={styles.emptyTitle}>
        {hasGeminiKey ? 'Monte seu Treino com IA' : 'Escolha sua Ficha de Treino'}
      </Text>
      <Text style={styles.emptyDesc}>
        {hasGeminiKey
          ? 'Responda a 4 perguntas rápidas e o Gemini vai estruturar uma ficha 100% personalizada para você.'
          : 'Selecione uma ficha pronta e balanceada (Iniciante, Intermediário ou Avançado) em 1 clique.'}
      </Text>

      {hasGeminiKey ? (
        <>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.createPlanBtn}
            onPress={handleOpenQuiz}
          >
            <Ionicons name="sparkles" size={18} color="#000000" />
            <Text style={styles.createPlanBtnText}>Criar Ficha com Gemini</Text>
          </TouchableOpacity>

          {onOpenDefaultPlans && (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.secondaryBtn}
              onPress={handleOpenDefaultPlans}
            >
              <Ionicons name="layers-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.secondaryBtnText}>Ou Escolher Treino Padrão</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.createPlanBtn}
            onPress={handleOpenDefaultPlans}
          >
            <Ionicons name="flash" size={18} color="#000000" />
            <Text style={styles.createPlanBtnText}>Escolher Treino Padrão</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.secondaryBtn}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Ionicons name="sparkles" size={14} color={Colors.accentBlue} />
            <Text style={styles.secondaryLinkText}>
              Adicionar chave Gemini para IA personalizada
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.lg,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  emptyDesc: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  createPlanBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    width: '100%',
  },
  createPlanBtnText: {
    color: '#000000',
    fontSize: Typography.fontSizes.base,
    fontWeight: '800',
  },
  secondaryBtn: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.xs,
  },
  secondaryBtnText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
  },
  secondaryLinkText: {
    color: Colors.accentBlue,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
  },
});

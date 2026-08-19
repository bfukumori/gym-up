import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';

export function EmptyPlanCard() {
  const router = useRouter();

  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIconBox}>
        <Ionicons name="sparkles" size={32} color={Colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>Monte seu Treino com IA</Text>
      <Text style={styles.emptyDesc}>
        Responda a 4 perguntas rápidas e o Gemini vai estruturar a melhor ficha personalizada para
        sua rotina e objetivos.
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.createPlanBtn}
        onPress={() => router.push('/onboarding/quiz')}
      >
        <Ionicons name="flash" size={18} color="#000000" />
        <Text style={styles.createPlanBtnText}>Criar Ficha com Gemini</Text>
      </TouchableOpacity>
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
    gap: Spacing.xs,
  },
  createPlanBtnText: {
    color: '#000000',
    fontSize: Typography.fontSizes.base,
    fontWeight: '800',
  },
});

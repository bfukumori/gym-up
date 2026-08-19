import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing, Typography } from '../../src/constants/theme';
import { getLevelTitle } from '../../src/services/gamification';
import { StorageService } from '../../src/services/storage';
import type { Achievement, UserStats } from '../../src/types';

export default function ProfileScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({
    level: 1,
    currentXp: 0,
    xpToNextLevel: 250,
    currentStreakDays: 0,
    longestStreakDays: 0,
    totalWorkoutsCompleted: 0,
    totalSetsCompleted: 0,
    totalVolumeKg: 0,
    unlockedAchievementIds: [],
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [customKey, setCustomKey] = useState('');
  const [isSavedKey, setIsSavedKey] = useState(false);

  const loadProfileData = useCallback(async () => {
    const [userStats, userAchievements, key] = await Promise.all([
      StorageService.getUserStats(),
      StorageService.getAchievements(),
      StorageService.getCustomApiKey(),
    ]);
    setStats(userStats);
    setAchievements(userAchievements);
    if (key) {
      setCustomKey(key);
      setIsSavedKey(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

  const handleSaveApiKey = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await StorageService.saveCustomApiKey(customKey);
    setIsSavedKey(true);
    Alert.alert('Chave Salva!', 'Sua chave do Google Gemini foi salva com sucesso no aparelho.');
  };

  const handleResetAllData = () => {
    Alert.alert(
      'Zerar Dados',
      'Tem certeza que deseja apagar todo o histórico de treinos, XP e ficha?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar Tudo',
          style: 'destructive',
          onPress: async () => {
            await StorageService.resetAllData();
            await loadProfileData();
            Alert.alert('Sucesso', 'Todos os dados foram resetados.');
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  const unlockedCount = achievements.filter((a) => a.unlockedAt).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="barbell" size={32} color={Colors.primary} />
          </View>

          <Text style={styles.userName}>Atleta Gym-Up</Text>
          <Text style={styles.userTitle}>{getLevelTitle(stats.level)}</Text>

          <View style={styles.levelBadgeRow}>
            <View style={styles.levelPill}>
              <Text style={styles.levelPillText}>NÍVEL {stats.level}</Text>
            </View>
            <View style={styles.streakPill}>
              <Ionicons name="flame" size={14} color={Colors.accentOrange} />
              <Text style={styles.streakPillText}>{stats.currentStreakDays} dias de streak</Text>
            </View>
          </View>
        </View>

        {/* Lifetime Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statMiniCard}>
            <Text style={styles.statNumber}>{stats.totalWorkoutsCompleted}</Text>
            <Text style={styles.statLabel}>Treinos</Text>
          </View>
          <View style={styles.statMiniCard}>
            <Text style={styles.statNumber}>{stats.totalSetsCompleted}</Text>
            <Text style={styles.statLabel}>Séries</Text>
          </View>
          <View style={styles.statMiniCard}>
            <Text style={styles.statNumber}>{(stats.totalVolumeKg / 1000).toFixed(1)}k</Text>
            <Text style={styles.statLabel}>Kg Tonnage</Text>
          </View>
          <View style={styles.statMiniCard}>
            <Text style={styles.statNumber}>{stats.longestStreakDays}d</Text>
            <Text style={styles.statLabel}>Recorde</Text>
          </View>
        </View>

        {/* Gamification: Badges Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="trophy" size={20} color={Colors.accentGold} />
            <Text style={styles.sectionTitle}>Conquistas & Badges</Text>
          </View>
          <Text style={styles.sectionBadgeCount}>
            {unlockedCount}/{achievements.length}
          </Text>
        </View>

        <View style={styles.achievementsGrid}>
          {achievements.map((ach) => {
            const isUnlocked = !!ach.unlockedAt;
            return (
              <View
                key={ach.id}
                style={[styles.achievementCard, isUnlocked && styles.achievementCardUnlocked]}
              >
                <View
                  style={[
                    styles.achievementIconBox,
                    isUnlocked && styles.achievementIconBoxUnlocked,
                  ]}
                >
                  <Ionicons
                    name={isUnlocked ? 'ribbon' : 'lock-closed'}
                    size={22}
                    color={isUnlocked ? Colors.accentGold : Colors.textDisabled}
                  />
                </View>
                <Text
                  style={[styles.achievementName, isUnlocked && styles.achievementNameUnlocked]}
                  numberOfLines={1}
                >
                  {ach.title}
                </Text>
                <Text style={styles.achievementDesc} numberOfLines={2}>
                  {ach.description}
                </Text>
                <View style={styles.achievementXpPill}>
                  <Text
                    style={[
                      styles.achievementXpText,
                      isUnlocked && styles.achievementXpTextUnlocked,
                    ]}
                  >
                    +{ach.xpReward} XP
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Gemini API Key Configuration Section */}
        <View style={styles.configCard}>
          <View style={styles.configHeader}>
            <Ionicons name="key-outline" size={20} color={Colors.primary} />
            <Text style={styles.configTitle}>Configuração do Gemini IA</Text>
          </View>

          <Text style={styles.configDesc}>
            A chave do Google AI Studio pode vir do arquivo{' '}
            <Text style={styles.codeText}>.env</Text> (chave padrão) ou ser sobrescrita abaixo:
          </Text>

          <TextInput
            style={styles.keyInput}
            placeholder="AIzaSy... (Chave API do Gemini)"
            placeholderTextColor={Colors.textDisabled}
            value={customKey}
            onChangeText={(v) => {
              setCustomKey(v);
              setIsSavedKey(false);
            }}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.saveKeyBtn} onPress={handleSaveApiKey}>
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

        {/* Data Reset */}
        <TouchableOpacity style={styles.resetBtn} onPress={handleResetAllData}>
          <Ionicons name="trash-outline" size={18} color={Colors.danger} />
          <Text style={styles.resetBtnText}>Zerar Todos os Dados e Histórico</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  userName: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.lg,
    fontWeight: '800',
  },
  userTitle: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  levelBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  levelPill: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  levelPillText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '800',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentOrangeMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  streakPillText: {
    color: Colors.accentOrange,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  statMiniCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.md,
    fontWeight: '800',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: '800',
  },
  sectionBadgeCount: {
    color: Colors.accentGold,
    fontSize: Typography.fontSizes.sm,
    fontWeight: '800',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  achievementCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  achievementCardUnlocked: {
    borderColor: 'rgba(255, 215, 0, 0.4)',
    backgroundColor: 'rgba(255, 215, 0, 0.04)',
  },
  achievementIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  achievementIconBoxUnlocked: {
    backgroundColor: Colors.accentGoldMuted,
  },
  achievementName: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  achievementNameUnlocked: {
    color: Colors.textPrimary,
  },
  achievementDesc: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
    height: 28,
  },
  achievementXpPill: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  achievementXpText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  achievementXpTextUnlocked: {
    color: Colors.accentGold,
  },
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
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dangerMuted,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(239, 83, 80, 0.3)',
  },
  resetBtnText: {
    color: Colors.danger,
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
  },
});

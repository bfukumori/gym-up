import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AchievementsGrid } from '../../src/components/profile/AchievementsGrid';
import { GeminiConfigCard } from '../../src/components/profile/GeminiConfigCard';
import { LifetimeStatsRow } from '../../src/components/profile/LifetimeStatsRow';
import { ProfileHeroCard } from '../../src/components/profile/ProfileHeroCard';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import { useProfileData } from '../../src/hooks/useProfileData';

export default function ProfileScreen() {
  const {
    stats,
    achievements,
    unlockedCount,
    customKey,
    setCustomKey,
    isSavedKey,
    setIsSavedKey,
    handleSaveApiKey,
    handleResetAllData,
  } = useProfileData();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Avatar & Level Header */}
        <ProfileHeroCard stats={stats} />

        {/* Lifetime Stats */}
        <LifetimeStatsRow stats={stats} />

        {/* Gamification: Badges Grid */}
        <AchievementsGrid achievements={achievements} unlockedCount={unlockedCount} />

        {/* Gemini API Key Configuration Section */}
        <GeminiConfigCard
          customKey={customKey}
          onChangeKey={(v) => {
            setCustomKey(v);
            setIsSavedKey(false);
          }}
          isSavedKey={isSavedKey}
          onSaveKey={handleSaveApiKey}
        />

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
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dangerMuted,
    borderRadius: 8,
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

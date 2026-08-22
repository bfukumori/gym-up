import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AchievementsGrid } from '../../src/components/profile/AchievementsGrid';
import { GeminiConfigCard } from '../../src/components/profile/GeminiConfigCard';
import { LifetimeStatsRow } from '../../src/components/profile/LifetimeStatsRow';
import { NotificationsCard } from '../../src/components/profile/NotificationsCard';
import { ProfileHeroCard } from '../../src/components/profile/ProfileHeroCard';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import { useProfileData } from '../../src/hooks/useProfileData';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const {
    stats,
    achievements,
    unlockedCount,
    customKey,
    setCustomKey,
    isSavedKey,
    setIsSavedKey,
    hasNotificationsPermission,
    morningReminderTime,
    handleChangeMorningReminderTime,
    handleSaveApiKey,
    handleRemoveApiKey,
    handleEnableOrTestNotifications,
    handleResetAllData,
  } = useProfileData();

  const handleFocusKeyInput = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 30}
        style={styles.keyboardContainer}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom > 0 ? insets.bottom + 150 : 170 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Profile Avatar & Level Header */}
          <ProfileHeroCard stats={stats} />

          {/* Lifetime Stats */}
          <LifetimeStatsRow stats={stats} />

          {/* Gamification: Badges Grid */}
          <AchievementsGrid achievements={achievements} unlockedCount={unlockedCount} />

          {/* Local Notifications Configuration */}
          <NotificationsCard
            hasPermission={hasNotificationsPermission}
            onEnableOrTest={handleEnableOrTestNotifications}
            morningTime={morningReminderTime}
            onChangeMorningTime={handleChangeMorningReminderTime}
          />

          {/* Gemini API Key Configuration Section */}
          <GeminiConfigCard
            customKey={customKey}
            onChangeKey={(v) => {
              setCustomKey(v);
              setIsSavedKey(false);
            }}
            isSavedKey={isSavedKey}
            onSaveKey={handleSaveApiKey}
            onRemoveKey={handleRemoveApiKey}
            onFocus={handleFocusKeyInput}
          />

          {/* Data Reset */}
          <TouchableOpacity style={styles.resetBtn} onPress={handleResetAllData}>
            <Ionicons name="trash-outline" size={18} color={Colors.danger} />
            <Text style={styles.resetBtnText}>Zerar Todos os Dados e Histórico</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingTop: Spacing.sm,
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

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyPlanCard } from '../../src/components/home/EmptyPlanCard';
import { QuickStatsGrid } from '../../src/components/home/QuickStatsGrid';
import { TodayWorkoutCard } from '../../src/components/home/TodayWorkoutCard';
import { WeeklyAdherenceCard } from '../../src/components/home/WeeklyAdherenceCard';
import { DefaultPlanSelectorModal } from '../../src/components/plan/DefaultPlanSelectorModal';
import { XpHeader } from '../../src/components/XpHeader';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import { useHomeData } from '../../src/hooks/useHomeData';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    stats,
    plan,
    activeDay,
    selectedDayIndex,
    setSelectedDayIndex,
    refreshing,
    onRefresh,
    workoutsThisWeek,
    targetDaysPerWeek,
    weekProgressPercent,
    hasGeminiKey,
    defaultPlansModalVisible,
    setDefaultPlansModalVisible,
    handleSelectPlan,
  } = useHomeData();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header Title */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.appTitle}>
              GYM<Text style={styles.appTitleAccent}>UP</Text>
            </Text>
            <Text style={styles.appSubtitle}>Treino inteligente & gamificado</Text>
          </View>

          <TouchableOpacity
            style={styles.settingsIconBtn}
            onPress={() => router.navigate('/(tabs)/profile')}
          >
            <Ionicons name="settings-sharp" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Gamified Header */}
        <XpHeader stats={stats} />

        {/* Weekly Adherence Card */}
        <WeeklyAdherenceCard
          workoutsThisWeek={workoutsThisWeek}
          targetDaysPerWeek={targetDaysPerWeek}
          weekProgressPercent={weekProgressPercent}
        />

        {/* Today's Workout Card or Empty State */}
        {plan && activeDay ? (
          <TodayWorkoutCard
            plan={plan}
            activeDay={activeDay}
            selectedDayIndex={selectedDayIndex}
            onSelectDayIndex={setSelectedDayIndex}
          />
        ) : (
          <EmptyPlanCard
            hasGeminiKey={hasGeminiKey}
            onOpenDefaultPlans={() => setDefaultPlansModalVisible(true)}
            onOpenQuiz={() => router.push('/onboarding/quiz')}
          />
        )}

        {/* Quick Stats Grid */}
        <QuickStatsGrid stats={stats} />
      </ScrollView>

      {/* Default Plan Selector Modal */}
      <DefaultPlanSelectorModal
        visible={defaultPlansModalVisible}
        onClose={() => setDefaultPlansModalVisible(false)}
        onSelectPlan={handleSelectPlan}
        hasGeminiKey={hasGeminiKey}
        onOpenQuiz={() => router.push('/onboarding/quiz')}
        onOpenProfile={() => router.navigate('/(tabs)/profile')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 30,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  appTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.xl,
    fontWeight: '900',
    letterSpacing: 1,
  },
  appTitleAccent: {
    color: Colors.primary,
  },
  appSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
  },
  settingsIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import * as Haptics from 'expo-haptics';
import { useObserve } from 'expo-observe';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MonthlyReportView } from '../../src/components/history/MonthlyReportView';
import { WeeklyReportView } from '../../src/components/history/WeeklyReportView';
import { WorkoutLogList } from '../../src/components/history/WorkoutLogList';
import { BorderRadius, Colors, Spacing, Typography } from '../../src/constants/theme';
import { useHistoryData } from '../../src/hooks/useHistoryData';

export default function HistoryScreen() {
  const { markInteractive } = useObserve();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    markInteractive();
  }, [markInteractive]);
  const { viewMode, setViewMode, logs, weeklyStats, monthlyStats } = useHistoryData();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Screen Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Relatórios & Progresso</Text>
        <Text style={styles.headerSubtitle}>Acompanhe sua consistência e evolução</Text>
      </View>

      {/* Segmented Switcher */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabButton, viewMode === 'weekly' && styles.tabButtonActive]}
          onPress={() => {
            Haptics.selectionAsync();
            setViewMode('weekly');
          }}
        >
          <Text style={[styles.tabText, viewMode === 'weekly' && styles.tabTextActive]}>
            Semanal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, viewMode === 'monthly' && styles.tabButtonActive]}
          onPress={() => {
            Haptics.selectionAsync();
            setViewMode('monthly');
          }}
        >
          <Text style={[styles.tabText, viewMode === 'monthly' && styles.tabTextActive]}>
            Mensal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, viewMode === 'logs' && styles.tabButtonActive]}
          onPress={() => {
            Haptics.selectionAsync();
            setViewMode('logs');
          }}
        >
          <Text style={[styles.tabText, viewMode === 'logs' && styles.tabTextActive]}>
            Histórico ({logs.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {viewMode === 'weekly' && <WeeklyReportView {...weeklyStats} />}
        {viewMode === 'monthly' && <MonthlyReportView {...monthlyStats} />}
        {viewMode === 'logs' && <WorkoutLogList logs={logs} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.lg,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    marginTop: 2,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    padding: 4,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#000000',
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 40,
  },
});

import * as Haptics from 'expo-haptics';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import type { WorkoutDay } from '../../types';

interface DaySelectorTabsProps {
  days: WorkoutDay[];
  selectedDayIdx: number;
  onSelectDayIdx: (idx: number) => void;
}

export function DaySelectorTabs({ days, selectedDayIdx, onSelectDayIdx }: DaySelectorTabsProps) {
  return (
    <View style={styles.tabsWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {days.map((d, index) => {
          const isSelected = selectedDayIdx === index;
          const letter = String.fromCharCode(65 + index);
          return (
            <TouchableOpacity
              key={d.id}
              style={[styles.tabButton, isSelected && styles.tabButtonActive]}
              onPress={() => {
                Haptics.selectionAsync();
                onSelectDayIdx(index);
              }}
            >
              <Text style={[styles.tabButtonText, isSelected && styles.tabButtonTextActive]}>
                Treino {letter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabsWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  tabsContainer: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  tabButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabButtonText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: '#000000',
  },
});

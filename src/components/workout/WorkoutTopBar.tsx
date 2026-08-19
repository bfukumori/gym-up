import { Ionicons } from '@expo/vector-icons';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';

interface WorkoutTopBarProps {
  dayName: string;
  timerFormatted: string;
  onClose: () => void;
  onFinish: () => void;
}

export function WorkoutTopBar({ dayName, timerFormatted, onClose, onFinish }: WorkoutTopBarProps) {
  const handleExit = () => {
    Alert.alert('Sair do Treino', 'Deseja realmente pausar/abandonar este treino?', [
      { text: 'Ficar no Treino', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: onClose },
    ]);
  };

  return (
    <View style={styles.topBar}>
      <TouchableOpacity onPress={handleExit} style={styles.backButton}>
        <Ionicons name="close" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.topCenter}>
        <Text style={styles.topDayTitle} numberOfLines={1}>
          {dayName}
        </Text>
        <View style={styles.timeBadge}>
          <Ionicons name="stopwatch-outline" size={14} color={Colors.accentOrange} />
          <Text style={styles.timeText}>{timerFormatted}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.finishTopBtn} onPress={onFinish}>
        <Text style={styles.finishTopBtnText}>Concluir</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 6,
  },
  topCenter: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: Spacing.sm,
  },
  topDayTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  timeText: {
    color: Colors.accentOrange,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
  },
  finishTopBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
  },
  finishTopBtnText: {
    color: '#000000',
    fontSize: Typography.fontSizes.xs,
    fontWeight: '800',
  },
});

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/theme';

interface RestTimerModalProps {
  visible: boolean;
  initialSeconds: number;
  onClose: () => void;
}

export const RestTimerModal: React.FC<RestTimerModalProps> = ({
  visible,
  initialSeconds,
  onClose,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (visible) {
      setSecondsLeft(initialSeconds);
      setTotalSeconds(initialSeconds);
    }
  }, [visible, initialSeconds]);

  useEffect(() => {
    if (!visible) return;

    if (secondsLeft <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const timer = setTimeout(() => {
        onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, secondsLeft, onClose]);

  const addSeconds = (amount: number) => {
    setSecondsLeft((prev) => Math.max(0, prev + amount));
    setTotalSeconds((prev) => Math.max(prev, secondsLeft + amount));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (!visible) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const progress = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="timer-outline" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Tempo de Descanso</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Big Countdown Display */}
          <View style={styles.timerDisplayContainer}>
            <Text style={[styles.timerNumber, secondsLeft <= 5 && styles.timerEnding]}>
              {timeFormatted}
            </Text>
            <Text style={styles.timerSubtext}>
              {secondsLeft <= 0 ? 'DESCANSO FINALIZADO!' : 'Recupere o fôlego para a próxima série'}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>

          {/* Quick Adjustment Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.adjustBtn} onPress={() => addSeconds(-15)}>
              <Text style={styles.adjustBtnText}>-15s</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipBtn} onPress={onClose}>
              <Ionicons name="play-forward" size={18} color="#000000" />
              <Text style={styles.skipBtnText}>Pular Descanso</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.adjustBtn} onPress={() => addSeconds(15)}>
              <Text style={styles.adjustBtnText}>+15s</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.md,
    fontWeight: '700',
    flex: 1,
  },
  closeBtn: {
    padding: 6,
  },
  timerDisplayContainer: {
    alignItems: 'center',
    marginVertical: Spacing.base,
  },
  timerNumber: {
    fontSize: 54,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 2,
  },
  timerEnding: {
    color: Colors.accentOrange,
  },
  timerSubtext: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    marginVertical: Spacing.lg,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: Spacing.sm,
  },
  adjustBtn: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  adjustBtnText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
  },
  skipBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  skipBtnText: {
    color: '#000000',
    fontSize: Typography.fontSizes.sm,
    fontWeight: '800',
  },
});

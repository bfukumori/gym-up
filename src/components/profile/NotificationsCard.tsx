import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';

interface NotificationsCardProps {
  hasPermission: boolean;
  onEnableOrTest: () => void;
  morningTime: string;
  onChangeMorningTime: (time: string) => void;
}

const MORNING_PRESETS = ['06:30', '07:30', '09:00', '11:30'];

export function NotificationsCard({
  hasPermission,
  onEnableOrTest,
  morningTime,
  onChangeMorningTime,
}: NotificationsCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [customHour, setCustomHour] = useState('');
  const [customMin, setCustomMin] = useState('');

  const handleOpenModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const [h, m] = morningTime.split(':');
    setCustomHour(h || '11');
    setCustomMin(m || '30');
    setModalVisible(true);
  };

  const handleSelectPreset = (preset: string) => {
    onChangeMorningTime(preset);
    setModalVisible(false);
  };

  const handleSaveCustom = () => {
    let hNum = Number.parseInt(customHour || '11', 10);
    let mNum = Number.parseInt(customMin || '00', 10);

    if (Number.isNaN(hNum) || hNum < 0) hNum = 0;
    if (hNum > 23) hNum = 23;

    if (Number.isNaN(mNum) || mNum < 0) mNum = 0;
    if (mNum > 59) mNum = 59;

    const formatted = `${String(hNum).padStart(2, '0')}:${String(mNum).padStart(2, '0')}`;
    onChangeMorningTime(formatted);
    setModalVisible(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="notifications" size={20} color={Colors.primary} />
          <Text style={styles.title}>Lembretes de Treino</Text>
        </View>

        <View style={[styles.badge, hasPermission ? styles.badgeActive : styles.badgeInactive]}>
          <Text
            style={[
              styles.badgeText,
              hasPermission ? styles.badgeTextActive : styles.badgeTextInactive,
            ]}
          >
            {hasPermission ? 'Ativo' : 'Desativado'}
          </Text>
        </View>
      </View>

      <Text style={styles.desc}>
        Notificações locais inteligentes para manter sua rotina e streak sempre em alta:
      </Text>

      <View style={styles.scheduleList}>
        {/* Morning reminder with editable time */}
        <View style={styles.scheduleItem}>
          <TouchableOpacity
            style={styles.timeTagInteractive}
            onPress={handleOpenModal}
            activeOpacity={0.7}
          >
            <Ionicons name="sunny-outline" size={14} color={Colors.warning} />
            <Text style={styles.timeText}>{morningTime}</Text>
            <Ionicons name="pencil" size={11} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.scheduleInfo}>
            <Text style={styles.scheduleLabel}>Lembrete matutino configurável</Text>
            <Text style={styles.scheduleSublabel}>Toque no horário para alterar</Text>
          </View>
        </View>

        {/* Evening reminder - fixed at 18:00 */}
        <View style={styles.scheduleItem}>
          <View style={styles.timeTagFixed}>
            <Ionicons name="moon-outline" size={14} color={Colors.accentBlue} />
            <Text style={styles.timeText}>18:00</Text>
            <View style={styles.fixedBadge}>
              <Text style={styles.fixedBadgeText}>Fixo</Text>
            </View>
          </View>
          <View style={styles.scheduleInfo}>
            <Text style={styles.scheduleLabel}>
              Aviso vespertino{' '}
              <Text style={styles.highlightText}>somente se você ainda não treinou</Text>
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.actionBtn} onPress={onEnableOrTest}>
        <Ionicons
          name={hasPermission ? 'paper-plane-outline' : 'checkmark-circle-outline'}
          size={16}
          color="#000000"
        />
        <Text style={styles.actionBtnText}>
          {hasPermission ? 'Testar Notificação Agora' : 'Ativar Notificações'}
        </Text>
      </TouchableOpacity>

      {/* Morning Time Picker Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Horário do Lembrete Matutino</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Escolha em que horário você prefere receber o lembrete de treino pela manhã:
            </Text>

            {/* Presets Grid */}
            <Text style={styles.sectionLabel}>SUGESTÕES DE HORÁRIO:</Text>
            <View style={styles.presetsRow}>
              {MORNING_PRESETS.map((preset) => {
                const isSelected = morningTime === preset;
                return (
                  <TouchableOpacity
                    key={preset}
                    style={[styles.presetBtn, isSelected && styles.presetBtnActive]}
                    onPress={() => handleSelectPreset(preset)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[styles.presetBtnText, isSelected && styles.presetBtnTextActive]}
                    >
                      {preset}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Input */}
            <Text style={styles.sectionLabel}>OU DIGITE UM HORÁRIO ESPECÍFICO:</Text>
            <View style={styles.customTimeRow}>
              <TextInput
                style={styles.timeInput}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="HH"
                placeholderTextColor={Colors.textDisabled}
                value={customHour}
                onChangeText={setCustomHour}
                selectTextOnFocus
              />
              <Text style={styles.timeColon}>:</Text>
              <TextInput
                style={styles.timeInput}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="MM"
                placeholderTextColor={Colors.textDisabled}
                value={customMin}
                onChangeText={setCustomMin}
                selectTextOnFocus
              />

              <TouchableOpacity
                style={styles.saveCustomBtn}
                onPress={handleSaveCustom}
                activeOpacity={0.8}
              >
                <Text style={styles.saveCustomBtnText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  badgeInactive: {
    backgroundColor: 'rgba(239, 83, 80, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 83, 80, 0.3)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextActive: {
    color: Colors.success,
  },
  badgeTextInactive: {
    color: Colors.danger,
  },
  desc: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  scheduleList: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
    gap: Spacing.md,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  scheduleInfo: {
    flex: 1,
  },
  timeTagInteractive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.card,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  timeTagFixed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.card,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  fixedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginLeft: 2,
  },
  fixedBadgeText: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },
  scheduleLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  scheduleSublabel: {
    color: Colors.primary,
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  highlightText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 2,
  },
  actionBtnText: {
    color: '#000000',
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  modalTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    lineHeight: 17,
    marginBottom: Spacing.base,
  },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.base,
  },
  presetBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetBtnActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  presetBtnText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
  },
  presetBtnTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  customTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  timeInput: {
    width: 52,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    textAlign: 'center',
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeColon: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.lg,
    fontWeight: '800',
  },
  saveCustomBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
  saveCustomBtnText: {
    color: '#000000',
    fontSize: Typography.fontSizes.xs,
    fontWeight: '800',
  },
});


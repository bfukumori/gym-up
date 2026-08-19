import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';

interface NotificationsCardProps {
  hasPermission: boolean;
  onEnableOrTest: () => void;
}

export function NotificationsCard({ hasPermission, onEnableOrTest }: NotificationsCardProps) {
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
        <View style={styles.scheduleItem}>
          <View style={styles.timeTag}>
            <Ionicons name="sunny-outline" size={14} color={Colors.warning} />
            <Text style={styles.timeText}>11:30</Text>
          </View>
          <Text style={styles.scheduleLabel}>Lembrete diário para planejar ou fazer o treino</Text>
        </View>

        <View style={styles.scheduleItem}>
          <View style={styles.timeTag}>
            <Ionicons name="moon-outline" size={14} color={Colors.accentBlue} />
            <Text style={styles.timeText}>18:00</Text>
          </View>
          <Text style={styles.scheduleLabel}>
            Aviso vespertino{' '}
            <Text style={styles.highlightText}>somente se você ainda não treinou</Text>
          </Text>
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
    gap: Spacing.sm,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  scheduleLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
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
});

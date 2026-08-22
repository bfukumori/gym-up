import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Updates from 'expo-updates';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';

export function AppUpdateCard() {
  const [checking, setChecking] = useState(false);

  const channel = Updates.channel || (Updates.isEmbeddedLaunch ? 'Embedded' : 'preview');
  const runtimeVersion =
    typeof Updates.runtimeVersion === 'string' ? Updates.runtimeVersion : '1.0.0';
  const updateId = Updates.updateId
    ? Updates.updateId.substring(0, 8)
    : Updates.isEmbeddedLaunch
      ? 'Build Original'
      : 'Ativo';

  const handleCheckUpdate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChecking(true);

    try {
      if (__DEV__) {
        Alert.alert(
          'Modo de Desenvolvimento',
          'Em modo dev, o app consome código local (Metro). As atualizações OTA são aplicadas em builds de Preview e Produção.'
        );
        setChecking(false);
        return;
      }

      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Nova Versão Encontrada! 🚀',
          'Uma nova atualização foi encontrada. Baixando e aplicando agora...',
          [
            {
              text: 'Atualizar Agora',
              onPress: async () => {
                try {
                  await Updates.fetchUpdateAsync();
                  await Updates.reloadAsync();
                } catch {
                  Alert.alert('Erro', 'Não foi possível recarregar a atualização.');
                }
              },
            },
          ]
        );
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          'App Atualizado',
          'Você já está na versão mais recente disponível para este canal.'
        );
      }
    } catch (e) {
      console.log('Error checking updates:', e);
      Alert.alert(
        'Verificação Concluída',
        'Não foi possível conectar ao servidor de atualizações no momento ou o app já está na versão mais recente.'
      );
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="cloud-download-outline" size={20} color={Colors.primary} />
          <Text style={styles.title}>Versão & Atualizações OTA</Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{channel.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.desc}>
        Informações do canal de distribuição e controle de atualizações instantâneas:
      </Text>

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Runtime</Text>
          <Text style={styles.infoValue}>{runtimeVersion}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Update ID</Text>
          <Text style={styles.infoValue}>{updateId}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Status</Text>
          <Text style={styles.infoValueHighlight}>
            {Updates.isEmbeddedLaunch ? 'Embutido' : 'OTA Ativo'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.checkBtn, checking && styles.checkBtnDisabled]}
        onPress={handleCheckUpdate}
        disabled={checking}
        activeOpacity={0.8}
      >
        {checking ? (
          <ActivityIndicator size="small" color="#000000" />
        ) : (
          <>
            <Ionicons name="refresh" size={16} color="#000000" />
            <Text style={styles.checkBtnText}>Verificar Atualizações Agora</Text>
          </>
        )}
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
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  desc: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  infoGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  infoValue: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  infoValueHighlight: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  checkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 2,
  },
  checkBtnDisabled: {
    opacity: 0.6,
  },
  checkBtnText: {
    color: '#000000',
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
  },
});

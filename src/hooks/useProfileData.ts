import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AppState, type AppStateStatus, Linking } from 'react-native';
import { NotificationService } from '../services/notifications';
import { StorageService } from '../services/storage';
import type { Achievement, UserStats } from '../types';

const DEFAULT_STATS: UserStats = {
  level: 1,
  currentXp: 0,
  xpToNextLevel: 250,
  currentStreakDays: 0,
  longestStreakDays: 0,
  totalWorkoutsCompleted: 0,
  totalSetsCompleted: 0,
  totalVolumeKg: 0,
  unlockedAchievementIds: [],
};

export function useProfileData() {
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [customKey, setCustomKey] = useState('');
  const [isSavedKey, setIsSavedKey] = useState(false);
  const [hasNotificationsPermission, setHasNotificationsPermission] = useState(false);

  const loadProfileData = useCallback(async () => {
    const [userStats, userAchievements, key, notificationsAllowed] = await Promise.all([
      StorageService.getUserStats(),
      StorageService.getAchievements(),
      StorageService.getCustomApiKey(),
      NotificationService.hasPermissions(),
    ]);
    setStats(userStats);
    setAchievements(userAchievements);
    setHasNotificationsPermission(notificationsAllowed);
    if (key) {
      setCustomKey(key);
      setIsSavedKey(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        const permitted = await NotificationService.hasPermissions();
        setHasNotificationsPermission(permitted);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleSaveApiKey = async () => {
    const sanitized = customKey.trim().replace(/^["']|["']$/g, '');
    if (!sanitized) {
      Alert.alert('Campo Vazio', 'Por favor, insira uma chave API do Gemini antes de salvar.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCustomKey(sanitized);
    await StorageService.saveCustomApiKey(sanitized);
    setIsSavedKey(true);
    Alert.alert('Chave Salva!', 'Sua chave do Google Gemini foi salva com sucesso no aparelho.');
  };

  const handleRemoveApiKey = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await StorageService.saveCustomApiKey('');
    setCustomKey('');
    setIsSavedKey(false);
    Alert.alert(
      'Chave Removida',
      'Sua chave do Gemini foi removida. O app utilizará os treinos padrão.'
    );
  };

  const handleEnableOrTestNotifications = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const permitted = await NotificationService.requestPermissions();
    setHasNotificationsPermission(permitted);

    if (permitted) {
      await NotificationService.sendTestNotification();
      await NotificationService.syncWorkoutReminders();
      Alert.alert(
        'Notificação de Teste Enviada! 🚀',
        'Uma notificação de teste será exibida em instantes. Os lembretes diários (11:30) e condicional (18:00 se não treinou) estão ativos.'
      );
    } else {
      Alert.alert(
        'Permissão de Notificações',
        'As notificações estão desativadas para o GymUp. Deseja abrir as configurações do aparelho para ativá-las?',
        [
          { text: 'Agora Não', style: 'cancel' },
          {
            text: 'Abrir Configurações',
            onPress: () => {
              Linking.openSettings();
            },
          },
        ]
      );
    }
  };

  const handleResetAllData = () => {
    Alert.alert(
      'Zerar Dados',
      'Tem certeza que deseja apagar todo o histórico de treinos, XP e ficha?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar Tudo',
          style: 'destructive',
          onPress: async () => {
            await StorageService.resetAllData();
            await NotificationService.syncWorkoutReminders();
            await loadProfileData();
            Alert.alert('Sucesso', 'Todos os dados foram resetados.');
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  const unlockedCount = achievements.filter((a) => a.unlockedAt).length;

  return {
    stats,
    achievements,
    unlockedCount,
    customKey,
    setCustomKey,
    isSavedKey,
    setIsSavedKey,
    hasNotificationsPermission,
    handleSaveApiKey,
    handleRemoveApiKey,
    handleEnableOrTestNotifications,
    handleResetAllData,
  };
}

import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
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

  const loadProfileData = useCallback(async () => {
    const [userStats, userAchievements, key] = await Promise.all([
      StorageService.getUserStats(),
      StorageService.getAchievements(),
      StorageService.getCustomApiKey(),
    ]);
    setStats(userStats);
    setAchievements(userAchievements);
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

  const handleSaveApiKey = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await StorageService.saveCustomApiKey(customKey);
    setIsSavedKey(true);
    Alert.alert('Chave Salva!', 'Sua chave do Google Gemini foi salva com sucesso no aparelho.');
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
    handleSaveApiKey,
    handleResetAllData,
  };
}

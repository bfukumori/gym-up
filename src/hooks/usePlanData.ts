import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { hasGeminiApiKey } from '../services/gemini';
import { StorageService } from '../services/storage';
import type { WorkoutPlan } from '../types';

export function usePlanData() {
  const router = useRouter();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [defaultPlansModalVisible, setDefaultPlansModalVisible] = useState(false);

  const loadPlan = useCallback(async () => {
    const [saved, hasKey] = await Promise.all([
      StorageService.getWorkoutPlan(),
      hasGeminiApiKey(),
    ]);
    setPlan(saved);
    setHasGeminiKey(hasKey);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPlan();
    }, [loadPlan])
  );

  const handleSelectPlan = async (selectedPlan: WorkoutPlan) => {
    await StorageService.saveWorkoutPlan(selectedPlan);
    setPlan(selectedPlan);
    setSelectedDayIdx(0);
  };

  const handleResetPlan = () => {
    if (hasGeminiKey) {
      Alert.alert(
        'Alterar Ficha de Treino',
        'Como deseja configurar sua nova rotina de treinos?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Treino Padrão',
            onPress: () => setDefaultPlansModalVisible(true),
          },
          {
            text: 'Nova Ficha com IA',
            style: 'default',
            onPress: () => router.push('/onboarding/quiz'),
          },
        ]
      );
    } else {
      setDefaultPlansModalVisible(true);
    }
  };

  const activeDay = plan?.days?.[selectedDayIdx] || plan?.days?.[0];

  return {
    plan,
    selectedDayIdx,
    setSelectedDayIdx,
    activeDay,
    hasGeminiKey,
    defaultPlansModalVisible,
    setDefaultPlansModalVisible,
    handleSelectPlan,
    handleResetPlan,
  };
}


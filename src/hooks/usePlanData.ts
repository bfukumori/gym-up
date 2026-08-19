import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { StorageService } from '../services/storage';
import type { WorkoutPlan } from '../types';

export function usePlanData() {
  const router = useRouter();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  const loadPlan = useCallback(async () => {
    const saved = await StorageService.getWorkoutPlan();
    setPlan(saved);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPlan();
    }, [loadPlan])
  );

  const handleResetPlan = () => {
    Alert.alert(
      'Recriar Ficha',
      'Deseja criar uma nova ficha de treino respondendo ao questionário do Gemini?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Recriar',
          style: 'destructive',
          onPress: () => router.push('/onboarding/quiz'),
        },
      ]
    );
  };

  const activeDay = plan?.days?.[selectedDayIdx] || plan?.days?.[0];

  return {
    plan,
    selectedDayIdx,
    setSelectedDayIdx,
    activeDay,
    handleResetPlan,
  };
}

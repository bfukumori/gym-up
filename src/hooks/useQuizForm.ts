import * as Haptics from 'expo-haptics';
import { Observe } from 'expo-observe';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { GeminiService, getActiveApiKey } from '../services/gemini';
import type { EquipmentType, ExperienceLevel, GoalType, QuizAnswers } from '../types';

export function useQuizForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [goal, setGoal] = useState<GoalType>('hypertrophy');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(4);
  const [minutesPerSession, setMinutesPerSession] = useState<number>(60);
  const [experience, setExperience] = useState<ExperienceLevel>('intermediate');
  const [equipment, setEquipment] = useState<EquipmentType>('full_gym');
  const [focusMuscles, setFocusMuscles] = useState<string[]>(['Peitoral', 'Costas']);
  const [limitations, setLimitations] = useState('');
  const [notes, setNotes] = useState('');

  const toggleMuscle = (muscle: string) => {
    Haptics.selectionAsync();
    setFocusMuscles((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
    );
  };

  const generatePlan = async () => {
    try {
      setLoading(true);
      const hasKey = await getActiveApiKey();
      if (!hasKey || hasKey.trim().length === 0) {
        Alert.alert(
          'Chave Gemini Necessária 🔑',
          'A montagem personalizada com IA requer a configuração da sua chave do Google AI Studio. Você pode escolher uma ficha padrão pronta ou configurar a chave no Perfil.',
          [
            {
              text: 'Ver Fichas Padrão',
              onPress: () => router.replace('/(tabs)/plan'),
            },
            {
              text: 'Configurar Chave',
              onPress: () => router.replace('/(tabs)/profile'),
            },
          ]
        );
        return;
      }

      const answers: QuizAnswers = {
        goal,
        daysPerWeek,
        minutesPerSession,
        experience,
        equipment,
        focusMuscles,
        limitations,
        notes,
      };

      await GeminiService.generateWorkoutPlan(answers);
      Observe.logEvent('ai_plan.generated', {
        attributes: {
          goal,
          daysPerWeek,
          experience,
        },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Treino Gerado com Sucesso! 🚀',
        'Seu novo plano de treino personalizado foi montado e já está pronto para execução.',
        [
          {
            text: 'Visualizar Ficha',
            onPress: () => router.replace('/(tabs)/plan'),
          },
        ]
      );
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Erro ao Gerar Treino',
        'Não foi possível conectar com o Gemini. Verifique sua chave API no Perfil.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      generatePlan();
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 1) {
      setStep((s) => s - 1);
    } else {
      router.back();
    }
  };

  return {
    step,
    loading,
    goal,
    setGoal,
    daysPerWeek,
    setDaysPerWeek,
    minutesPerSession,
    setMinutesPerSession,
    experience,
    setExperience,
    equipment,
    setEquipment,
    focusMuscles,
    toggleMuscle,
    limitations,
    setLimitations,
    notes,
    setNotes,
    handleNext,
    handleBack,
  };
}

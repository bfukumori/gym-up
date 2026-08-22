import type { QuizAnswers, WorkoutDay, WorkoutPlan } from '../types';
import { StorageService } from './storage';

const CANDIDATE_MODELS = [
  'gemini-3.6-flash',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
];

export async function getActiveApiKey(): Promise<string> {
  const customKey = await StorageService.getCustomApiKey();
  if (customKey && customKey.trim().length > 0) {
    return customKey.trim();
  }
  return process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
}

export async function hasGeminiApiKey(): Promise<boolean> {
  const key = await getActiveApiKey();
  return Boolean(key && key.trim().length > 0);
}

export function generatePromptForWorkout(answers: QuizAnswers): string {
  const goalLabels: Record<string, string> = {
    hypertrophy: 'Hipertrofia Muscular (Ganho de Massa)',
    strength: 'Ganho de Força e Performance',
    fat_loss: 'Definição e Queima de Gordura',
    conditioning: 'Condicionamento Físico e Resistência',
    general: 'Saúde Geral e Bem-Estar',
  };

  const expLabels: Record<string, string> = {
    beginner: 'Iniciante (menos de 6 meses)',
    intermediate: 'Intermediário (6 meses a 2 anos)',
    advanced: 'Avançado (mais de 2 anos)',
  };

  const equipLabels: Record<string, string> = {
    full_gym: 'Academia Completa (máquinas, barras, halteres, cabos)',
    dumbbells_only: 'Apenas Halteres e Banco',
    home_minimal: 'Treino em Casa / Minimalista',
    bodyweight: 'Calistenia e Peso Corporal',
  };

  return `Você é um treinador de musculação de elite e especialista em biomecânica e periodização.
Crie uma ficha de treino semanal completa, altamente visual, prática e personalizada para o seguinte aluno:

- Objetivo: ${goalLabels[answers.goal] || answers.goal}
- Frequência: ${answers.daysPerWeek} dias por semana
- Tempo disponível por treino: ${answers.minutesPerSession} minutos
- Nível de Experiência: ${expLabels[answers.experience] || answers.experience}
- Equipamentos disponíveis: ${equipLabels[answers.equipment] || answers.equipment}
- Músculos prioritários de foco: ${answers.focusMuscles.length > 0 ? answers.focusMuscles.join(', ') : 'Distribuição equilibrada'}
- Limitações / Dores / Lesões: ${answers.limitations || 'Nenhuma'}
- Observações adicionais: ${answers.notes || 'Nenhuma'}

INSTRUÇÕES CRÍTICAS DE FORMATO:
Você DEVE responder ESTRITAMENTE em formato JSON válido, sem qualquer texto introdutório, sem tags de markdown adicionais fora do JSON, obedecendo exatamente à seguinte estrutura:

{
  "title": "Nome do Programa de Treino (ex: Hipertrofia A/B/C 4x)",
  "description": "Breve explicação da metodologia e dicas para o aluno",
  "days": [
    {
      "id": "day-1",
      "name": "Treino A - Peito e Tríceps (Push)",
      "dayOfWeekLabel": "Segunda-feira",
      "targetMuscleGroups": ["Peito", "Tríceps", "Ombro"],
      "estimatedMinutes": ${answers.minutesPerSession},
      "exercises": [
        {
          "id": "ex-1",
          "name": "Supino Reto com Halteres",
          "muscleGroup": "Peitoral",
          "equipment": "Halteres",
          "notes": "Desça controlando a carga por 2s e contraia no topo.",
          "targetSets": [
            {
              "setNumber": 1,
              "targetReps": "10-12",
              "suggestedWeightKg": 14,
              "restSeconds": 60
            },
            {
              "setNumber": 2,
              "targetReps": "8-10",
              "suggestedWeightKg": 16,
              "restSeconds": 60
            },
            {
              "setNumber": 3,
              "targetReps": "8-10",
              "suggestedWeightKg": 16,
              "restSeconds": 60
            }
          ]
        }
      ]
    }
  ]
}

Garanta que o número de dias em "days" seja EXATAMENTE ${answers.daysPerWeek}.
Os nomes dos exercícios devem estar em Português do Brasil comumente usados nas academias.`;
}

async function callGeminiApi(prompt: string, apiKey: string): Promise<string> {
  let lastError = '';

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        const errText = await response.text();
        lastError = `Modelo ${model} retornou ${response.status}: ${errText}`;
        console.warn(`Tentativa com ${model} falhou:`, lastError);
      }
    } catch (e) {
      lastError = String(e);
      console.warn(`Erro de conexão com ${model}:`, e);
    }
  }

  throw new Error(`Todas as tentativas de modelo Gemini falharam. Último erro: ${lastError}`);
}

export const GeminiService = {
  async generateWorkoutPlan(answers: QuizAnswers): Promise<WorkoutPlan> {
    const apiKey = await getActiveApiKey();

    if (!apiKey) {
      const fallback = generateOfflineWorkoutPlan(answers);
      await StorageService.saveWorkoutPlan(fallback);
      return fallback;
    }

    try {
      const prompt = generatePromptForWorkout(answers);
      const responseText = await callGeminiApi(prompt, apiKey);

      if (!responseText) {
        throw new Error('Resposta vazia recebida do Gemini.');
      }

      // Clean markdown code blocks if any
      let cleanedJson = responseText.trim();
      if (cleanedJson.startsWith('```json')) {
        cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedJson.startsWith('```')) {
        cleanedJson = cleanedJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      interface RawTargetSet {
        setNumber?: number;
        targetReps?: string;
        suggestedWeightKg?: number;
        restSeconds?: number;
      }
      interface RawExercise {
        id?: string;
        name: string;
        muscleGroup?: string;
        equipment?: string;
        notes?: string;
        targetSets?: RawTargetSet[];
      }
      interface RawWorkoutDay {
        id?: string;
        name?: string;
        dayOfWeekLabel?: string;
        targetMuscleGroups?: string[];
        estimatedMinutes?: number;
        exercises?: RawExercise[];
      }
      interface RawGeminiOutput {
        title?: string;
        description?: string;
        days?: RawWorkoutDay[];
      }

      const parsed: RawGeminiOutput = JSON.parse(cleanedJson);

      const workoutPlan: WorkoutPlan = {
        id: `plan-${Date.now()}`,
        title: parsed.title || 'Meu Plano de Treino Personalizado',
        description:
          parsed.description ||
          'Plano estruturado e balanceado gerado com inteligência artificial.',
        createdAt: new Date().toISOString(),
        answers,
        days: (parsed.days || []).map((day, dIdx: number) => ({
          id: day.id || `day-${dIdx + 1}`,
          name: day.name || `Treino ${String.fromCharCode(65 + dIdx)}`,
          dayOfWeekLabel: day.dayOfWeekLabel,
          targetMuscleGroups: day.targetMuscleGroups || [],
          estimatedMinutes: day.estimatedMinutes || answers.minutesPerSession,
          exercises: (day.exercises || []).map((ex, eIdx: number) => ({
            id: ex.id || `ex-${dIdx + 1}-${eIdx + 1}`,
            name: ex.name,
            muscleGroup: ex.muscleGroup || 'Geral',
            equipment: ex.equipment || 'Livre',
            notes: ex.notes,
            targetSets: (ex.targetSets || []).map((set, sIdx: number) => ({
              setNumber: set.setNumber || sIdx + 1,
              targetReps: set.targetReps || '10-12',
              suggestedWeightKg: set.suggestedWeightKg || 0,
              restSeconds: set.restSeconds || 60,
            })),
          })),
        })),
      };

      await StorageService.saveWorkoutPlan(workoutPlan);
      return workoutPlan;
    } catch (error) {
      console.error('Error generating workout with Gemini:', error);
      // Fallback gracefully so user experience is never blocked
      const fallback = generateOfflineWorkoutPlan(answers);
      await StorageService.saveWorkoutPlan(fallback);
      return fallback;
    }
  },
};

// High quality offline fallback generator based on answers
export function generateOfflineWorkoutPlan(answers: QuizAnswers): WorkoutPlan {
  const days: WorkoutDay[] = [];
  const daysCount = Math.min(Math.max(answers.daysPerWeek, 1), 6);

  if (daysCount <= 3) {
    // Full Body or ABC Split
    days.push({
      id: 'day-1',
      name: 'Treino A - Peitoral, Ombros & Tríceps (Push)',
      dayOfWeekLabel: 'Dia 1',
      targetMuscleGroups: ['Peitoral', 'Ombros', 'Tríceps'],
      estimatedMinutes: answers.minutesPerSession,
      exercises: [
        {
          id: 'ex-1-1',
          name: 'Supino Reto com Halteres',
          muscleGroup: 'Peitoral',
          equipment: 'Halteres',
          notes: 'Controle a descida e mantenha escápulas retraídas.',
          targetSets: [
            { setNumber: 1, targetReps: '10-12', suggestedWeightKg: 14, restSeconds: 60 },
            { setNumber: 2, targetReps: '10-12', suggestedWeightKg: 16, restSeconds: 60 },
            { setNumber: 3, targetReps: '8-10', suggestedWeightKg: 18, restSeconds: 90 },
          ],
        },
        {
          id: 'ex-1-2',
          name: 'Desenvolvimento Militar com Halteres',
          muscleGroup: 'Ombros',
          equipment: 'Halteres',
          notes: 'Postura firme, não curve a lombar.',
          targetSets: [
            { setNumber: 1, targetReps: '10-12', suggestedWeightKg: 10, restSeconds: 60 },
            { setNumber: 2, targetReps: '10-12', suggestedWeightKg: 12, restSeconds: 60 },
            { setNumber: 3, targetReps: '8-10', suggestedWeightKg: 12, restSeconds: 60 },
          ],
        },
        {
          id: 'ex-1-3',
          name: 'Tríceps Corda na Polia',
          muscleGroup: 'Tríceps',
          equipment: 'Cabo / Polia',
          notes: 'Abra a corda no final do movimento para contração máxima.',
          targetSets: [
            { setNumber: 1, targetReps: '12-15', suggestedWeightKg: 15, restSeconds: 45 },
            { setNumber: 2, targetReps: '12-15', suggestedWeightKg: 18, restSeconds: 45 },
            { setNumber: 3, targetReps: '10-12', suggestedWeightKg: 20, restSeconds: 60 },
          ],
        },
      ],
    });

    if (daysCount >= 2) {
      days.push({
        id: 'day-2',
        name: 'Treino B - Costas, Bíceps & Abdômen (Pull)',
        dayOfWeekLabel: 'Dia 2',
        targetMuscleGroups: ['Costas', 'Bíceps', 'Core'],
        estimatedMinutes: answers.minutesPerSession,
        exercises: [
          {
            id: 'ex-2-1',
            name: 'Puxada Frontal Aberta',
            muscleGroup: 'Costas',
            equipment: 'Polia',
            notes: 'Puxe em direção ao peitoral superior com o tronco ereto.',
            targetSets: [
              { setNumber: 1, targetReps: '10-12', suggestedWeightKg: 35, restSeconds: 60 },
              { setNumber: 2, targetReps: '10-12', suggestedWeightKg: 40, restSeconds: 60 },
              { setNumber: 3, targetReps: '8-10', suggestedWeightKg: 45, restSeconds: 90 },
            ],
          },
          {
            id: 'ex-2-2',
            name: 'Remada Curvada com Halteres',
            muscleGroup: 'Costas',
            equipment: 'Halteres',
            notes: 'Coluna alinhada e foco em puxar com os cotovelos.',
            targetSets: [
              { setNumber: 1, targetReps: '10-12', suggestedWeightKg: 14, restSeconds: 60 },
              { setNumber: 2, targetReps: '10-12', suggestedWeightKg: 16, restSeconds: 60 },
              { setNumber: 3, targetReps: '8-10', suggestedWeightKg: 18, restSeconds: 60 },
            ],
          },
          {
            id: 'ex-2-3',
            name: 'Rosca Direta com Barra W',
            muscleGroup: 'Bíceps',
            equipment: 'Barra',
            notes: 'Sem balanço do tronco durante a subida.',
            targetSets: [
              { setNumber: 1, targetReps: '10-12', suggestedWeightKg: 16, restSeconds: 45 },
              { setNumber: 2, targetReps: '10-12', suggestedWeightKg: 18, restSeconds: 45 },
              { setNumber: 3, targetReps: '8-10', suggestedWeightKg: 20, restSeconds: 60 },
            ],
          },
        ],
      });
    }

    if (daysCount >= 3) {
      days.push({
        id: 'day-3',
        name: 'Treino C - Pernas Completas & Panturrilhas (Legs)',
        dayOfWeekLabel: 'Dia 3',
        targetMuscleGroups: ['Quadríceps', 'Posterior', 'Panturrilhas'],
        estimatedMinutes: answers.minutesPerSession,
        exercises: [
          {
            id: 'ex-3-1',
            name: 'Leg Press 45°',
            muscleGroup: 'Quadríceps',
            equipment: 'Máquina',
            notes: 'Pés na largura dos ombros, desça com amplitude segura.',
            targetSets: [
              { setNumber: 1, targetReps: '12-15', suggestedWeightKg: 80, restSeconds: 60 },
              { setNumber: 2, targetReps: '10-12', suggestedWeightKg: 100, restSeconds: 90 },
              { setNumber: 3, targetReps: '10-12', suggestedWeightKg: 120, restSeconds: 90 },
            ],
          },
          {
            id: 'ex-3-2',
            name: 'Mesa Flexora',
            muscleGroup: 'Posterior de Coxa',
            equipment: 'Máquina',
            notes: 'Segure 1 segundo no pico de contração.',
            targetSets: [
              { setNumber: 1, targetReps: '12-15', suggestedWeightKg: 30, restSeconds: 45 },
              { setNumber: 2, targetReps: '10-12', suggestedWeightKg: 35, restSeconds: 60 },
              { setNumber: 3, targetReps: '10-12', suggestedWeightKg: 40, restSeconds: 60 },
            ],
          },
          {
            id: 'ex-3-3',
            name: 'Gêmeos em Pé (Panturrilhas)',
            muscleGroup: 'Panturrilhas',
            equipment: 'Máquina / Degrau',
            notes: 'Alongamento máximo na descida e contração forte no topo.',
            targetSets: [
              { setNumber: 1, targetReps: '15-20', suggestedWeightKg: 40, restSeconds: 45 },
              { setNumber: 2, targetReps: '15-20', suggestedWeightKg: 50, restSeconds: 45 },
              { setNumber: 3, targetReps: '15-20', suggestedWeightKg: 55, restSeconds: 45 },
            ],
          },
        ],
      });
    }
  } else {
    // 4 to 6 days: Upper / Lower or Push Pull Legs Upper Lower
    days.push(
      {
        id: 'day-1',
        name: 'Treino A - Peito, Ombros e Tríceps (Push)',
        dayOfWeekLabel: 'Dia 1',
        targetMuscleGroups: ['Peitoral', 'Ombros', 'Tríceps'],
        estimatedMinutes: answers.minutesPerSession,
        exercises: [
          {
            id: 'ex-1-1',
            name: 'Supino Reto com Halteres',
            muscleGroup: 'Peitoral',
            equipment: 'Halteres',
            notes: 'Controle a descida e mantenha escápulas travadas.',
            targetSets: [
              { setNumber: 1, targetReps: '10-12', suggestedWeightKg: 16, restSeconds: 60 },
              { setNumber: 2, targetReps: '8-10', suggestedWeightKg: 18, restSeconds: 60 },
              { setNumber: 3, targetReps: '6-8', suggestedWeightKg: 20, restSeconds: 90 },
            ],
          },
          {
            id: 'ex-1-2',
            name: 'Crucifixo Inclinado com Halteres',
            muscleGroup: 'Peitoral Superior',
            equipment: 'Banco 30° + Halteres',
            notes: 'Foco no alongamento da porção clavicular.',
            targetSets: [
              { setNumber: 1, targetReps: '12-15', suggestedWeightKg: 10, restSeconds: 60 },
              { setNumber: 2, targetReps: '10-12', suggestedWeightKg: 12, restSeconds: 60 },
              { setNumber: 3, targetReps: '10-12', suggestedWeightKg: 12, restSeconds: 60 },
            ],
          },
          {
            id: 'ex-1-3',
            name: 'Elevação Lateral com Halteres',
            muscleGroup: 'Ombros (Deltoide Lateral)',
            equipment: 'Halteres',
            notes: 'Cotovelos levemente flexionados, eleve até a linha dos ombros.',
            targetSets: [
              { setNumber: 1, targetReps: '12-15', suggestedWeightKg: 8, restSeconds: 45 },
              { setNumber: 2, targetReps: '12-15', suggestedWeightKg: 8, restSeconds: 45 },
              { setNumber: 3, targetReps: '10-12', suggestedWeightKg: 10, restSeconds: 60 },
            ],
          },
          {
            id: 'ex-1-4',
            name: 'Tríceps Testa com Halteres',
            muscleGroup: 'Tríceps',
            equipment: 'Halteres',
            notes: 'Cotovelos apontados para o teto sem abrir para os lados.',
            targetSets: [
              { setNumber: 1, targetReps: '10-12', suggestedWeightKg: 10, restSeconds: 60 },
              { setNumber: 2, targetReps: '10-12', suggestedWeightKg: 12, restSeconds: 60 },
              { setNumber: 3, targetReps: '8-10', suggestedWeightKg: 12, restSeconds: 60 },
            ],
          },
        ],
      },
      {
        id: 'day-2',
        name: 'Treino B - Costas, Bíceps e Trapézio (Pull)',
        dayOfWeekLabel: 'Dia 2',
        targetMuscleGroups: ['Costas', 'Bíceps', 'Trapézio'],
        estimatedMinutes: answers.minutesPerSession,
        exercises: [
          {
            id: 'ex-2-1',
            name: 'Puxada Alta Pronada',
            muscleGroup: 'Costas',
            equipment: 'Polia',
            notes: 'Puxe com força no grande dorsal, sem jogar o corpo para trás.',
            targetSets: [
              { setNumber: 1, targetReps: '10-12', suggestedWeightKg: 40, restSeconds: 60 },
              { setNumber: 2, targetReps: '8-10', suggestedWeightKg: 45, restSeconds: 60 },
              { setNumber: 3, targetReps: '8-10', suggestedWeightKg: 50, restSeconds: 90 },
            ],
          },
          {
            id: 'ex-2-2',
            name: 'Remada Baixa no Triângulo',
            muscleGroup: 'Costas',
            equipment: 'Cabo',
            notes: 'Puxe até o abdômen e abra o peito no pico.',
            targetSets: [
              { setNumber: 1, targetReps: '10-12', suggestedWeightKg: 35, restSeconds: 60 },
              { setNumber: 2, targetReps: '10-12', suggestedWeightKg: 40, restSeconds: 60 },
              { setNumber: 3, targetReps: '8-10', suggestedWeightKg: 45, restSeconds: 60 },
            ],
          },
          {
            id: 'ex-2-3',
            name: 'Rosca Martelo com Halteres',
            muscleGroup: 'Bíceps e Braquial',
            equipment: 'Halteres',
            notes: 'Pegada neutra para fortalecer antebraço e braquial.',
            targetSets: [
              { setNumber: 1, targetReps: '10-12', suggestedWeightKg: 10, restSeconds: 45 },
              { setNumber: 2, targetReps: '10-12', suggestedWeightKg: 12, restSeconds: 45 },
              { setNumber: 3, targetReps: '8-10', suggestedWeightKg: 14, restSeconds: 60 },
            ],
          },
        ],
      },
      {
        id: 'day-3',
        name: 'Treino C - Quadríceps, Posterior & Panturrilhas (Legs)',
        dayOfWeekLabel: 'Dia 3',
        targetMuscleGroups: ['Quadríceps', 'Posteriores', 'Panturrilhas'],
        estimatedMinutes: answers.minutesPerSession,
        exercises: [
          {
            id: 'ex-3-1',
            name: 'Agachamento Globet / Livre',
            muscleGroup: 'Pernas Completas',
            equipment: 'Halter ou Barra',
            notes: 'Mantenha o peito aberto e desça na profundidade máxima confortável.',
            targetSets: [
              { setNumber: 1, targetReps: '10-12', suggestedWeightKg: 20, restSeconds: 90 },
              { setNumber: 2, targetReps: '10-12', suggestedWeightKg: 24, restSeconds: 90 },
              { setNumber: 3, targetReps: '8-10', suggestedWeightKg: 28, restSeconds: 90 },
            ],
          },
          {
            id: 'ex-3-2',
            name: 'Cadeira Extensora',
            muscleGroup: 'Quadríceps',
            equipment: 'Máquina',
            notes: 'Pico de contração de 1s no topo.',
            targetSets: [
              { setNumber: 1, targetReps: '12-15', suggestedWeightKg: 35, restSeconds: 60 },
              { setNumber: 2, targetReps: '12-15', suggestedWeightKg: 40, restSeconds: 60 },
              { setNumber: 3, targetReps: '10-12', suggestedWeightKg: 45, restSeconds: 60 },
            ],
          },
          {
            id: 'ex-3-3',
            name: 'Stiff com Halteres',
            muscleGroup: 'Posterior & Glúteos',
            equipment: 'Halteres',
            notes: 'Quadril para trás e coluna perfeitamente alinhada.',
            targetSets: [
              { setNumber: 1, targetReps: '10-12', suggestedWeightKg: 14, restSeconds: 60 },
              { setNumber: 2, targetReps: '10-12', suggestedWeightKg: 16, restSeconds: 60 },
              { setNumber: 3, targetReps: '8-10', suggestedWeightKg: 18, restSeconds: 60 },
            ],
          },
        ],
      },
      {
        id: 'day-4',
        name: 'Treino D - Superior Geral & Core (Upper Focus)',
        dayOfWeekLabel: 'Dia 4',
        targetMuscleGroups: ['Superiores', 'Abdômen'],
        estimatedMinutes: answers.minutesPerSession,
        exercises: [
          {
            id: 'ex-4-1',
            name: 'Desenvolvimento com Halteres',
            muscleGroup: 'Ombros',
            equipment: 'Halteres',
            notes: 'Movimento vertical controlado.',
            targetSets: [
              { setNumber: 1, targetReps: '10-12', suggestedWeightKg: 12, restSeconds: 60 },
              { setNumber: 2, targetReps: '10-12', suggestedWeightKg: 14, restSeconds: 60 },
              { setNumber: 3, targetReps: '8-10', suggestedWeightKg: 16, restSeconds: 60 },
            ],
          },
          {
            id: 'ex-4-2',
            name: 'Prancha Abdominal Isométrica',
            muscleGroup: 'Core / Abdômen',
            equipment: 'Colchonete',
            notes: 'Mantenha o glúteo e abdômen bem contraídos por 45 segundos.',
            targetSets: [
              { setNumber: 1, targetReps: '45 seg', suggestedWeightKg: 0, restSeconds: 45 },
              { setNumber: 2, targetReps: '45 seg', suggestedWeightKg: 0, restSeconds: 45 },
              { setNumber: 3, targetReps: '45 seg', suggestedWeightKg: 0, restSeconds: 45 },
            ],
          },
        ],
      }
    );
  }

  return {
    id: `plan-${Date.now()}`,
    title: 'Plano Personalizado Gym-Up',
    description: 'Divisão de treino estruturada de acordo com seus objetivos e disponibilidade.',
    createdAt: new Date().toISOString(),
    answers,
    days: days.slice(0, daysCount),
  };
}

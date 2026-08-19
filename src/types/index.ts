export type GoalType = 'hypertrophy' | 'strength' | 'fat_loss' | 'conditioning' | 'general';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type EquipmentType = 'full_gym' | 'dumbbells_only' | 'home_minimal' | 'bodyweight';

export interface QuizAnswers {
  goal: GoalType;
  daysPerWeek: number; // 1 to 7
  minutesPerSession: number; // e.g. 30, 45, 60, 90
  experience: ExperienceLevel;
  equipment: EquipmentType;
  focusMuscles: string[]; // e.g. ['Peito', 'Costas', 'Pernas']
  limitations: string; // e.g. 'Dor no ombro direito' ou 'Nenhuma'
  notes?: string;
}

export interface TargetSet {
  setNumber: number;
  targetReps: string; // e.g. "8-12", "15", "Falha"
  suggestedWeightKg?: number;
  restSeconds: number; // e.g. 60, 90
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string; // e.g. "Peitoral", "Costas", "Quadríceps"
  equipment: string; // e.g. "Halteres", "Barra", "Máquina", "Cabo"
  targetSets: TargetSet[];
  notes?: string;
}

export interface WorkoutDay {
  id: string; // e.g. "day-a", "day-b"
  name: string; // e.g. "Treino A - Peito, Ombro e Tríceps (Push)"
  dayOfWeekLabel?: string; // e.g. "Segunda-feira"
  targetMuscleGroups: string[];
  estimatedMinutes: number;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  answers: QuizAnswers;
  days: WorkoutDay[];
}

export interface CompletedSet {
  setNumber: number;
  reps: number;
  weightKg: number;
  completedAt: string;
}

export interface CompletedExerciseLog {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  sets: CompletedSet[];
}

export interface WorkoutSessionLog {
  id: string;
  planId: string;
  dayId: string;
  dayName: string;
  startedAt: string;
  completedAt: string;
  durationMinutes: number;
  totalSetsCompleted: number;
  totalVolumeKg: number; // sum of (reps * weightKg)
  xpEarned: number;
  exercises: CompletedExerciseLog[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Icon name (lucide/vector)
  xpReward: number;
  unlockedAt?: string; // ISO date string if unlocked
  category: 'milestone' | 'streak' | 'volume' | 'mastery';
  progress?: number; // 0 to 1
  maxProgress?: number;
}

export interface UserStats {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  currentStreakDays: number;
  longestStreakDays: number;
  lastWorkoutDate?: string; // YYYY-MM-DD
  totalWorkoutsCompleted: number;
  totalSetsCompleted: number;
  totalVolumeKg: number;
  unlockedAchievementIds: string[];
}

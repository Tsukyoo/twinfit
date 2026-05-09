// Profile types
export type ProfileId = 'teoman' | 'denizhan';

export type WorkoutDay = 'monday' | 'wednesday' | 'friday' | 'saturday';

export type ExerciseCategory =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'legs'
  | 'core'
  | 'cardio'
  | 'full_body';

export type WorkoutStatus = 'active' | 'completed' | 'cancelled';

// Profile
export interface Profile {
  id: ProfileId;
  name: string;
  age: number;
  heightCm: number;
  initialWeightKg: number;
  goalWeightKg: number;
  goal: string;
  color: string;
  nutritionTargets: NutritionTargets;
  trainingDays: WorkoutDay[];
  createdAt: string;
  updatedAt: string;
}

// Nutrition
export interface NutritionTargets {
  calories: number;
  proteinG: number;
  carbsG?: number;
  fatG?: number;
  waterMl: number;
}

// Exercise
export interface Exercise {
  id: string;
  name: string;
  machineName: string;
  category: ExerciseCategory;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  imageUrl?: string;
  videoUrl?: string;
  localVideoPath?: string;
  instructions: string[];
  commonMistakes: string[];
  progressionTip: string;
  alternatives: string[];
}

// Workout Plan
export interface WorkoutPlan {
  id: string;
  profileId: ProfileId;
  day: WorkoutDay;
  name: string;
  exercises: WorkoutPlanExercise[];
}

export type TrackingType = 'reps' | 'minutes' | 'seconds';

export interface WorkoutPlanExercise {
  exerciseId: string;
  order: number;
  targetSets: number;
  minReps: number;
  maxReps: number;
  restSeconds: number;
  trackingType?: TrackingType;
  notes?: string;
}

// Workout Session (user data - stored in IndexedDB)
export interface WorkoutSession {
  id: string;
  profileId: ProfileId;
  workoutPlanId: string;
  name: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  status: WorkoutStatus;
  notes?: string;
  totalVolumeKg?: number;
  totalSets?: number;
  pointsEarned?: number;
}

// Set Log (user data - stored in IndexedDB)
export interface SetLog {
  id: string;
  sessionId: string;
  profileId: ProfileId;
  exerciseId: string;
  workoutPlanId: string;
  setIndex: number;
  weightKg: number;
  reps: number;
  rpe?: number;
  notes?: string;
  pain?: boolean;
  createdAt: string;
}

// Nutrition Log (user data - stored in IndexedDB)
export interface NutritionLog {
  id: string;
  profileId: ProfileId;
  date: string;
  calories: number;
  proteinG: number;
  carbsG?: number;
  fatG?: number;
  waterMl: number;
  planRespected: boolean;
  hungerLevel?: number;
  energyLevel?: number;
  sleepHours?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Body Log (user data - stored in IndexedDB)
export interface BodyLog {
  id: string;
  profileId: ProfileId;
  date: string;
  weightKg: number;
  waistCm?: number;
  notes?: string;
  createdAt: string;
}

// Weekly Checkin (user data - stored in IndexedDB)
export interface WeeklyCheckin {
  id: string;
  profileId: ProfileId;
  weekStartDate: string;
  weekEndDate: string;
  averageWeightKg?: number;
  waistCm?: number;
  workoutsCompleted: number;
  averageCalories?: number;
  averageProteinG?: number;
  averageSleepHours?: number;
  averageEnergy?: number;
  verdict: string;
  recommendation: string;
  pointsEarned: number;
  createdAt: string;
}

// Leaderboard Score (user data - stored in IndexedDB)
export interface LeaderboardScore {
  id: string;
  profileId: ProfileId;
  weekStartDate: string;
  weeklyPoints: number;
  totalPoints: number;
  workoutStreak: number;
  nutritionStreak: number;
  badges: string[];
  updatedAt: string;
}

// Navigation types
export type TabId = 'dashboard' | 'planning' | 'nutrition' | 'progress' | 'leaderboard';

export interface NavItem {
  id: TabId;
  label: string;
  icon: string;
  path: string;
}

// Settings
export interface AppSettings {
  selectedProfileId?: ProfileId;
  theme: 'light';
  restTimerSound: boolean;
  reducedMotion: boolean;
  units: 'metric';
}

// Export/Import
export interface ExportData {
  version: number;
  exportedAt: string;
  profiles: Profile[];
  workoutSessions: WorkoutSession[];
  setLogs: SetLog[];
  nutritionLogs: NutritionLog[];
  bodyLogs: BodyLog[];
  weeklyCheckins: WeeklyCheckin[];
  leaderboardScores: LeaderboardScore[];
  settings: AppSettings;
}

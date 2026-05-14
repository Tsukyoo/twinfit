import type { WorkoutPlan, WorkoutPlanExercise, BonusWorkoutType, ProfileId } from '../types';

export interface BonusWorkoutTemplate {
  id: string;
  name: string;
  description: string;
  intensity: 'light' | 'moderate' | 'intense';
  estimatedDurationMinutes: number;
  type: BonusWorkoutType;
  exercises: Omit<WorkoutPlanExercise, 'order'>[];
}

// ============================================
// BONUS WORKOUT TEMPLATES
// ============================================

export const BONUS_WORKOUT_TEMPLATES: BonusWorkoutTemplate[] = [
  {
    id: 'upper-light',
    name: 'Haut du corps léger',
    description: 'Séance de maintien pour le haut du corps, volume réduit.',
    intensity: 'light',
    estimatedDurationMinutes: 30,
    type: 'rest_day',
    exercises: [
      { exerciseId: 'lat-pulldown-neutral', targetSets: 2, minReps: 10, maxReps: 12, restSeconds: 60 },
      { exerciseId: 'db-incline-press', targetSets: 2, minReps: 10, maxReps: 12, restSeconds: 60 },
      { exerciseId: 'lateral-raises-db', targetSets: 2, minReps: 12, maxReps: 15, restSeconds: 45 },
      { exerciseId: 'curl-incline-db', targetSets: 2, minReps: 10, maxReps: 12, restSeconds: 45 },
      { exerciseId: 'triceps-rope', targetSets: 2, minReps: 12, maxReps: 15, restSeconds: 45 },
    ],
  },
  {
    id: 'arms-shoulders',
    name: 'Bras + Épaules',
    description: 'Focus bras et épaules, séance courte et ciblée.',
    intensity: 'moderate',
    estimatedDurationMinutes: 35,
    type: 'extra_volume',
    exercises: [
      { exerciseId: 'lateral-raises-cable', targetSets: 3, minReps: 12, maxReps: 15, restSeconds: 45 },
      { exerciseId: 'reverse-pec-deck', targetSets: 2, minReps: 12, maxReps: 15, restSeconds: 45 },
      { exerciseId: 'curl-hammer-db', targetSets: 3, minReps: 10, maxReps: 12, restSeconds: 45 },
      { exerciseId: 'ez-bar-curl', targetSets: 2, minReps: 10, maxReps: 12, restSeconds: 45 },
      { exerciseId: 'triceps-overhead-rope', targetSets: 3, minReps: 12, maxReps: 15, restSeconds: 45 },
      { exerciseId: 'triceps-rope', targetSets: 2, minReps: 12, maxReps: 15, restSeconds: 45 },
    ],
  },
  {
    id: 'back-cardio',
    name: 'Dos + Cardio',
    description: 'Dos léger suivi d\'un peu de cardio.',
    intensity: 'moderate',
    estimatedDurationMinutes: 40,
    type: 'cardio',
    exercises: [
      { exerciseId: 'lat-pulldown-neutral', targetSets: 3, minReps: 10, maxReps: 12, restSeconds: 75 },
      { exerciseId: 'seated-cable-row', targetSets: 3, minReps: 10, maxReps: 12, restSeconds: 75 },
      { exerciseId: 'chest-supported-row', targetSets: 2, minReps: 10, maxReps: 12, restSeconds: 60 },
      { exerciseId: 'face-pull', targetSets: 3, minReps: 15, maxReps: 20, restSeconds: 45 },
      { exerciseId: 'treadmill-incline', targetSets: 1, minReps: 15, maxReps: 20, restSeconds: 0, trackingType: 'minutes' },
    ],
  },
  {
    id: 'legs-light',
    name: 'Jambes léger',
    description: 'Séance jambes allégée, sans squat lourd.',
    intensity: 'light',
    estimatedDurationMinutes: 35,
    type: 'rest_day',
    exercises: [
      { exerciseId: 'leg-press', targetSets: 3, minReps: 12, maxReps: 15, restSeconds: 90 },
      { exerciseId: 'leg-curl', targetSets: 3, minReps: 12, maxReps: 15, restSeconds: 60 },
      { exerciseId: 'leg-extension', targetSets: 3, minReps: 15, maxReps: 20, restSeconds: 60 },
      { exerciseId: 'calf-press', targetSets: 4, minReps: 15, maxReps: 20, restSeconds: 45 },
      { exerciseId: 'plank', targetSets: 2, minReps: 30, maxReps: 45, restSeconds: 45, trackingType: 'seconds' },
    ],
  },
  {
    id: 'cardio-abs',
    name: 'Cardio + Abdos',
    description: 'Séance cardio légère et abdominaux.',
    intensity: 'light',
    estimatedDurationMinutes: 25,
    type: 'cardio',
    exercises: [
      { exerciseId: 'treadmill-incline', targetSets: 1, minReps: 20, maxReps: 30, restSeconds: 0, trackingType: 'minutes' },
      { exerciseId: 'crunch-cable', targetSets: 3, minReps: 15, maxReps: 20, restSeconds: 45 },
      { exerciseId: 'hanging-knee-raise', targetSets: 3, minReps: 10, maxReps: 15, restSeconds: 45 },
      { exerciseId: 'plank', targetSets: 3, minReps: 30, maxReps: 60, restSeconds: 45, trackingType: 'seconds' },
    ],
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getBonusWorkoutTemplateById(id: string): BonusWorkoutTemplate | undefined {
  return BONUS_WORKOUT_TEMPLATES.find(t => t.id === id);
}

export function getAllBonusWorkoutTemplates(): BonusWorkoutTemplate[] {
  return BONUS_WORKOUT_TEMPLATES;
}

export function getBonusWorkoutTemplatesByIntensity(intensity: 'light' | 'moderate' | 'intense'): BonusWorkoutTemplate[] {
  return BONUS_WORKOUT_TEMPLATES.filter(t => t.intensity === intensity);
}

/**
 * Get a bonus workout plan by its fixed ID.
 * Returns undefined if not found.
 */
export function getBonusWorkoutPlanById(id: string): WorkoutPlan | undefined {
  const template = BONUS_WORKOUT_TEMPLATES.find(t => t.id === id || `bonus-${t.id}` === id);
  if (!template) return undefined;
  
  return {
    id: `bonus-${template.id}`,
    profileId: 'teoman', // Default, will be overridden by caller
    day: 'monday', // Default, doesn't matter for bonus
    name: `Bonus: ${template.name}`,
    exercises: template.exercises.map((ex, idx) => ({
      ...ex,
      order: idx + 1,
    })),
  };
}

/**
 * Get all bonus workout plans as WorkoutPlan objects with fixed IDs.
 */
export function getAllBonusWorkoutPlans(): WorkoutPlan[] {
  return BONUS_WORKOUT_TEMPLATES.map(template => ({
    id: `bonus-${template.id}`,
    profileId: 'teoman', // Default, will be overridden by caller
    day: 'monday',
    name: `Bonus: ${template.name}`,
    exercises: template.exercises.map((ex, idx) => ({
      ...ex,
      order: idx + 1,
    })),
  }));
}

/**
 * Creates a WorkoutPlan from a bonus template for a specific profile.
 * This creates a temporary plan that can be used for the workout session.
 * ID is now FIXED: bonus-{template.id} (no timestamp)
 */
export function createBonusWorkoutPlan(
  template: BonusWorkoutTemplate,
  profileId: ProfileId,
  _sourcePlanId?: string,
): WorkoutPlan {
  return {
    id: `bonus-${template.id}`,
    profileId,
    day: 'monday', // Default, doesn't matter for bonus
    name: `Bonus: ${template.name}`,
    exercises: template.exercises.map((ex, idx) => ({
      ...ex,
      order: idx + 1,
    })),
  };
}

/**
 * Check if a session qualifies for bonus points (limits: 1/day, 2/week)
 */
export function qualifiesForBonusPoints(
  sessions: { isBonusWorkout?: boolean; endedAt?: string; pointsEarned?: number; status?: 'active' | 'completed' | 'cancelled' }[],
  targetDate: string,
): { qualifies: boolean; reason?: string } {
  // Filter completed bonus sessions
  const bonusSessions = sessions.filter(
    s => s.isBonusWorkout && s.endedAt && s.status === 'completed'
  );

  // Check if already did a bonus today
  const bonusesToday = bonusSessions.filter(s => s.endedAt?.startsWith(targetDate));
  if (bonusesToday.length > 0) {
    return { qualifies: false, reason: 'Déjà une séance bonus comptabilisée aujourd\'hui' };
  }

  // Check weekly limit (2 per week)
  const weekStart = getWeekStart(targetDate);
  const weekEnd = getWeekEnd(targetDate);
  const bonusesThisWeek = bonusSessions.filter(
    s => s.endedAt && s.endedAt >= weekStart && s.endedAt <= weekEnd
  );
  if (bonusesThisWeek.length >= 2) {
    return { qualifies: false, reason: 'Limite de 2 séances bonus par semaine atteinte' };
  }

  return { qualifies: true };
}

// Helper functions
function getWeekStart(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday is first day
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().split('T')[0];
}

function getWeekEnd(dateStr: string): string {
  const start = new Date(getWeekStart(dateStr));
  const sunday = new Date(start);
  sunday.setDate(sunday.getDate() + 6);
  return sunday.toISOString().split('T')[0];
}

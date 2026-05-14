import type { WorkoutPlan, ProfileId } from '../types';
import { getDayOfWeek } from '../utils/dates';

// ========== TEOMAN PROGRAMMES ==========

const teomanUpperA: WorkoutPlan = {
  id: 'teoman-upper-a',
  profileId: 'teoman' as ProfileId,
  day: 'monday',
  name: 'Épaules | Pecs | Dos',
  exercises: [
    { exerciseId: 'db-incline-press', order: 1, targetSets: 4, minReps: 6, maxReps: 10, restSeconds: 120 },
    { exerciseId: 'lat-pulldown-neutral', order: 2, targetSets: 4, minReps: 8, maxReps: 12, restSeconds: 120 },
    { exerciseId: 'chest-supported-row', order: 3, targetSets: 3, minReps: 8, maxReps: 12, restSeconds: 90 },
    { exerciseId: 'shoulder-press-machine', order: 4, targetSets: 3, minReps: 8, maxReps: 10, restSeconds: 120 },
    { exerciseId: 'lateral-raises-db', order: 5, targetSets: 5, minReps: 12, maxReps: 25, restSeconds: 60 },
    { exerciseId: 'reverse-pec-deck', order: 6, targetSets: 3, minReps: 12, maxReps: 20, restSeconds: 60 },
    { exerciseId: 'curl-incline-db', order: 7, targetSets: 3, minReps: 10, maxReps: 15, restSeconds: 60 },
    { exerciseId: 'triceps-rope', order: 8, targetSets: 3, minReps: 10, maxReps: 15, restSeconds: 60 },
  ],
};

const teomanLowerA: WorkoutPlan = {
  id: 'teoman-lower-a',
  profileId: 'teoman' as ProfileId,
  day: 'wednesday',
  name: 'Jambes | Abdos',
  exercises: [
    { exerciseId: 'leg-press', order: 1, targetSets: 4, minReps: 8, maxReps: 12, restSeconds: 120 },
    { exerciseId: 'romanian-deadlift', order: 2, targetSets: 3, minReps: 8, maxReps: 10, restSeconds: 120 },
    { exerciseId: 'bulgarian-split-squat', order: 3, targetSets: 3, minReps: 8, maxReps: 12, restSeconds: 90, notes: '8-12 reps par jambe' },
    { exerciseId: 'leg-curl', order: 4, targetSets: 3, minReps: 10, maxReps: 15, restSeconds: 75 },
    { exerciseId: 'calf-press', order: 5, targetSets: 4, minReps: 12, maxReps: 20, restSeconds: 60 },
    { exerciseId: 'crunch-cable', order: 6, targetSets: 3, minReps: 12, maxReps: 20, restSeconds: 60 },
    { exerciseId: 'hanging-knee-raise', order: 7, targetSets: 3, minReps: 10, maxReps: 15, restSeconds: 60 },
    { exerciseId: 'treadmill-incline', order: 8, targetSets: 1, minReps: 15, maxReps: 20, restSeconds: 0, trackingType: 'minutes', notes: '15-20 minutes cardio tapis incliné' },
  ],
};

const teomanUpperB: WorkoutPlan = {
  id: 'teoman-upper-b',
  profileId: 'teoman' as ProfileId,
  day: 'friday',
  name: 'Dos | Bras | Épaules',
  exercises: [
    { exerciseId: 'assisted-pullup', order: 1, targetSets: 4, minReps: 8, maxReps: 12, restSeconds: 120 },
    { exerciseId: 'seated-cable-row', order: 2, targetSets: 4, minReps: 8, maxReps: 12, restSeconds: 120 },
    { exerciseId: 'incline-chest-press-machine', order: 3, targetSets: 3, minReps: 8, maxReps: 12, restSeconds: 90 },
    { exerciseId: 'cable-crossover-high', order: 4, targetSets: 3, minReps: 12, maxReps: 15, restSeconds: 60 },
    { exerciseId: 'lateral-raises-cable', order: 5, targetSets: 4, minReps: 12, maxReps: 20, restSeconds: 60 },
    { exerciseId: 'face-pull', order: 6, targetSets: 4, minReps: 15, maxReps: 20, restSeconds: 60 },
    { exerciseId: 'curl-hammer-db', order: 7, targetSets: 3, minReps: 10, maxReps: 15, restSeconds: 60 },
    { exerciseId: 'triceps-overhead-rope', order: 8, targetSets: 3, minReps: 10, maxReps: 15, restSeconds: 60 },
  ],
};

const teomanLowerB: WorkoutPlan = {
  id: 'teoman-lower-b',
  profileId: 'teoman' as ProfileId,
  day: 'saturday',
  name: 'Jambes | Bras | Épaules',
  exercises: [
    { exerciseId: 'hack-squat', order: 1, targetSets: 4, minReps: 8, maxReps: 12, restSeconds: 120 },
    { exerciseId: 'hip-thrust', order: 2, targetSets: 3, minReps: 8, maxReps: 12, restSeconds: 120 },
    { exerciseId: 'leg-extension', order: 3, targetSets: 3, minReps: 12, maxReps: 15, restSeconds: 60 },
    { exerciseId: 'leg-curl', order: 4, targetSets: 3, minReps: 12, maxReps: 15, restSeconds: 60 },
    { exerciseId: 'calf-press', order: 5, targetSets: 4, minReps: 15, maxReps: 20, restSeconds: 60, notes: 'Mollets machine ou presse' },
    { exerciseId: 'lateral-raises-db', order: 6, targetSets: 4, minReps: 15, maxReps: 25, restSeconds: 60 },
    { exerciseId: 'ez-bar-curl', order: 7, targetSets: 3, minReps: 8, maxReps: 12, restSeconds: 75 },
    { exerciseId: 'assisted-dip', order: 8, targetSets: 3, minReps: 8, maxReps: 12, restSeconds: 75 },
  ],
};

// ========== DENIZHAN PROGRAMMES ==========

const denizhanUpperA: WorkoutPlan = {
  id: 'denizhan-upper-a',
  profileId: 'denizhan' as ProfileId,
  day: 'monday',
  name: 'Pecs | Épaules | Dos',
  exercises: [
    { exerciseId: 'db-incline-press', order: 1, targetSets: 4, minReps: 6, maxReps: 10, restSeconds: 120 },
    { exerciseId: 'lat-pulldown-neutral', order: 2, targetSets: 4, minReps: 8, maxReps: 12, restSeconds: 120 },
    { exerciseId: 'shoulder-press-db', order: 3, targetSets: 3, minReps: 8, maxReps: 10, restSeconds: 120 },
    { exerciseId: 'seated-cable-row', order: 4, targetSets: 3, minReps: 8, maxReps: 12, restSeconds: 90 },
    { exerciseId: 'lateral-raises-db', order: 5, targetSets: 5, minReps: 12, maxReps: 25, restSeconds: 60 },
    { exerciseId: 'curl-incline-db', order: 6, targetSets: 3, minReps: 10, maxReps: 15, restSeconds: 60 },
    { exerciseId: 'triceps-rope', order: 7, targetSets: 3, minReps: 10, maxReps: 15, restSeconds: 60 },
  ],
};

const denizhanLowerA: WorkoutPlan = {
  id: 'denizhan-lower-a',
  profileId: 'denizhan' as ProfileId,
  day: 'wednesday',
  name: 'Jambes | Core',
  exercises: [
    { exerciseId: 'leg-press', order: 1, targetSets: 4, minReps: 8, maxReps: 12, restSeconds: 120 },
    { exerciseId: 'romanian-deadlift', order: 2, targetSets: 3, minReps: 8, maxReps: 10, restSeconds: 120 },
    { exerciseId: 'bulgarian-split-squat', order: 3, targetSets: 3, minReps: 8, maxReps: 12, restSeconds: 90, notes: '8-12 reps par jambe' },
    { exerciseId: 'leg-curl', order: 4, targetSets: 3, minReps: 10, maxReps: 15, restSeconds: 75 },
    { exerciseId: 'calf-press', order: 5, targetSets: 4, minReps: 12, maxReps: 20, restSeconds: 60 },
    { exerciseId: 'plank', order: 6, targetSets: 3, minReps: 45, maxReps: 60, restSeconds: 60, trackingType: 'seconds', notes: '45-60 secondes de gainage' },
  ],
};

const denizhanUpperB: WorkoutPlan = {
  id: 'denizhan-upper-b',
  profileId: 'denizhan' as ProfileId,
  day: 'friday',
  name: 'Dos | Bras | Épaules',
  exercises: [
    { exerciseId: 'assisted-pullup', order: 1, targetSets: 4, minReps: 8, maxReps: 12, restSeconds: 120 },
    { exerciseId: 'chest-supported-row', order: 2, targetSets: 4, minReps: 8, maxReps: 12, restSeconds: 120 },
    { exerciseId: 'incline-chest-press-machine', order: 3, targetSets: 3, minReps: 8, maxReps: 12, restSeconds: 90 },
    { exerciseId: 'cable-crossover-high', order: 4, targetSets: 3, minReps: 12, maxReps: 15, restSeconds: 60 },
    { exerciseId: 'lateral-raises-cable-uni', order: 5, targetSets: 5, minReps: 12, maxReps: 20, restSeconds: 60, notes: 'Unilatéral' },
    { exerciseId: 'reverse-pec-deck', order: 6, targetSets: 4, minReps: 12, maxReps: 20, restSeconds: 60 },
    { exerciseId: 'curl-hammer-db', order: 7, targetSets: 3, minReps: 10, maxReps: 15, restSeconds: 60 },
    { exerciseId: 'triceps-overhead-rope', order: 8, targetSets: 3, minReps: 10, maxReps: 15, restSeconds: 60 },
  ],
};

const denizhanLowerB: WorkoutPlan = {
  id: 'denizhan-lower-b',
  profileId: 'denizhan' as ProfileId,
  day: 'saturday',
  name: 'Jambes | Bras | Épaules',
  exercises: [
    { exerciseId: 'hack-squat', order: 1, targetSets: 4, minReps: 8, maxReps: 12, restSeconds: 120 },
    { exerciseId: 'hip-thrust', order: 2, targetSets: 3, minReps: 8, maxReps: 12, restSeconds: 120 },
    { exerciseId: 'leg-extension', order: 3, targetSets: 3, minReps: 12, maxReps: 15, restSeconds: 60 },
    { exerciseId: 'leg-curl', order: 4, targetSets: 3, minReps: 12, maxReps: 15, restSeconds: 60 },
    { exerciseId: 'calf-press', order: 5, targetSets: 4, minReps: 15, maxReps: 20, restSeconds: 60, notes: 'Mollets machine ou presse' },
    { exerciseId: 'lateral-raises-db', order: 6, targetSets: 4, minReps: 15, maxReps: 25, restSeconds: 60 },
    { exerciseId: 'ez-bar-curl', order: 7, targetSets: 3, minReps: 8, maxReps: 12, restSeconds: 75 },
    { exerciseId: 'assisted-dip', order: 8, targetSets: 3, minReps: 8, maxReps: 12, restSeconds: 75 },
  ],
};

// ========== EXPORTS ==========

export const workoutPlans: WorkoutPlan[] = [
  // Teoman
  teomanUpperA,
  teomanLowerA,
  teomanUpperB,
  teomanLowerB,
  // Denizhan
  denizhanUpperA,
  denizhanLowerA,
  denizhanUpperB,
  denizhanLowerB,
];

export function getWorkoutPlansByProfile(profileId: ProfileId): WorkoutPlan[] {
  return workoutPlans.filter((wp) => wp.profileId === profileId);
}

export function getWorkoutPlanById(id: string): WorkoutPlan | undefined {
  return workoutPlans.find((wp) => wp.id === id);
}

export function getWorkoutPlanForDay(profileId: ProfileId, day: string): WorkoutPlan | undefined {
  const dayMap: Record<string, string> = {
    '0': 'sunday',
    '1': 'monday',
    '2': 'tuesday',
    '3': 'wednesday',
    '4': 'thursday',
    '5': 'friday',
    '6': 'saturday',
  };
  
  const workoutDay = dayMap[day] || day.toLowerCase();
  return workoutPlans.find((wp) => wp.profileId === profileId && wp.day === workoutDay);
}

export function getTodaysWorkoutPlan(profileId: ProfileId): WorkoutPlan | undefined {
  const today = getDayOfWeek().toString();
  return getWorkoutPlanForDay(profileId, today);
}

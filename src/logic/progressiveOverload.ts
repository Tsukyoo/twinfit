/**
 * Progressive Overload Recommendation Engine
 * Provides automatic weight/duration recommendations based on completed workout history.
 * Works even without RPE - never blocks progression.
 */

import type { ProfileId, WorkoutSession, SetLog, WorkoutPlanExercise, Exercise } from '../types';
import { workoutSessionRepo, setLogRepo } from '../db/repositories';

// ============================================================
// TYPES
// ============================================================

export type RecommendationAction = 'increase' | 'maintain' | 'deload' | 'technique';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ExerciseRecommendation {
  action: RecommendationAction;
  currentWeightKg: number;
  recommendedWeightKg: number;
  incrementKg: number;
  reason: string;
  confidence: ConfidenceLevel;
  lastSessionDate?: string;
  lastPerformance: string; // e.g. "20kg · 12/12/11/10"
  targetReps?: string;     // e.g. "viser 12 reps sur toutes les séries"
  painDetected: boolean;
}

interface LastExerciseData {
  session: WorkoutSession;
  sets: SetLog[];
  planExercise: WorkoutPlanExercise;
}

// ============================================================
// MAIN RECOMMENDATION FUNCTION
// ============================================================

export async function getExerciseRecommendation(
  profileId: ProfileId,
  exerciseId: string,
  planExercise: WorkoutPlanExercise,
  exercise: Exercise
): Promise<ExerciseRecommendation | null> {
  // Get last completed session with this exercise
  const lastData = await getLastCompletedExerciseData(profileId, exerciseId);
  if (!lastData) {
    return null; // No history yet
  }

  const { session, sets } = lastData;

  // Filter out bonus sets for base progression decision
  const baseSets = sets.filter((s) => !('isBonus' in s && (s as { isBonus?: boolean }).isBonus));

  // Check for pain
  const painDetected = baseSets.some((s) => s.pain === true);
  if (painDetected) {
    return buildRecommendation({
      action: 'technique',
      currentWeightKg: getDominantWeight(baseSets),
      recommendedWeightKg: getDominantWeight(baseSets),
      incrementKg: 0,
      reason: 'Douleur détectée — privilégie la technique et la sécurité',
      confidence: 'high',
      lastSessionDate: session.endedAt?.split('T')[0],
      lastPerformance: formatPerformance(baseSets),
      targetReps: 'Corrige la douleur avant d\'augmenter',
      painDetected: true,
    });
  }

  // Get target sets/reps from plan
  const targetSets = planExercise.targetSets;
  const minReps = planExercise.minReps;
  const maxReps = planExercise.maxReps;

  // Check if all planned sets were completed
  if (baseSets.length < targetSets) {
    return buildRecommendation({
      action: 'maintain',
      currentWeightKg: getDominantWeight(baseSets),
      recommendedWeightKg: getDominantWeight(baseSets),
      incrementKg: 0,
      reason: 'Toutes les séries n\'ont pas été complétées',
      confidence: 'high',
      lastSessionDate: session.endedAt?.split('T')[0],
      lastPerformance: formatPerformance(baseSets),
      targetReps: `Complète les ${targetSets} séries prévues`,
      painDetected: false,
    });
  }

  // Check reps achievement
  const allAtMaxReps = baseSets.every((s) => s.reps >= maxReps);
  const allAtMinReps = baseSets.every((s) => s.reps >= minReps);
  const hasIncompleteReps = baseSets.some((s) => s.reps < maxReps);

  // Get RPE data
  const rpeValues = baseSets
    .filter((s) => s.rpe != null && s.rpe > 0)
    .map((s) => s.rpe!);
  const hasRPE = rpeValues.length > 0;
  const avgRPE = hasRPE ? rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length : null;
  const maxRPE = hasRPE ? Math.max(...rpeValues) : null;

  const dominantWeight = getDominantWeight(baseSets);

  // Decision logic
  if (allAtMaxReps) {
    // All reps at top of range - progression recommended
    if (hasRPE) {
      if (avgRPE! <= 8.5) {
        // Low RPE = confident increase
        const increment = getProgressionIncrement(exercise, dominantWeight);
        return buildRecommendation({
          action: 'increase',
          currentWeightKg: dominantWeight,
          recommendedWeightKg: dominantWeight + increment,
          incrementKg: increment,
          reason: `Toutes les reps validées, RPE maîtrisé (${avgRPE!.toFixed(1)})`,
          confidence: 'high',
          lastSessionDate: session.endedAt?.split('T')[0],
          lastPerformance: formatPerformance(baseSets),
          targetReps: `Maintenir ${maxReps} reps`,
          painDetected: false,
        });
      } else if (maxRPE! >= 9) {
        // High RPE = maintain to improve technique
        return buildRecommendation({
          action: 'technique',
          currentWeightKg: dominantWeight,
          recommendedWeightKg: dominantWeight,
          incrementKg: 0,
          reason: `Reps validées mais effort très élevé (RPE ${maxRPE}) — améliore la technique`,
          confidence: 'high',
          lastSessionDate: session.endedAt?.split('T')[0],
          lastPerformance: formatPerformance(baseSets),
          targetReps: `Rendre les ${maxReps} reps plus faciles`,
          painDetected: false,
        });
      }
    } else {
      // No RPE but all reps completed - recommend increase with medium confidence
      const increment = getProgressionIncrement(exercise, dominantWeight);
      return buildRecommendation({
        action: 'increase',
        currentWeightKg: dominantWeight,
        recommendedWeightKg: dominantWeight + increment,
        incrementKg: increment,
        reason: 'Toutes les reps ont été validées — monte légèrement la charge',
        confidence: 'medium',
        lastSessionDate: session.endedAt?.split('T')[0],
        lastPerformance: formatPerformance(baseSets),
        targetReps: `Maintenir ${maxReps} reps`,
        painDetected: false,
      });
    }
  } else if (allAtMinReps && !hasIncompleteReps) {
    // All sets at least at minimum, but not all at max
    return buildRecommendation({
      action: 'maintain',
      currentWeightKg: dominantWeight,
      recommendedWeightKg: dominantWeight,
      incrementKg: 0,
      reason: 'Objectif min atteint, monte progressivement vers le haut de fourchette',
      confidence: hasRPE ? 'high' : 'medium',
      lastSessionDate: session.endedAt?.split('T')[0],
      lastPerformance: formatPerformance(baseSets),
      targetReps: `Viser ${maxReps} reps sur toutes les séries`,
      painDetected: false,
    });
  } else {
    // Some sets below minimum
    return buildRecommendation({
      action: 'maintain',
      currentWeightKg: dominantWeight,
      recommendedWeightKg: dominantWeight,
      incrementKg: 0,
      reason: 'Certaines séries n\'ont pas atteint l\'objectif minimal',
      confidence: 'high',
      lastSessionDate: session.endedAt?.split('T')[0],
      lastPerformance: formatPerformance(baseSets),
      targetReps: `Complète ${minReps}-${maxReps} reps sur toutes les séries`,
      painDetected: false,
    });
  }

  // Fallback
  return buildRecommendation({
    action: 'maintain',
    currentWeightKg: dominantWeight,
    recommendedWeightKg: dominantWeight,
    incrementKg: 0,
    reason: 'Garde la charge actuelle',
    confidence: 'medium',
    lastSessionDate: session.endedAt?.split('T')[0],
    lastPerformance: formatPerformance(baseSets),
    targetReps: `Objectif : ${minReps}-${maxReps} reps`,
    painDetected: false,
  });
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

async function getLastCompletedExerciseData(
  profileId: ProfileId,
  exerciseId: string
): Promise<LastExerciseData | null> {
  // Get all completed sessions for this profile
  const sessions = await workoutSessionRepo.getByProfile(profileId);
  const completedSessions = sessions
    .filter((s) => s.status === 'completed' && s.endedAt)
    .sort((a, b) => new Date(b.endedAt!).getTime() - new Date(a.endedAt!).getTime());

  // Find most recent session with this exercise
  for (const session of completedSessions) {
    const allSets = await setLogRepo.getBySession(session.id);
    const exerciseSets = allSets.filter((s) => s.exerciseId === exerciseId);

    if (exerciseSets.length > 0) {
      return {
        session,
        sets: exerciseSets,
        planExercise: {} as WorkoutPlanExercise, // Will be provided by caller
      };
    }
  }

  return null;
}

function getDominantWeight(sets: SetLog[]): number {
  if (sets.length === 0) return 0;

  // Count occurrences of each weight
  const weightCounts = new Map<number, number>();
  for (const set of sets) {
    const w = Math.round(set.weightKg * 2) / 2; // Round to 0.5kg
    weightCounts.set(w, (weightCounts.get(w) || 0) + 1);
  }

  // Find most common weight
  let dominantWeight = sets[0].weightKg;
  let maxCount = 0;
  for (const [weight, count] of weightCounts) {
    if (count > maxCount) {
      maxCount = count;
      dominantWeight = weight;
    }
  }

  return dominantWeight;
}

function formatPerformance(sets: SetLog[]): string {
  if (sets.length === 0) return '-';

  const weight = getDominantWeight(sets);
  const reps = sets.map((s) => s.reps).join('/');
  return `${weight}kg · ${reps}`;
}

export function getProgressionIncrement(exercise: Exercise, currentWeightKg: number): number {
  const name = exercise.name.toLowerCase();
  const machine = exercise.machineName.toLowerCase();
  const category = exercise.category;

  // Cardio / duration-based
  if (category === 'cardio' || name.includes('tapis') || name.includes('treadmill')) {
    return 0; // Duration progression, not weight
  }

  // Core / plank
  if (name.includes('plank') || name.includes('gainage')) {
    return 0; // Time progression
  }

  // Assisted exercises (reduce assistance)
  if (name.includes('assis') || machine.includes('assis') || name.includes('assisted')) {
    return -5; // Reduce assistance by 5kg
  }

  // Dumbbells
  if (machine.includes('haltère') || machine.includes('db') || name.includes('haltère')) {
    return currentWeightKg >= 20 ? 2 : 1;
  }

  // Machines upper body
  if (category === 'chest' || category === 'back' || category === 'shoulders' || category === 'arms') {
    if (currentWeightKg >= 50) return 5;
    if (currentWeightKg >= 20) return 2.5;
    return 2;
  }

  // Leg press / hack squat
  if (name.includes('presse') || name.includes('hack') || name.includes('leg press')) {
    return currentWeightKg >= 100 ? 10 : 5;
  }

  // Other legs
  if (category === 'legs') {
    if (currentWeightKg >= 80) return 5;
    if (currentWeightKg >= 40) return 2.5;
    return 2;
  }

  // Isolation / small muscles
  if (name.includes('curl') || name.includes('extension') || name.includes('raise')) {
    return currentWeightKg >= 15 ? 2.5 : 1;
  }

  // Default
  return currentWeightKg >= 50 ? 5 : 2.5;
}

export function getDurationProgression(exercise: Exercise, currentDuration: number): number {
  const name = exercise.name.toLowerCase();

  // Plank / gainage
  if (name.includes('plank') || name.includes('gainage')) {
    return currentDuration >= 60 ? 10 : 5;
  }

  // Treadmill cardio
  if (name.includes('tapis') || name.includes('treadmill') || name.includes('cardio')) {
    return 2; // +2 minutes
  }

  return 0;
}

// ============================================================
// BUILDER
// ============================================================

interface RecoBuilder {
  action: RecommendationAction;
  currentWeightKg: number;
  recommendedWeightKg: number;
  incrementKg: number;
  reason: string;
  confidence: ConfidenceLevel;
  lastSessionDate?: string;
  lastPerformance: string;
  targetReps?: string;
  painDetected: boolean;
}

function buildRecommendation(builder: RecoBuilder): ExerciseRecommendation {
  return {
    action: builder.action,
    currentWeightKg: builder.currentWeightKg,
    recommendedWeightKg: builder.recommendedWeightKg,
    incrementKg: builder.incrementKg,
    reason: builder.reason,
    confidence: builder.confidence,
    lastSessionDate: builder.lastSessionDate,
    lastPerformance: builder.lastPerformance,
    targetReps: builder.targetReps,
    painDetected: builder.painDetected,
  };
}

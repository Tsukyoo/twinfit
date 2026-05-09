/**
 * Pure business logic for active workout sessions.
 * No React, no IndexedDB — called from hooks only.
 */

import type { WorkoutPlanExercise, SetLog, ProfileId } from '../types';

// ========== TIMER ==========

/**
 * Parse restSeconds from a WorkoutPlanExercise.
 * restSeconds is always a number in our schema (0 = no rest).
 * Returns { durationSeconds, displayLabel } — displayLabel shows the program text.
 */
export interface RestInfo {
  durationSeconds: number;
  displayLabel: string;
}

export function getRestInfo(planExercise: WorkoutPlanExercise): RestInfo {
  const s = planExercise.restSeconds;

  if (!s || s <= 0) {
    return { durationSeconds: 0, displayLabel: 'Pas de repos' };
  }

  // restSeconds is the canonical value; displayLabel mirrors the program exactly.
  // The PROGRAMMES.md lists: 120, 90, 75, 60 and notes like "45-60s".
  // Since restSeconds is already the high value of any range (from workoutPlans.ts),
  // we just format the display label from the stored integer.
  const label = formatRestLabel(s);
  return { durationSeconds: s, displayLabel: label };
}

function formatRestLabel(seconds: number): string {
  switch (seconds) {
    case 120: return '2 min';
    case 90:  return '1 min 30';
    case 75:  return '75s';
    case 60:  return '60s';
    default:  return `${seconds}s`;
  }
}

// ========== SCORING ==========

export const POINTS_PER_SET = 2;
export const POINTS_PR_BONUS = 5;

/**
 * Detect a PR for an exercise: new set is heavier × same-or-more reps
 * than any previous set log for this exercise+profile.
 */
export function detectPR(
  newSet: { weightKg: number; reps: number; exerciseId: string },
  previousLogs: SetLog[],
): boolean {
  if (newSet.weightKg <= 0) return false;
  const relevant = previousLogs.filter((l) => l.exerciseId === newSet.exerciseId);
  if (relevant.length === 0) return false;
  return relevant.some(
    (l) => newSet.weightKg > l.weightKg && newSet.reps >= l.reps,
  );
}

// ========== VOLUME ==========

export function computeVolume(setLogs: Array<{ weightKg: number; reps: number }>): number {
  return setLogs.reduce((acc, s) => acc + s.weightKg * s.reps, 0);
}

// ========== LAST WEIGHT for exercise ==========

/**
 * Return the most recent weight used for an exercise by this profile.
 */
export function getLastWeightForExercise(
  exerciseId: string,
  profileId: ProfileId,
  allSetLogs: SetLog[],
): number | null {
  const relevant = allSetLogs
    .filter((l) => l.exerciseId === exerciseId && l.profileId === profileId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return relevant.length > 0 ? relevant[0].weightKg : null;
}

// ========== SESSION DURATION ==========

export function computeDurationSeconds(startedAt: string): number {
  return Math.round((Date.now() - new Date(startedAt).getTime()) / 1000);
}


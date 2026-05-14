/**
 * useLastSetPerformance
 *
 * Given a list of historical SetLogs (already loaded, no IDB call here),
 * an exerciseId, and a boolean flag for bonus context, returns a map of
 * setIndex → last performance for that specific set position.
 *
 * Rules:
 * - Only logs from completed sessions (filtered upstream via allHistoricalLogs).
 * - Non-bonus sets are sourced from non-bonus logs only.
 * - Bonus sets fall back to last bonus log, then last normal log if none.
 * - Per-set matching uses SetLog.setIndex (0-based).
 */

import { useMemo } from 'react';
import type { SetLog, WorkoutSession } from '../types';

export interface SetPerformance {
  weightKg: number;
  reps: number;
  /** "35 kg × 12" or "45 sec" etc. */
  label: string;
}

/** Map from setIndex (0-based) → last performance */
export type LastSetPerformanceMap = Map<number, SetPerformance>;

/**
 * Pure function — exported so it can be tested independently.
 *
 * @param exerciseId       The exercise to look up
 * @param allLogs          All historical SetLogs already scoped to this profile
 *                         (must only include logs from completed sessions)
 * @param isBonus          Whether the current context is a bonus set
 */
export function computeLastSetPerformances(
  exerciseId: string,
  allLogs: SetLog[],
  isBonus: boolean,
): LastSetPerformanceMap {
  const result: LastSetPerformanceMap = new Map();

  // Filter to this exercise only
  const exerciseLogs = allLogs.filter((l) => l.exerciseId === exerciseId);
  if (exerciseLogs.length === 0) return result;

  // Separate bonus vs normal sets
  // SetLog doesn't have an explicit isBonus field — we infer from workoutPlanId
  // (bonus plans start with 'bonus-') and from the fact that bonus sets are
  // appended after planned sets (setIndex >= targetSets). We use workoutPlanId
  // as the primary signal: if the planId starts with 'bonus-' → it's a bonus log.
  const normalLogs = exerciseLogs.filter((l) => !l.workoutPlanId.startsWith('bonus-'));
  const bonusLogs  = exerciseLogs.filter((l) =>  l.workoutPlanId.startsWith('bonus-'));

  const sourceLogs = isBonus
    ? (bonusLogs.length > 0 ? bonusLogs : normalLogs)
    : normalLogs;

  if (sourceLogs.length === 0) return result;

  // Sort by createdAt descending so most-recent logs win
  const sorted = [...sourceLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // Group by setIndex — keep only the first (most recent) entry per setIndex
  const seen = new Set<number>();
  for (const log of sorted) {
    const idx = log.setIndex;
    if (seen.has(idx)) continue;
    seen.add(idx);
    result.set(idx, {
      weightKg: log.weightKg,
      reps: log.reps,
      label: log.weightKg > 0
        ? `${log.weightKg} kg × ${log.reps}`
        : `${log.reps} reps`,
    });
  }

  return result;
}

/**
 * React hook wrapper — re-computes only when exerciseId, allLogs, or isBonus changes.
 *
 * `allLogs` should be pre-filtered to completed sessions by the caller.
 * This hook does NOT query IndexedDB.
 */
export function useLastSetPerformance(
  exerciseId: string | null,
  allLogs: SetLog[],
  isBonus: boolean,
): LastSetPerformanceMap {
  return useMemo(() => {
    if (!exerciseId) return new Map();
    return computeLastSetPerformances(exerciseId, allLogs, isBonus);
  }, [exerciseId, allLogs, isBonus]);
}

/**
 * Filter a raw SetLog list to only those from completed sessions.
 * Pass the completedSessionIds set computed from your session list.
 */
export function filterLogsToCompletedSessions(
  allLogs: SetLog[],
  completedSessionIds: Set<string>,
): SetLog[] {
  return allLogs.filter((l) => completedSessionIds.has(l.sessionId));
}

/**
 * Build a Set<string> of completed session IDs from a list of sessions.
 */
export function buildCompletedSessionIds(sessions: WorkoutSession[]): Set<string> {
  return new Set(sessions.filter((s) => s.status === 'completed').map((s) => s.id));
}

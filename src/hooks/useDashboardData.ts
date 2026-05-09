import { useState, useEffect, useCallback } from 'react';
import type { WorkoutPlan, ProfileId } from '../types';
import { getTodaysWorkoutPlan, getWorkoutPlansByProfile } from '../data/workoutPlans';
import { getExerciseById } from '../data/exercises';
import { bodyLogRepo, leaderboardScoreRepo, workoutSessionRepo } from '../db/repositories';
import { seedInitialData } from '../db/seed';

export interface DashboardData {
  todaysPlan: WorkoutPlan | null;
  nextPlan: WorkoutPlan | null;
  todayExerciseCount: number;
  todayEstimatedMinutes: number;
  currentWeightKg: number | null;
  weeklyPoints: number;
  isRestDay: boolean;
  todayCompleted: boolean;
  isLoading: boolean;
  addWeightLog: (weightKg: number, waistCm?: number, notes?: string) => Promise<void>;
}

export function useDashboardData(profileId: ProfileId): DashboardData {
  const [todaysPlan, setTodaysPlan] = useState<WorkoutPlan | null>(null);
  const [nextPlan, setNextPlan] = useState<WorkoutPlan | null>(null);
  const [currentWeightKg, setCurrentWeightKg] = useState<number | null>(null);
  const [weeklyPoints, setWeeklyPoints] = useState(0);
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);

      // Ensure DB is seeded
      await seedInitialData();

      // Static data
      const today = getTodaysWorkoutPlan(profileId);
      const allPlans = getWorkoutPlansByProfile(profileId);
      const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayDayIndex = new Date().getDay(); // 0=sun

      // Check if today's workout was already completed (local date)
      const completedToday = today
        ? await hasCompletedWorkoutToday(profileId, today.id)
        : false;

      // Next plan logic:
      // - If today has a workout AND it is not yet completed → today IS the next plan
      // - Otherwise → find the next future training day
      const next = today && !completedToday
        ? today
        : findNextPlanAfterToday(allPlans, dayOrder, todayDayIndex);

      // DB queries
      const [latestBody, latestScore] = await Promise.all([
        bodyLogRepo.getLatest(profileId),
        leaderboardScoreRepo.getLatest(profileId),
      ]);

      if (!cancelled) {
        setTodaysPlan(today ?? null);
        setNextPlan(next);
        setTodayCompleted(completedToday);
        setCurrentWeightKg(latestBody?.weightKg ?? null);
        setWeeklyPoints(latestScore?.weeklyPoints ?? 0);
        setIsLoading(false);
      }
    }

    load().catch(console.error);
    return () => { cancelled = true; };
  }, [profileId]);

  const todayExerciseCount = todaysPlan?.exercises.length ?? 0;
  const todayEstimatedMinutes = estimateMinutes(todaysPlan);
  const isRestDay = todaysPlan === null;

  const addWeightLog = useCallback(async (weightKg: number, waistCm?: number, notes?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    const existing = await bodyLogRepo.getByProfile(profileId)
      .then((all) => all.find((l) => l.date === today));

    if (existing) {
      await bodyLogRepo.update({ ...existing, weightKg, waistCm, notes, createdAt: existing.createdAt });
    } else {
      await bodyLogRepo.create({ profileId, date: today, weightKg, waistCm, notes, createdAt: now });
    }
    // Refresh current weight after adding
    const latest = await bodyLogRepo.getLatest(profileId);
    setCurrentWeightKg(latest?.weightKg ?? null);
  }, [profileId]);

  return {
    todaysPlan,
    nextPlan,
    todayExerciseCount,
    todayEstimatedMinutes,
    currentWeightKg,
    weeklyPoints,
    isRestDay,
    todayCompleted,
    isLoading,
    addWeightLog,
  };
}

// ========== Helpers ==========

function estimateMinutes(plan: WorkoutPlan | null): number {
  if (!plan) return 0;
  let totalSeconds = 0;
  for (const ex of plan.exercises) {
    const exercise = getExerciseById(ex.exerciseId);
    // Cardio exercises have a flat duration
    if (exercise?.category === 'cardio') {
      totalSeconds += ex.maxReps * 60; // maxReps = minutes for cardio
    } else {
      // sets × (average set time 45s + rest)
      totalSeconds += ex.targetSets * (45 + ex.restSeconds);
    }
  }
  // Add 5min warmup
  return Math.round(totalSeconds / 60) + 5;
}

/**
 * Returns true if a completed WorkoutSession for this profile+plan exists
 * with endedAt on today's local date.
 */
async function hasCompletedWorkoutToday(
  profileId: ProfileId,
  planId: string,
): Promise<boolean> {
  const sessions = await workoutSessionRepo.getByProfile(profileId);
  const todayStr = new Date().toLocaleDateString('fr-FR'); // DD/MM/YYYY local
  return sessions.some(
    (s) =>
      s.workoutPlanId === planId &&
      s.status === 'completed' &&
      s.endedAt != null &&
      new Date(s.endedAt).toLocaleDateString('fr-FR') === todayStr,
  );
}

/**
 * Finds the next training day strictly after today (offset >= 1).
 * Used when today's workout is already completed or it's a rest day.
 */
function findNextPlanAfterToday(
  plans: WorkoutPlan[],
  dayOrder: string[],
  todayDayIndex: number,
): WorkoutPlan | null {
  if (plans.length === 0) return null;
  for (let offset = 1; offset <= 7; offset++) {
    const checkDayIndex = (todayDayIndex + offset) % 7;
    const checkDay = dayOrder[checkDayIndex];
    const found = plans.find((p) => p.day === checkDay);
    if (found) return found;
  }
  return null;
}

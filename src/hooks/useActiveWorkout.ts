/**
 * Central hook for the active workout session.
 * All IndexedDB interactions and business logic live here.
 * Components only call the returned action functions.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { WorkoutSession, SetLog, ProfileId, WorkoutPlan } from '../types';
import { workoutSessionRepo, setLogRepo } from '../db/repositories';
import { getWorkoutPlanById } from '../data/workoutPlans';
import { getExerciseById } from '../data/exercises';
import {
  getRestInfo,
  detectPR,
  computeVolume,
  computeDurationSeconds,
  getLastWeightForExercise,
  POINTS_PER_SET,
  POINTS_PR_BONUS,
  type RestInfo,
} from '../logic/workoutSession';

// ========== Types ==========

export interface ActiveSetInput {
  weightKg: number | null;
  reps: number | null;
  rpe: number | null;
  notes: string;
  pain: boolean;
  isBonus: boolean;
}

export type WorkoutPhase =
  | 'loading'         // fetching session from IDB
  | 'resume_prompt'   // existing active session found
  | 'active'          // normal training
  | 'rest'            // rest timer running
  | 'exercise_done'   // all sets of current exercise completed
  | 'completed'       // all exercises done
  | 'abandoned';      // user chose to abandon

export interface PREvent {
  exerciseId: string;
  exerciseName: string;
  weightKg: number;
  reps: number;
}

export interface WorkoutState {
  phase: WorkoutPhase;
  session: WorkoutSession | null;
  plan: WorkoutPlan | null;
  currentExerciseIndex: number;
  currentSetIndex: number;       // 0-based index among planned sets
  completedSets: SetLog[];       // sets done so far this session
  currentInput: ActiveSetInput;
  restInfo: RestInfo | null;
  restSecondsLeft: number;
  restPaused: boolean;
  prEvents: PREvent[];
  totalPoints: number;
  existingSession: WorkoutSession | null; // for resume_prompt
}

export interface ActiveWorkoutActions {
  startSession: (profileId: ProfileId, planId: string) => Promise<void>;
  resumeSession: () => void;
  abandonSession: () => Promise<void>;
  abandonAndRestart: (profileId: ProfileId, planId: string) => Promise<void>;
  updateInput: (patch: Partial<ActiveSetInput>) => void;
  validateSet: () => Promise<void>;
  skipRest: () => void;
  pauseRest: () => void;
  resumeRest: () => void;
  nextExercise: () => void;
  addBonusSet: () => void;
  finishSession: (sessionNotes?: string) => Promise<WorkoutSession>;
}

// ========== Hook ==========

const DEFAULT_INPUT: ActiveSetInput = {
  weightKg: null,
  reps: null,
  rpe: null,
  notes: '',
  pain: false,
  isBonus: false,
};

export function useActiveWorkout(profileId: ProfileId, planId: string) {
  const [state, setState] = useState<WorkoutState>({
    phase: 'loading',
    session: null,
    plan: null,
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    completedSets: [],
    currentInput: DEFAULT_INPUT,
    restInfo: null,
    restSecondsLeft: 0,
    restPaused: false,
    prEvents: [],
    totalPoints: 0,
    existingSession: null,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const allHistoricalLogs = useRef<SetLog[]>([]);

  // ── Clear timer helper ─────────────────────────────────────────────────
  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ── Start rest timer ───────────────────────────────────────────────────
  const startRestTimer = useCallback((restInfo: RestInfo) => {
    clearTimer();
    if (restInfo.durationSeconds <= 0) return;

    setState((s) => ({
      ...s,
      phase: 'rest',
      restInfo,
      restSecondsLeft: restInfo.durationSeconds,
      restPaused: false,
    }));

    timerRef.current = setInterval(() => {
      setState((s) => {
        if (s.restPaused) return s;
        const next = s.restSecondsLeft - 1;
        if (next <= 0) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return { ...s, phase: 'active', restSecondsLeft: 0, restInfo: null };
        }
        return { ...s, restSecondsLeft: next };
      });
    }, 1000);
  }, [clearTimer]);

  // ── Initial load ───────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function init() {
      const plan = getWorkoutPlanById(planId);
      if (!plan) {
        console.error(`Plan not found: ${planId}`);
        return;
      }

      // Load all historical set logs for pre-fill / PR detection
      const hist = await setLogRepo.getByProfile(profileId);
      allHistoricalLogs.current = hist;

      // Check for existing active session
      const existing = await workoutSessionRepo.getActiveByProfile(profileId);
      if (cancelled) return;

      if (existing && existing.workoutPlanId === planId) {
        // Offer to resume
        const doneSets = await setLogRepo.getBySession(existing.id);
        // Determine where we are
        const exIdx = computeCurrentExerciseIndex(plan, doneSets);
        const setIdx = computeCurrentSetIndex(plan, exIdx, doneSets);
        const lastInput = buildDefaultInput(plan, exIdx, setIdx, hist);

        setState((s) => ({
          ...s,
          phase: 'resume_prompt',
          plan,
          existingSession: existing,
          session: existing,
          currentExerciseIndex: exIdx,
          currentSetIndex: setIdx,
          completedSets: doneSets,
          currentInput: lastInput,
          totalPoints: doneSets.length * POINTS_PER_SET,
        }));
      } else if (existing && existing.workoutPlanId !== planId) {
        // Different plan active — offer to abandon it, then start new
        setState((s) => ({
          ...s,
          phase: 'resume_prompt',
          plan,
          existingSession: existing,
        }));
      } else {
        // No active session — auto-start
        await doStartSession(profileId, planId, plan, hist, setState);
      }
    }
    init().catch(console.error);
    return () => {
      cancelled = true;
      clearTimer();
    };
  }, [profileId, planId, clearTimer]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────
  useEffect(() => () => clearTimer(), [clearTimer]);

  // ── Actions ────────────────────────────────────────────────────────────

  const startSession = useCallback(async (pid: ProfileId, pId: string) => {
    const plan = getWorkoutPlanById(pId);
    if (!plan) return;
    await doStartSession(pid, pId, plan, allHistoricalLogs.current, setState);
  }, []);

  const resumeSession = useCallback(() => {
    setState((s) => ({ ...s, phase: 'active', existingSession: null }));
  }, []);

  const abandonSession = useCallback(async () => {
    clearTimer();
    const { session } = state;
    if (session) {
      await workoutSessionRepo.update({ ...session, status: 'cancelled' });
    }
    setState((s) => ({ ...s, phase: 'abandoned', session: null, existingSession: null }));
  }, [state, clearTimer]);

  const abandonAndRestart = useCallback(async (pid: ProfileId, pId: string) => {
    clearTimer();
    // Cancel existing session without triggering 'abandoned' navigation
    const currentSession = state.session ?? state.existingSession;
    if (currentSession) {
      await workoutSessionRepo.update({ ...currentSession, status: 'cancelled' });
    }
    const plan = getWorkoutPlanById(pId);
    if (!plan) return;
    // Reload historical logs
    const hist = await setLogRepo.getByProfile(pid);
    allHistoricalLogs.current = hist;
    // Start fresh — goes directly to 'active' without resume_prompt
    await doStartSession(pid, pId, plan, hist, setState);
  }, [state, clearTimer]);

  const updateInput = useCallback((patch: Partial<ActiveSetInput>) => {
    setState((s) => ({ ...s, currentInput: { ...s.currentInput, ...patch } }));
  }, []);

  const validateSet = useCallback(async () => {
    const { session, plan, currentExerciseIndex, currentSetIndex, currentInput, completedSets, totalPoints } = state;
    if (!session || !plan) return;
    if (currentInput.reps === null || currentInput.reps <= 0) return;

    const planEx = plan.exercises[currentExerciseIndex];
    const exercise = getExerciseById(planEx.exerciseId);
    const isBodyweight = exercise?.category === 'core' || exercise?.category === 'cardio';
    const weightKg = currentInput.weightKg ?? 0;

    // Guard: reject weight < 1 for non-bodyweight exercises
    if (!isBodyweight && weightKg < 1) return;

    const now = new Date().toISOString();

    // PR detection
    const isPR = detectPR(
      { weightKg, reps: currentInput.reps, exerciseId: planEx.exerciseId },
      allHistoricalLogs.current,
    );

    // Persist set log
    const setLog = await setLogRepo.create({
      sessionId: session.id,
      profileId: session.profileId,
      exerciseId: planEx.exerciseId,
      workoutPlanId: plan.id,
      setIndex: currentSetIndex,
      weightKg,
      reps: currentInput.reps,
      rpe: currentInput.rpe ?? undefined,
      notes: currentInput.notes || undefined,
      pain: currentInput.pain || undefined,
      createdAt: now,
    });

    const newSets = [...completedSets, setLog];
    // Update historical cache so next PR check works within same session
    allHistoricalLogs.current = [...allHistoricalLogs.current, setLog];

    const addedPoints = POINTS_PER_SET + (isPR ? POINTS_PR_BONUS : 0);
    const newPoints = totalPoints + addedPoints;

    // Auto-save session progress
    await workoutSessionRepo.update({
      ...session,
      totalSets: newSets.length,
      totalVolumeKg: computeVolume(newSets),
      pointsEarned: newPoints,
    });

    // Accumulate PR events first — used in all branches below
    let prEvents = [...state.prEvents];
    if (isPR) {
      const ex = getExerciseById(planEx.exerciseId);
      if (ex) prEvents = [...prEvents, { exerciseId: planEx.exerciseId, exerciseName: ex.name, weightKg, reps: currentInput.reps }];
    }

    // Determine next step
    const plannedSetsForExercise = planEx.targetSets;
    const isLastExercise = currentExerciseIndex >= plan.exercises.length - 1;

    // Bonus set: always terminates the exercise immediately — no new cycle, no timer
    if (currentInput.isBonus) {
      setState((s) => ({
        ...s,
        completedSets: newSets,
        totalPoints: newPoints,
        prEvents,
        phase: 'exercise_done',
        currentInput: DEFAULT_INPUT,
      }));
      return;
    }

    // Count non-bonus planned sets completed for this exercise slot
    const setsForThisExercise = newSets.filter(
      (s) => s.exerciseId === planEx.exerciseId && !isFromPreviousExerciseSlot(s, plan, currentExerciseIndex),
    );
    const nonBonusSets = setsForThisExercise.filter((_, i) => i < plannedSetsForExercise);

    const isLastSet = nonBonusSets.length >= plannedSetsForExercise;

    if (isLastSet && isLastExercise) {
      // No rest after last set of last exercise
      setState((s) => ({
        ...s,
        completedSets: newSets,
        totalPoints: newPoints,
        prEvents,
        phase: 'exercise_done',
        currentSetIndex: currentSetIndex + 1,
        currentInput: DEFAULT_INPUT,
      }));
      return;
    }

    if (isLastSet) {
      // Exercise done — no rest timer between exercises (user goes manually)
      setState((s) => ({
        ...s,
        completedSets: newSets,
        totalPoints: newPoints,
        prEvents,
        phase: 'exercise_done',
        currentSetIndex: currentSetIndex + 1,
        currentInput: DEFAULT_INPUT,
      }));
      return;
    }

    // More sets in current exercise → start rest timer
    const restInfo = getRestInfo(planEx);
    const nextSetIdx = currentSetIndex + 1;
    const nextInput = buildDefaultInput(plan, currentExerciseIndex, nextSetIdx, allHistoricalLogs.current);

    setState((s) => ({
      ...s,
      completedSets: newSets,
      totalPoints: newPoints,
      prEvents,
      currentSetIndex: nextSetIdx,
      currentInput: nextInput,
    }));

    if (restInfo.durationSeconds > 0) {
      startRestTimer(restInfo);
    }
  }, [state, startRestTimer]);

  const skipRest = useCallback(() => {
    clearTimer();
    setState((s) => ({ ...s, phase: 'active', restSecondsLeft: 0, restInfo: null }));
  }, [clearTimer]);

  const pauseRest = useCallback(() => {
    setState((s) => ({ ...s, restPaused: true }));
  }, []);

  const resumeRest = useCallback(() => {
    setState((s) => ({ ...s, restPaused: false }));
  }, []);

  const nextExercise = useCallback(() => {
    setState((s) => {
      if (!s.plan) return s;
      const nextIdx = s.currentExerciseIndex + 1;
      if (nextIdx >= s.plan.exercises.length) {
        return { ...s, phase: 'completed' };
      }
      const nextInput = buildDefaultInput(s.plan, nextIdx, 0, allHistoricalLogs.current);
      return {
        ...s,
        phase: 'active',
        currentExerciseIndex: nextIdx,
        currentSetIndex: 0,
        currentInput: nextInput,
      };
    });
  }, []);

  const addBonusSet = useCallback(() => {
    setState((s) => ({
      ...s,
      phase: 'active',
      currentInput: { ...DEFAULT_INPUT, isBonus: true },
    }));
  }, []);

  const finishSession = useCallback(async (sessionNotes?: string): Promise<WorkoutSession> => {
    clearTimer();
    const { session, completedSets, totalPoints } = state;
    if (!session) throw new Error('No active session');

    const duration = computeDurationSeconds(session.startedAt);
    const volume = computeVolume(completedSets);

    const finished: WorkoutSession = {
      ...session,
      status: 'completed',
      endedAt: new Date().toISOString(),
      durationSeconds: duration,
      totalVolumeKg: volume,
      totalSets: completedSets.length,
      pointsEarned: totalPoints,
      notes: sessionNotes,
    };
    await workoutSessionRepo.update(finished);
    setState((s) => ({ ...s, session: finished, phase: 'completed' }));
    return finished;
  }, [state, clearTimer]);

  const actions: ActiveWorkoutActions = {
    startSession,
    resumeSession,
    abandonSession,
    abandonAndRestart,
    updateInput,
    validateSet,
    skipRest,
    pauseRest,
    resumeRest,
    nextExercise,
    addBonusSet,
    finishSession,
  };

  return { state, actions };
}

// ========== Private helpers ==========

async function doStartSession(
  profileId: ProfileId,
  planId: string,
  plan: WorkoutPlan,
  hist: SetLog[],
  setState: React.Dispatch<React.SetStateAction<WorkoutState>>,
) {
  const now = new Date().toISOString();
  const session = await workoutSessionRepo.create({
    profileId,
    workoutPlanId: planId,
    name: plan.name,
    startedAt: now,
    status: 'active',
  });
  const firstInput = buildDefaultInput(plan, 0, 0, hist);
  setState((s) => ({
    ...s,
    phase: 'active',
    session,
    plan,
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    completedSets: [],
    currentInput: firstInput,
    prEvents: [],
    totalPoints: 0,
  }));
}

function buildDefaultInput(
  plan: WorkoutPlan,
  exIdx: number,
  _setIdx: number,
  hist: SetLog[],
): ActiveSetInput {
  const planEx = plan.exercises[exIdx];
  if (!planEx) return DEFAULT_INPUT;
  const lastWeight = getLastWeightForExercise(planEx.exerciseId, plan.profileId, hist);
  return {
    weightKg: lastWeight,
    reps: planEx.maxReps,          // prefill with target max reps
    rpe: null,
    notes: '',
    pain: false,
    isBonus: false,
  };
}

function computeCurrentExerciseIndex(plan: WorkoutPlan, doneSets: SetLog[]): number {
  if (doneSets.length === 0) return 0;
  // Walk exercises in order; if all planned sets done, advance
  for (let i = 0; i < plan.exercises.length; i++) {
    const planEx = plan.exercises[i];
    const setsForEx = doneSets.filter((s) => s.exerciseId === planEx.exerciseId).length;
    if (setsForEx < planEx.targetSets) return i;
  }
  return plan.exercises.length - 1;
}

function computeCurrentSetIndex(
  plan: WorkoutPlan,
  exIdx: number,
  doneSets: SetLog[],
): number {
  const planEx = plan.exercises[exIdx];
  if (!planEx) return 0;
  return doneSets.filter((s) => s.exerciseId === planEx.exerciseId).length;
}

/** True if a setLog belongs to an earlier exercise slot in the plan (avoids counting same exerciseId used twice) */
function isFromPreviousExerciseSlot(set: SetLog, plan: WorkoutPlan, currentExIdx: number): boolean {
  for (let i = 0; i < currentExIdx; i++) {
    if (plan.exercises[i].exerciseId === set.exerciseId) return true;
  }
  return false;
}

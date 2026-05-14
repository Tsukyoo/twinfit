/**
 * Weekly Duel Scoring Engine
 * Calculates week scores from raw IndexedDB logs — no stored scores required.
 * All points are computed fresh on every call for accuracy.
 */

import type {
  ProfileId,
  WorkoutSession,
  SetLog,
  NutritionLog,
  BodyLog,
  WeeklyCheckin,
  SleepLog,
  Profile,
} from '../types';

// ============================================================
// CONSTANTS
// ============================================================

/** Priority exercises per profile — bonus progression points */
const PRIORITY_EXERCISES: Record<ProfileId, string[]> = {
  teoman:   ['db-incline-press', 'lat-pulldown-neutral', 'chest-supported-row', 'shoulder-press-machine', 'hack-squat'],
  denizhan: ['db-incline-press', 'lat-pulldown-neutral', 'seated-cable-row',    'shoulder-press-machine', 'hack-squat'],
};

/** Calorie tolerance (±kcal) per profile */
const CAL_TOLERANCE: Record<ProfileId, number> = { teoman: 150, denizhan: 200 };
/** Protein margin below target (g) */
const PROT_TOLERANCE = 10;
/** Water margin below target (ml) */
const WATER_TOLERANCE = 300;

// ============================================================
// DATE HELPERS
// ============================================================

export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1 - day); // shift to Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

export function getWeekEnd(weekStart: string): string {
  const d = new Date(weekStart + 'T12:00:00');
  d.setDate(d.getDate() + 6);
  return d.toISOString().split('T')[0];
}

function datesInWeek(weekStart: string): string[] {
  const dates: string[] = [];
  const start = new Date(weekStart + 'T12:00:00');
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

// ============================================================
// SCORING OUTPUT
// ============================================================

export interface BreakdownItem {
  label: string;
  pts: number;
}

export interface DuelScore {
  profileId: ProfileId;
  weekStart: string;
  total: number;

  // Breakdown categories
  sessionsTotal: number;
  setsTotal: number;
  progressionTotal: number;
  nutritionTotal: number;
  weightTotal: number;
  checkinTotal: number;
  sleepTotal: number;

  breakdown: BreakdownItem[];

  // Tie-breaker data
  sessionsCount: number;
  nutritionDaysRespected: number;
  prCount: number;
  weightDeltaToGoal: number; // positive = better (nearer goal)
  volumeTotal: number;
  workoutStreak: number;

  // Badges
  badges: string[];
}

export interface DuelResult {
  teoman: DuelScore;
  denizhan: DuelScore;
  winner: 'teoman' | 'denizhan' | null;
  tiebreakerApplied: boolean;
  tiebreakerReason: string;
  scoreDiff: number;
  /** True when both scores are 0 - no winner yet */
  isEmptyEquality: boolean;
}

// ============================================================
// MAIN SCORING FUNCTION
// ============================================================

export function computeWeeklyDuel(
  weekStart: string,
  data: {
    teomanProfile: Profile;
    denizhanProfile: Profile;
    teomanSessions: WorkoutSession[];
    denizhanSessions: WorkoutSession[];
    teomanSets: SetLog[];
    denizhanSets: SetLog[];
    allTeomanSets: SetLog[];    // all-time, for PR detection
    allDenizhanSets: SetLog[];
    teomanNutrition: NutritionLog[];
    denizhanNutrition: NutritionLog[];
    teomanBodyLogs: BodyLog[];
    denizhanBodyLogs: BodyLog[];
    teomanCheckin?: WeeklyCheckin;
    denizhanCheckin?: WeeklyCheckin;
    teomanPrevBodyLog?: BodyLog;  // last week's weight
    denizhanPrevBodyLog?: BodyLog;
    teomanSleepLogs?: SleepLog[];
    denizhanSleepLogs?: SleepLog[];
  }
): DuelResult {
  const weekEnd = getWeekEnd(weekStart);

  const t = scoreProfile('teoman', weekStart, weekEnd, data.teomanProfile, {
    sessions:   data.teomanSessions,
    sets:       data.teomanSets,
    allSets:    data.allTeomanSets,
    nutrition:  data.teomanNutrition,
    bodyLogs:   data.teomanBodyLogs,
    checkin:    data.teomanCheckin,
    prevBody:   data.teomanPrevBodyLog,
    sleepLogs:  data.teomanSleepLogs ?? [],
  });

  const d = scoreProfile('denizhan', weekStart, weekEnd, data.denizhanProfile, {
    sessions:   data.denizhanSessions,
    sets:       data.denizhanSets,
    allSets:    data.allDenizhanSets,
    nutrition:  data.denizhanNutrition,
    bodyLogs:   data.denizhanBodyLogs,
    checkin:    data.denizhanCheckin,
    prevBody:   data.denizhanPrevBodyLog,
    sleepLogs:  data.denizhanSleepLogs ?? [],
  });

  const result = resolveWinner(t, d);
  return result;
}

// ============================================================
// PER-PROFILE SCORING
// ============================================================

function scoreProfile(
  profileId: ProfileId,
  weekStart: string,
  weekEnd: string,
  profile: Profile,
  data: {
    sessions: WorkoutSession[];
    sets: SetLog[];
    allSets: SetLog[];
    nutrition: NutritionLog[];
    bodyLogs: BodyLog[];
    checkin?: WeeklyCheckin;
    prevBody?: BodyLog;
    sleepLogs: SleepLog[];
  }
): DuelScore {
  const breakdown: BreakdownItem[] = [];
  const badges: string[] = [];

  const weekDates = datesInWeek(weekStart);
  const weekSessions = data.sessions.filter(
    (s) => s.status === 'completed' && s.endedAt && s.endedAt >= weekStart && s.endedAt <= weekEnd + 'T23:59:59'
  );

  // Only count sets from completed sessions
  const completedSessionIds = new Set(weekSessions.map((s) => s.id));
  const weekSets = data.sets.filter(
    (s) => completedSessionIds.has(s.sessionId) &&
           s.createdAt >= weekStart &&
           s.createdAt <= weekEnd + 'T23:59:59'
  );
  const weekNutrition = data.nutrition.filter(
    (n) => n.date >= weekStart && n.date <= weekEnd
  );
  const weekBodyLogs = data.bodyLogs.filter(
    (b) => b.date >= weekStart && b.date <= weekEnd
  );

  // ── 1. SESSIONS ──────────────────────────────────────────
  let sessionsTotal = 0;
  const sessionsCount = weekSessions.length;

  // Per-session points
  if (sessionsCount > 0) {
    const perSessionPts = sessionsCount * 50;
    sessionsTotal += perSessionPts;
    breakdown.push({ label: `${sessionsCount} séance(s) terminée(s)`, pts: perSessionPts });
  }

  // All planned sessions done (profile trains Mon/Wed/Fri/Sat = 4 days)
  const plannedCount = profile.trainingDays.length;
  if (sessionsCount >= plannedCount) {
    sessionsTotal += 100;
    breakdown.push({ label: 'Toutes les séances de la semaine', pts: 100 });
    badges.push('perfect_week');
  }

  // Streak bonus (consecutive completed sessions ordered by date)
  const workoutStreak = computeWorkoutStreak(weekSessions);
  if (workoutStreak >= 4) {
    sessionsTotal += 70;
    breakdown.push({ label: `Streak ${workoutStreak} séances`, pts: 70 });
    badges.push('streak_4');
  } else if (workoutStreak === 3) {
    sessionsTotal += 40;
    breakdown.push({ label: 'Streak 3 séances', pts: 40 });
    badges.push('streak_3');
  } else if (workoutStreak === 2) {
    sessionsTotal += 20;
    breakdown.push({ label: 'Streak 2 séances', pts: 20 });
  }

  // ── BONUS WORKOUTS ────────────────────────────────────────
  // Bonus workouts: max 1/day, max 2/week count for points
  const bonusSessions = weekSessions.filter(s => s.isBonusWorkout);
  const countedBonusSessions: WorkoutSession[] = [];
  const bonusPointsByDay = new Map<string, number>();

  for (const session of bonusSessions) {
    if (!session.endedAt) continue;
    const day = session.endedAt.split('T')[0];
    const currentCount = bonusPointsByDay.get(day) ?? 0;
    
    // Max 1 bonus per day counts
    if (currentCount >= 1) continue;
    
    // Max 2 bonuses per week count
    if (countedBonusSessions.length >= 2) break;
    
    countedBonusSessions.push(session);
    bonusPointsByDay.set(day, currentCount + 1);
    sessionsTotal += 30;
    breakdown.push({ label: `Séance bonus: ${session.name}`, pts: 30 });
  }

  // ── 2. SETS ───────────────────────────────────────────────
  let setsTotal = 0;
  const normalSets = weekSets.filter((s) => !('isBonus' in s && (s as { isBonus?: boolean }).isBonus));
  const bonusSets  = weekSets.filter((s) => 'isBonus' in s && (s as { isBonus?: boolean }).isBonus);
  const rpeSets    = weekSets.filter((s) => s.rpe != null && s.rpe > 0);

  if (normalSets.length > 0) {
    const pts = normalSets.length * 2;
    setsTotal += pts;
    breakdown.push({ label: `${normalSets.length} série(s) validée(s)`, pts });
  }
  if (bonusSets.length > 0) {
    const pts = bonusSets.length * 3;
    setsTotal += pts;
    breakdown.push({ label: `${bonusSets.length} série(s) bonus`, pts });
  }
  if (rpeSets.length > 0) {
    const pts = rpeSets.length;
    setsTotal += pts;
    breakdown.push({ label: `RPE renseigné (${rpeSets.length}×)`, pts });
  }

  // ── 3. PROGRESSION ───────────────────────────────────────
  let progressionTotal = 0;
  let prCount = 0;
  let volumeTotal = 0;

  // Group week sets by exerciseId
  const byExercise = new Map<string, SetLog[]>();
  for (const s of weekSets) {
    if (!byExercise.has(s.exerciseId)) byExercise.set(s.exerciseId, []);
    byExercise.get(s.exerciseId)!.push(s);
  }

  for (const [exerciseId, sets] of byExercise) {
    // Previous sets for this exercise (before this week)
    const prevSets = data.allSets.filter(
      (s) => s.exerciseId === exerciseId &&
             s.createdAt < weekStart &&
             s.weightKg > 0
    );
    if (prevSets.length === 0) continue;

    const maxPrevWeight = Math.max(...prevSets.map((s) => s.weightKg));
    const maxPrevReps   = Math.max(...prevSets.filter((s) => s.weightKg === maxPrevWeight).map((s) => s.reps));
    const prevVolume    = prevSets.reduce((acc, s) => acc + s.weightKg * s.reps, 0);

    const curMaxWeight = Math.max(...sets.map((s) => s.weightKg));
    const curMaxReps   = Math.max(...sets.filter((s) => s.weightKg === curMaxWeight).map((s) => s.reps));
    const curVolume    = sets.reduce((acc, s) => acc + s.weightKg * s.reps, 0);
    volumeTotal += curVolume;

    const isPriority = PRIORITY_EXERCISES[profileId].includes(exerciseId);
    const priorityBonus = isPriority ? 10 : 0;

    const isPR = curMaxWeight > maxPrevWeight && curMaxReps >= maxPrevReps;
    if (isPR) {
      const pts = 25 + priorityBonus;
      progressionTotal += pts;
      prCount++;
      breakdown.push({ label: `PR — ${exerciseId}${isPriority ? ' (prioritaire)' : ''}`, pts });
      badges.push('pr_lift');
    } else if (curMaxWeight > maxPrevWeight) {
      const pts = 15 + priorityBonus;
      progressionTotal += pts;
      breakdown.push({ label: `Poids ↑ — ${exerciseId}`, pts });
    } else if (curMaxWeight === maxPrevWeight && curMaxReps > maxPrevReps) {
      const pts = 10 + priorityBonus;
      progressionTotal += pts;
      breakdown.push({ label: `Reps ↑ — ${exerciseId}`, pts });
    } else if (curVolume > prevVolume * 1.05) {
      const pts = 10 + priorityBonus;
      progressionTotal += pts;
      breakdown.push({ label: `Volume ↑ — ${exerciseId}`, pts });
    }
  }

  // ── 4. NUTRITION ─────────────────────────────────────────
  let nutritionTotal = 0;
  let nutritionDaysRespected = 0;
  const calTol  = CAL_TOLERANCE[profileId];
  const targets = profile.nutritionTargets;

  for (const date of weekDates) {
    const log = weekNutrition.find((n) => n.date === date);
    if (!log) continue;

    // Repas notés
    nutritionTotal += 5;

    let dayRespected = true;

    // Calories
    const calOk = Math.abs(log.calories - targets.calories) <= calTol;
    if (calOk) { nutritionTotal += 20; } else { dayRespected = false; }

    // Protéines
    const protOk = log.proteinG >= targets.proteinG - PROT_TOLERANCE;
    if (protOk) { nutritionTotal += 20; } else { dayRespected = false; }

    // Eau
    const waterOk = log.waterMl >= targets.waterMl - WATER_TOLERANCE;
    if (waterOk) { nutritionTotal += 10; } else { dayRespected = false; }

    if (dayRespected) nutritionDaysRespected++;
  }

  if (weekNutrition.length > 0) {
    breakdown.push({ label: `Nutrition (${weekNutrition.length} jour(s))`, pts: nutritionTotal });
    if (nutritionDaysRespected >= 5) badges.push('nutrition_week');
  }

  // ── 5. POIDS ─────────────────────────────────────────────
  let weightTotal = 0;
  let weightDeltaToGoal = 0;

  const isGaining = profile.goalWeightKg > profile.initialWeightKg;
  const latestWeekBody = weekBodyLogs.sort((a, b) => b.date.localeCompare(a.date))[0];

  if (latestWeekBody && data.prevBody) {
    const delta = latestWeekBody.weightKg - data.prevBody.weightKg;
    // How much closer to goal?
    const prevDistToGoal = Math.abs(data.prevBody.weightKg - profile.goalWeightKg);
    const curDistToGoal  = Math.abs(latestWeekBody.weightKg - profile.goalWeightKg);
    weightDeltaToGoal = prevDistToGoal - curDistToGoal; // positive = getting closer

    if (isGaining) {
      if (delta >= 0.25 && delta <= 0.4) {
        weightTotal += 60;
        breakdown.push({ label: `Prise optimale +${delta.toFixed(2)} kg`, pts: 60 });
      } else if (delta >= 0.1 && delta <= 0.6) {
        weightTotal += 30;
        breakdown.push({ label: `Prise correcte +${delta.toFixed(2)} kg`, pts: 30 });
      } else if (delta > 0.8) {
        weightTotal -= 20;
        breakdown.push({ label: `Prise trop rapide +${delta.toFixed(2)} kg`, pts: -20 });
      } else if (Math.abs(delta) <= 0.1 && prCount > 0) {
        weightTotal += 25;
        breakdown.push({ label: 'Poids stable, force en hausse', pts: 25 });
      }
    } else {
      // cutting
      if (delta <= -0.3 && delta >= -0.6) {
        weightTotal += 60;
        breakdown.push({ label: `Perte optimale ${delta.toFixed(2)} kg`, pts: 60 });
      } else if (delta <= -0.1 && delta >= -0.8) {
        weightTotal += 30;
        breakdown.push({ label: `Perte correcte ${delta.toFixed(2)} kg`, pts: 30 });
      } else if (delta < -1) {
        weightTotal -= 20;
        breakdown.push({ label: `Perte trop rapide ${delta.toFixed(2)} kg`, pts: -20 });
      } else if (Math.abs(delta) <= 0.1 && prCount > 0) {
        weightTotal += 25;
        breakdown.push({ label: 'Poids stable, force en hausse', pts: 25 });
      }
    }
  }

  // ── 6. CHECKIN ───────────────────────────────────────────
  let checkinTotal = 0;
  if (data.checkin) {
    checkinTotal += 30;
    breakdown.push({ label: 'Check hebdo rempli', pts: 30 });
    if ((data.checkin.averageEnergy ?? 0) >= 7) {
      checkinTotal += 10;
      breakdown.push({ label: 'Énergie ≥ 7', pts: 10 });
    }
    if ((data.checkin.averageSleepHours ?? 0) >= 7) {
      checkinTotal += 10;
      breakdown.push({ label: 'Sommeil ≥ 7h (check)', pts: 10 });
    }
  }

  // ── 7. SOMMEIL ───────────────────────────────────────────
  let sleepTotal = 0;
  const weekSleepLogs = data.sleepLogs.filter(
    (l) => l.date >= weekStart && l.date <= weekEnd
  );

  let sleepStreak = 0;
  for (const log of weekSleepLogs) {
    const mins = log.totalMinutes;
    if (mins >= 420 && mins <= 540) {
      // 7–9h optimal
      sleepTotal += 15;
      breakdown.push({ label: `Sommeil optimal — ${log.date}`, pts: 15 });
    } else if (mins >= 360 && mins < 420) {
      // 6–7h léger bonus
      sleepTotal += 7;
      breakdown.push({ label: `Sommeil correct — ${log.date}`, pts: 7 });
    } else if (mins > 540) {
      // >9h léger malus
      sleepTotal -= 5;
      breakdown.push({ label: `Sommeil trop long — ${log.date}`, pts: -5 });
    } else if (mins > 0 && mins < 360) {
      // <6h pénalité
      sleepTotal -= 10;
      breakdown.push({ label: `Sommeil insuffisant — ${log.date}`, pts: -10 });
    }
    // quality bonus
    if (log.quality === 'excellent') { sleepTotal += 5; breakdown.push({ label: `Qualité excellente — ${log.date}`, pts: 5 }); }
    else if (log.quality === 'good') { sleepTotal += 2; }
    sleepStreak++;
  }

  // Streak: 5+ nights logged
  if (sleepStreak >= 5) {
    sleepTotal += 20;
    breakdown.push({ label: `Streak sommeil ${sleepStreak} nuits`, pts: 20 });
    badges.push('sleep_streak');
  } else if (sleepStreak >= 3) {
    sleepTotal += 10;
    breakdown.push({ label: `Streak sommeil ${sleepStreak} nuits`, pts: 10 });
  }

  const total = sessionsTotal + setsTotal + progressionTotal + nutritionTotal + weightTotal + checkinTotal + sleepTotal;

  return {
    profileId,
    weekStart,
    total: Math.max(0, total),
    sessionsTotal,
    setsTotal,
    progressionTotal,
    nutritionTotal,
    weightTotal,
    checkinTotal,
    sleepTotal,
    breakdown,
    sessionsCount,
    nutritionDaysRespected,
    prCount,
    weightDeltaToGoal,
    volumeTotal,
    workoutStreak,
    badges: [...new Set(badges)],
  };
}

// WINNER RESOLUTION + TIE-BREAKER
// ============================================================

function resolveWinner(t: DuelScore, d: DuelScore): DuelResult {
  // Case 1: Different scores → clear winner
  if (t.total !== d.total) {
    return {
      teoman: t,
      denizhan: d,
      winner: t.total > d.total ? 'teoman' : 'denizhan',
      tiebreakerApplied: false,
      tiebreakerReason: '',
      scoreDiff: Math.abs(t.total - d.total),
      isEmptyEquality: false,
    };
  }

  // Case 2: Both scores are 0 → empty equality, no tie-breaker
  if (t.total === 0 && d.total === 0) {
    return {
      teoman: t,
      denizhan: d,
      winner: null,
      tiebreakerApplied: false,
      tiebreakerReason: 'Égalité parfaite pour l\'instant',
      scoreDiff: 0,
      isEmptyEquality: true,
    };
  }

  // Case 3: Equal scores but > 0 → apply tie-breakers
  const checks: Array<{ label: string; tVal: number; dVal: number }> = [
    { label: 'plus de séances', tVal: t.sessionsCount, dVal: d.sessionsCount },
    { label: 'meilleure nutrition', tVal: t.nutritionDaysRespected, dVal: d.nutritionDaysRespected },
    { label: 'plus de PR', tVal: t.prCount, dVal: d.prCount },
    { label: 'meilleure évol. poids', tVal: t.weightDeltaToGoal, dVal: d.weightDeltaToGoal },
    { label: 'plus grand volume total', tVal: t.volumeTotal, dVal: d.volumeTotal },
    { label: 'plus grand streak', tVal: t.workoutStreak, dVal: d.workoutStreak },
  ];

  for (const check of checks) {
    if (check.tVal !== check.dVal) {
      return {
        teoman: t,
        denizhan: d,
        winner: check.tVal > check.dVal ? 'teoman' : 'denizhan',
        tiebreakerApplied: true,
        tiebreakerReason: check.label,
        scoreDiff: 0,
        isEmptyEquality: false,
      };
    }
  }

  // Case 4: Absolute tie with scores > 0 — mathematically near-impossible
  return {
    teoman: t,
    denizhan: d,
    winner: 'teoman', // fallback
    tiebreakerApplied: true,
    tiebreakerReason: 'égalité absolue',
    scoreDiff: 0,
    isEmptyEquality: false,
  };
}

// ============================================================
// STREAK HELPERS
// ============================================================

function computeWorkoutStreak(sessions: WorkoutSession[]): number {
  const completed = sessions
    .filter((s) => s.status === 'completed' && s.endedAt)
    .map((s) => s.endedAt!.split('T')[0])
    .sort((a, b) => b.localeCompare(a)); // most recent first

  if (completed.length === 0) return 0;

  const unique = [...new Set(completed)];
  let streak = 1;
  for (let i = 0; i < unique.length - 1; i++) {
    const curr = new Date(unique[i] + 'T12:00:00');
    const prev = new Date(unique[i + 1] + 'T12:00:00');
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    // Allow 1-2 day gap (rest day between sessions)
    if (diffDays <= 2) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

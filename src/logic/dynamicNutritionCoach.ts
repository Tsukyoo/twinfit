/**
 * Dynamic Nutrition Coach Engine
 * Analyzes weight progression, nutrition tracking, and workout data
 * to provide real-time recommendations for calories, protein, and water.
 */

import type { ProfileId, BodyLog, NutritionLog, WorkoutSession, SleepLog } from '../types';
import { getLocalDateISO, getDaysAgoISO } from '../utils/dates';

export interface WeightTrend {
  currentWeekAvg: number | null;
  previousWeekAvg: number | null;
  weeklyDelta: number | null; // kg per week
  dataPoints: number;
  confidence: 'low' | 'medium' | 'high';
}

export interface NutritionAverages {
  avgCalories: number | null;
  avgProtein: number | null;
  avgWater: number | null;
  daysTracked: number;
}

export interface WorkoutStats {
  sessionsLast7Days: number;
  hasWorkoutToday: boolean;
  avgVolumeIncrease: number | null; // percentage
  bonusWorkoutsLast7Days: number;
  hasBonusWorkoutToday: boolean;
}

export interface CoachRecommendation {
  currentCalories: number;
  recommendedCalories: number;
  calorieDelta: number;
  currentProtein: number;
  recommendedProtein: number;
  proteinDelta: number;
  currentWater: number;
  recommendedWater: number;
  waterDelta: number;
  verdict: 'maintain' | 'increase' | 'decrease' | 'insufficient_data';
  reason: string;
  action: string;
  confidence: 'low' | 'medium' | 'high';
  detailMessage: string;
  sleepNote?: string;
}

export interface CoachInput {
  profileId: ProfileId;
  initialWeightKg: number;
  goalWeightKg: number;
  currentWeightKg: number | null;
  bodyLogs: BodyLog[];
  nutritionLogs: NutritionLog[];
  workoutSessions: WorkoutSession[];
  sleepLogs?: SleepLog[];
  baseCalories: number;
  baseProtein: number;
  baseWater: number;
}

// ============================================
// WEIGHT TREND ANALYSIS
// ============================================

export function analyzeWeightTrend(bodyLogs: BodyLog[], _initialWeightKg: number): WeightTrend {
  if (bodyLogs.length === 0) {
    return {
      currentWeekAvg: null,
      previousWeekAvg: null,
      weeklyDelta: null,
      dataPoints: 0,
      confidence: 'low',
    };
  }

  const today = getLocalDateISO();
  const sevenDaysAgo = getDaysAgoISO(7);
  const fourteenDaysAgo = getDaysAgoISO(14);

  // Current week (last 7 days)
  const currentWeekLogs = bodyLogs.filter(l => l.date >= sevenDaysAgo && l.date <= today);
  const currentWeekAvg = currentWeekLogs.length > 0
    ? currentWeekLogs.reduce((sum, l) => sum + l.weightKg, 0) / currentWeekLogs.length
    : null;

  // Previous week (7-14 days ago)
  const previousWeekLogs = bodyLogs.filter(l => l.date >= fourteenDaysAgo && l.date < sevenDaysAgo);
  const previousWeekAvg = previousWeekLogs.length > 0
    ? previousWeekLogs.reduce((sum, l) => sum + l.weightKg, 0) / previousWeekLogs.length
    : null;

  // Calculate weekly delta
  let weeklyDelta: number | null = null;
  let confidence: 'low' | 'medium' | 'high' = 'low';

  if (currentWeekAvg !== null && previousWeekAvg !== null) {
    weeklyDelta = currentWeekAvg - previousWeekAvg;
    confidence = currentWeekLogs.length >= 2 && previousWeekLogs.length >= 2 ? 'high' : 'medium';
  } else if (bodyLogs.length >= 2) {
    // Fallback: use last two weigh-ins
    const sorted = [...bodyLogs].sort((a, b) => b.date.localeCompare(a.date));
    const last = sorted[0];
    const previous = sorted[1];
    const daysDiff = Math.round((new Date(last.date).getTime() - new Date(previous.date).getTime()) / (24 * 60 * 60 * 1000));
    if (daysDiff > 0) {
      weeklyDelta = ((last.weightKg - previous.weightKg) / daysDiff) * 7;
      confidence = 'low';
    }
  }

  const dataPoints = currentWeekLogs.length + previousWeekLogs.length;

  return {
    currentWeekAvg,
    previousWeekAvg,
    weeklyDelta,
    dataPoints,
    confidence,
  };
}

// ============================================
// NUTRITION AVERAGES
// ============================================

export function calculateNutritionAverages(nutritionLogs: NutritionLog[]): NutritionAverages {
  const sevenDaysAgo = getDaysAgoISO(7);
  const recentLogs = nutritionLogs.filter(l => l.date >= sevenDaysAgo);

  if (recentLogs.length === 0) {
    return {
      avgCalories: null,
      avgProtein: null,
      avgWater: null,
      daysTracked: 0,
    };
  }

  const avgCalories = recentLogs.reduce((sum, l) => sum + l.calories, 0) / recentLogs.length;
  const avgProtein = recentLogs.reduce((sum, l) => sum + l.proteinG, 0) / recentLogs.length;
  const avgWater = recentLogs.reduce((sum, l) => sum + l.waterMl, 0) / recentLogs.length;

  return {
    avgCalories: Math.round(avgCalories),
    avgProtein: Math.round(avgProtein),
    avgWater: Math.round(avgWater),
    daysTracked: recentLogs.length,
  };
}

// ============================================
// WORKOUT STATS
// ============================================

export function analyzeWorkoutStats(sessions: WorkoutSession[]): WorkoutStats {
  const today = getLocalDateISO();
  const sevenDaysAgo = getDaysAgoISO(7);

  const recentSessions = sessions.filter((s: WorkoutSession) => 
    s.status === 'completed' && s.endedAt && s.endedAt >= sevenDaysAgo
  );

  const hasWorkoutToday = recentSessions.some((s: WorkoutSession) => 
    s.endedAt && s.endedAt.startsWith(today)
  );

  // Bonus workout stats
  const bonusSessions = recentSessions.filter((s: WorkoutSession) => s.isBonusWorkout);
  const hasBonusWorkoutToday = bonusSessions.some((s: WorkoutSession) => 
    s.endedAt && s.endedAt.startsWith(today)
  );

  return {
    sessionsLast7Days: recentSessions.length,
    hasWorkoutToday,
    avgVolumeIncrease: null, // Would need set history to calculate
    bonusWorkoutsLast7Days: bonusSessions.length,
    hasBonusWorkoutToday,
  };
}

// ============================================
// COACH ENGINE - TEOMAN RULES
// ============================================

function coachTeoman(input: CoachInput, weightTrend: WeightTrend, nutrition: NutritionAverages, _workouts: WorkoutStats): CoachRecommendation {
  const base = {
    currentCalories: input.baseCalories,
    recommendedCalories: input.baseCalories,
    calorieDelta: 0,
    currentProtein: input.baseProtein,
    recommendedProtein: input.baseProtein,
    proteinDelta: 0,
    currentWater: input.baseWater,
    recommendedWater: input.baseWater,
    waterDelta: 0,
    verdict: 'maintain' as const,
    reason: '',
    action: '',
    confidence: weightTrend.confidence,
    detailMessage: '',
  };

  // Insufficient data
  if (weightTrend.weeklyDelta === null || weightTrend.dataPoints < 2) {
    return {
      ...base,
      verdict: 'insufficient_data',
      reason: 'Pas assez de pesées pour ajuster précisément.',
      action: 'Ajoute une pesée dimanche pour activer le coaching.',
      detailMessage: 'Le coach dynamique a besoin d\'au moins 2 pesées sur 2 semaines pour faire des recommandations.',
      confidence: 'low',
    };
  }

  const delta = weightTrend.weeklyDelta;

  // Rule 1: Perfect loss (-0.3 to -0.6 kg/week)
  if (delta >= -0.6 && delta <= -0.3) {
    let proteinRec = input.baseProtein;
    if (nutrition.avgProtein !== null && nutrition.avgProtein < 150) {
      proteinRec = Math.min(170, input.baseProtein + 10);
    }

    return {
      ...base,
      recommendedProtein: proteinRec,
      proteinDelta: proteinRec - input.baseProtein,
      verdict: 'maintain',
      reason: 'Rythme de perte parfait.',
      action: 'Continue sur ta lancée !',
      detailMessage: `Tu perds ${Math.abs(delta).toFixed(2)} kg/semaine, c'est idéal pour la recomposition.`,
    };
  }

  // Rule 2: Too rapid loss (> 0.8 kg/week)
  if (delta < -0.8) {
    const newCalories = input.baseCalories + 150;
    return {
      ...base,
      recommendedCalories: newCalories,
      calorieDelta: 150,
      verdict: 'increase',
      reason: 'Perte trop rapide, risque de perdre en force.',
      action: `Augmente à ${newCalories} kcal cette semaine.`,
      detailMessage: `Tu perds ${Math.abs(delta).toFixed(2)} kg/semaine. C'est trop agressif pour préserver ton muscle.`,
    };
  }

  // Rule 3: Stagnation or slow loss (< 0.1 kg/week for 2+ weeks conceptually)
  if (delta > -0.1) {
    const newCalories = input.baseCalories - 100;
    return {
      ...base,
      recommendedCalories: newCalories,
      calorieDelta: -100,
      verdict: 'decrease',
      reason: 'Poids stable, léger ajustement nécessaire.',
      action: `Réduis légèrement à ${newCalories} kcal ou ajoute 1 séance cardio.`,
      detailMessage: `Stagnation détectée (${delta > 0 ? '+' : ''}${delta.toFixed(2)} kg/semaine). Petit ajustement recommandé.`,
    };
  }

  // Rule 4: Weight going up (unexpected for recomposition)
  if (delta > 0.2) {
    return {
      ...base,
      recommendedCalories: input.baseCalories - 100,
      calorieDelta: -100,
      verdict: 'decrease',
      reason: 'Poids en hausse, à surveiller.',
      action: 'Ajuste légèrement ou vérifie ton tracking nutrition.',
      detailMessage: `Poids en hausse de +${delta.toFixed(2)} kg/semaine. Vérifie que tu tracks bien tous tes repas.`,
    };
  }

  // Default: moderate adjustment
  return {
    ...base,
    verdict: 'maintain',
    reason: 'Progression en cours d\'analyse.',
    action: 'Continue tes habitudes actuelles.',
    detailMessage: `Variation de ${delta.toFixed(2)} kg/semaine. Données en cours de collecte.`,
  };
}

// ============================================
// COACH ENGINE - DENIZHAN RULES
// ============================================

function coachDenizhan(input: CoachInput, weightTrend: WeightTrend, _nutrition: NutritionAverages, _workouts: WorkoutStats): CoachRecommendation {
  const base = {
    currentCalories: input.baseCalories,
    recommendedCalories: input.baseCalories,
    calorieDelta: 0,
    currentProtein: input.baseProtein,
    recommendedProtein: input.baseProtein,
    proteinDelta: 0,
    currentWater: input.baseWater,
    recommendedWater: input.baseWater,
    waterDelta: 0,
    verdict: 'maintain' as const,
    reason: '',
    action: '',
    confidence: weightTrend.confidence,
    detailMessage: '',
  };

  // Insufficient data
  if (weightTrend.weeklyDelta === null || weightTrend.dataPoints < 2) {
    return {
      ...base,
      verdict: 'insufficient_data',
      reason: 'Pas assez de pesées pour ajuster.',
      action: 'Ajoute une pesée dimanche.',
      detailMessage: 'Le coach a besoin d\'au moins 2 pesées sur 2 semaines.',
      confidence: 'low',
    };
  }

  const delta = weightTrend.weeklyDelta;

  // Rule 1: Perfect gain (+0.25 to +0.4 kg/week)
  if (delta >= 0.25 && delta <= 0.4) {
    return {
      ...base,
      verdict: 'maintain',
      reason: 'Prise de masse propre parfaite.',
      action: 'Continue, c\'est exactement ce qu\'il faut !',
      detailMessage: `+${delta.toFixed(2)} kg/semaine est idéal pour la prise de masse propre.`,
    };
  }

  // Rule 2: Too rapid gain (> 0.6 kg/week)
  if (delta > 0.6) {
    const newCalories = input.baseCalories - 150;
    return {
      ...base,
      recommendedCalories: newCalories,
      calorieDelta: -150,
      verdict: 'decrease',
      reason: 'Prise trop rapide, risque de gras.',
      action: `Réduis à ${newCalories} kcal pour ralentir.`,
      detailMessage: `+${delta.toFixed(2)} kg/semaine est trop rapide. Réduis légèrement pour rester propre.`,
    };
  }

  // Rule 3: Stagnation or very slow gain (< 0.1 kg/week)
  if (delta < 0.1) {
    const newCalories = input.baseCalories + 200;
    return {
      ...base,
      recommendedCalories: newCalories,
      calorieDelta: 200,
      verdict: 'increase',
      reason: 'Tu ne montes pas assez.',
      action: `Augmente à ${newCalories} kcal pour repartir.`,
      detailMessage: `Stagnation détectée. Il faut plus de calories pour prendre du volume.`,
    };
  }

  // Rule 4: Weight loss (unexpected for bulk)
  if (delta < -0.1) {
    const newCalories = input.baseCalories + 300;
    return {
      ...base,
      recommendedCalories: newCalories,
      calorieDelta: 300,
      verdict: 'increase',
      reason: 'Tu perds du poids, déficit trop important.',
      action: `Augmente significativement à ${newCalories} kcal.`,
      detailMessage: `Perte de ${Math.abs(delta).toFixed(2)} kg/semaine. Gros manque de calories détecté.`,
    };
  }

  // Default
  return {
    ...base,
    verdict: 'maintain',
    reason: 'Progression en cours d\'analyse.',
    action: 'Continue tes habitudes actuelles.',
    detailMessage: `Variation de ${delta > 0 ? '+' : ''}${delta.toFixed(2)} kg/semaine.`,
  };
}

// ============================================
// WATER ADJUSTMENTS
// ============================================

function calculateWaterRecommendation(baseWater: number, workouts: WorkoutStats, proteinIntake: number | null): number {
  let recommended = baseWater;

  // Workout today = +500ml
  if (workouts.hasWorkoutToday) {
    recommended += 500;
  }

  // High protein = +300ml
  if (proteinIntake !== null && proteinIntake > 150) {
    recommended += 300;
  }

  return recommended;
}

// ============================================
// MAIN COACH FUNCTION
// ============================================

export function generateCoachingRecommendation(input: CoachInput): CoachRecommendation {
  // Analyze data
  const weightTrend = analyzeWeightTrend(input.bodyLogs, input.initialWeightKg);
  const nutrition = calculateNutritionAverages(input.nutritionLogs);
  const workouts = analyzeWorkoutStats(input.workoutSessions);

  // Get base recommendation from profile-specific rules
  let recommendation: CoachRecommendation;
  if (input.profileId === 'teoman') {
    recommendation = coachTeoman(input, weightTrend, nutrition, workouts);
  } else {
    recommendation = coachDenizhan(input, weightTrend, nutrition, workouts);
  }

  // Apply water adjustments
  recommendation.recommendedWater = calculateWaterRecommendation(
    input.baseWater,
    workouts,
    nutrition.avgProtein
  );
  recommendation.waterDelta = recommendation.recommendedWater - input.baseWater;

  // Apply protein floor rules
  const proteinFloor = input.profileId === 'teoman' ? 150 : 125;
  if (recommendation.recommendedProtein < proteinFloor) {
    recommendation.recommendedProtein = proteinFloor;
    recommendation.proteinDelta = proteinFloor - input.baseProtein;
  }

  // Cap calorie adjustments
  const maxIncrease = 300;
  const maxDecrease = -200;
  if (recommendation.calorieDelta > maxIncrease) {
    recommendation.recommendedCalories = input.baseCalories + maxIncrease;
    recommendation.calorieDelta = maxIncrease;
  }
  if (recommendation.calorieDelta < maxDecrease) {
    recommendation.recommendedCalories = input.baseCalories + maxDecrease;
    recommendation.calorieDelta = maxDecrease;
  }

  // Sleep note — computed from last 3 days of sleep logs
  if (input.sleepLogs && input.sleepLogs.length > 0) {
    const today = getLocalDateISO();
    const recent = input.sleepLogs
      .filter((l) => l.date <= today)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3);

    if (recent.length >= 2) {
      const avgMins = recent.reduce((s, l) => s + l.totalMinutes, 0) / recent.length;
      if (avgMins < 360) {
        recommendation.sleepNote = `Moins de 6h de sommeil en moyenne sur ${recent.length} nuits. Réduis l'intensité aujourd'hui pour favoriser la récupération.`;
      } else if (avgMins > 480 && recent.every((l) => l.quality !== 'poor')) {
        recommendation.sleepNote = `Excellent sommeil cette semaine (${Math.round(avgMins / 60)}h moy.). Bonne fenêtre pour pousser les PR.`;
      } else if (avgMins >= 420 && avgMins <= 480) {
        recommendation.sleepNote = `Sommeil régulier (${Math.round(avgMins / 60)}h moy.). Tu récupères bien.`;
      }
    }
  }

  return recommendation;
}

// ============================================
// DISMISSAL STORAGE
// ============================================

export function getCoachDismissedKey(profileId: ProfileId): string {
  const today = getLocalDateISO();
  return `dynamicCoachDismissed:${profileId}:${today}`;
}

export function isCoachDismissedToday(profileId: ProfileId): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(getCoachDismissedKey(profileId)) === 'true';
}

export function dismissCoachForToday(profileId: ProfileId): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getCoachDismissedKey(profileId), 'true');
}

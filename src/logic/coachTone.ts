import type { ProfileId } from '../types';

// ============================================================
// TYPES
// ============================================================

export type CoachTone =
  | 'strict'
  | 'motivating'
  | 'analytical'
  | 'rival'
  | 'calm'
  | 'warning';

export type CoachArea =
  | 'dashboard'
  | 'nutrition'
  | 'progress'
  | 'duel'
  | 'workout'
  | 'sleep'
  | 'recovery';

export interface CoachMessageContext {
  profileId: ProfileId;
  area: CoachArea;
  metrics?: {
    caloriesProgress?: number;      // 0–1 ratio (actual / target)
    proteinProgress?: number;       // 0–1 ratio
    waterProgress?: number;         // 0–1 ratio
    sleepMinutes?: number | null;
    workoutCompletedToday?: boolean;
    isRestDay?: boolean;
    weeklyPointsGap?: number;       // positive = leading, negative = behind
    weightTrendKg?: number | null;  // kg change over last 2 weeks
    strengthTrend?: 'up' | 'stable' | 'down' | null;
    hasPain?: boolean;
    hasEnoughData?: boolean;        // false = not enough logs to coach
    nutritionLoggedToday?: boolean;
    sleepLoggedToday?: boolean;
    workoutStreakDays?: number;
    currentWeightKg?: number | null;
  };
}

export interface CoachMessage {
  tone: CoachTone;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  area: CoachArea;
}

/** Rich context used by getCoachMessages() on the Dashboard */
export interface DashboardCoachContext {
  profileId: ProfileId;
  // Workout
  workoutCompletedToday: boolean;
  isRestDay: boolean;
  workoutStreakDays: number;
  // Sleep
  sleepMinutes: number | null;
  sleepLoggedToday: boolean;
  // Nutrition
  nutritionLoggedToday: boolean;
  caloriesProgress: number;   // 0–1
  proteinProgress: number;    // 0–1
  waterProgress: number;      // 0–1
  // Duel
  weeklyPointsGap: number | null;  // positive = leading
  // Progress / body
  currentWeightKg: number | null;
  strengthTrend: 'up' | 'stable' | 'down' | null;
  weightTrendKg: number | null;
  // Pain
  hasPain: boolean;
}

// ============================================================
// MESSAGE BANKS  (deterministic, no randomness at runtime)
// Each tone has multiple variants keyed by area
// ============================================================

type AreaMessages = Partial<Record<CoachArea, { title: string; message: string }[]>>;

const MESSAGES: Record<CoachTone, AreaMessages> = {
  warning: {
    dashboard: [
      { title: 'Signal d\'alerte', message: 'Attention : baisse de force détectée. Récupération ou technique à revoir.' },
      { title: 'Douleur signalée', message: 'Ne force pas. Garde la technique et évite les exercices douloureux.' },
    ],
    workout: [
      { title: 'Attention douleur', message: 'Ne force pas. Garde la technique et choisis une alternative si besoin.' },
    ],
    sleep: [
      { title: 'Sommeil critique', message: 'Tu es sous 5h plusieurs jours. Tes performances vont en souffrir sérieusement.' },
    ],
    nutrition: [
      { title: 'Perte trop rapide', message: 'La perte de poids est trop agressive. Augmente tes calories pour ne pas perdre du muscle.' },
    ],
    progress: [
      { title: 'Rythme trop agressif', message: 'Ton rythme actuel est trop intense. Tu risques de perdre en performance.' },
    ],
    duel: [
      { title: 'Douleur signalée', message: 'Optimise la récupération avant de forcer sur le duel. La régularité prime.' },
    ],
  },

  strict: {
    dashboard: [
      { title: 'Données manquantes', message: 'Remplis nutrition, sommeil et pesée pour que le coach devienne précis.' },
      { title: 'Tracking incomplet', message: 'Sans données, impossible d\'ajuster. Commence par saisir tes repas d\'aujourd\'hui.' },
    ],
    nutrition: [
      { title: 'Nutrition non renseignée', message: 'Renseigne tes repas aujourd\'hui pour que le coach puisse ajuster correctement.' },
      { title: 'Priorité protéines', message: 'Tu es trop bas aujourd\'hui. Commence par sécuriser tes protéines.' },
      { title: 'Calories insuffisantes', message: 'Tu es bien en dessous de ton objectif calorique. Ajuste ton prochain repas.' },
    ],
    sleep: [
      { title: 'Sommeil non renseigné', message: 'Log ton sommeil chaque matin. C\'est une donnée clé pour suivre ta récupération.' },
    ],
    duel: [
      { title: 'Présence insuffisante', message: 'Ton adversaire est régulier. Le seul moyen de revenir, c\'est d\'être là chaque jour.' },
    ],
    progress: [
      { title: 'Données insuffisantes', message: 'Pas assez de pesées pour analyser ta progression. Ajoute une mesure.' },
    ],
  },

  calm: {
    dashboard: [
      { title: 'Récupération avant tout', message: 'Aujourd\'hui, l\'objectif n\'est pas de forcer. Récupère proprement.' },
      { title: 'Jour de repos', message: 'Utilise ce repos. Étire-toi, dors bien. La progression se construit dans la récupération.' },
    ],
    sleep: [
      { title: 'Récupération fragile', message: 'Ne cherche pas à battre un record aujourd\'hui. Priorise le repos.' },
      { title: 'Sommeil bas', message: 'Avec peu de sommeil, la performance sera limitée. Adapte l\'intensité.' },
    ],
    workout: [
      { title: 'Séance légère conseillée', message: 'Pas besoin de tout donner aujourd\'hui. Technique et mobilité suffisent.' },
    ],
    recovery: [
      { title: 'Phase de récupération', message: 'La progression vient aussi du repos. Ne saute pas cette étape.' },
    ],
  },

  rival: {
    duel: [
      { title: 'Duel serré', message: 'Tu peux repasser devant avec une séance propre cette semaine.' },
      { title: 'À portée', message: 'L\'écart est faible. Une bonne journée nutrition peut tout changer.' },
      { title: 'Reste dans la course', message: 'Tu n\'es pas loin. Maintiens la pression sur chaque catégorie.' },
    ],
    dashboard: [
      { title: 'Le duel est ouvert', message: 'L\'écart est faible. Une séance complète te remet devant.' },
    ],
  },

  motivating: {
    dashboard: [
      { title: 'Séance validée', message: 'Bien joué. Tu construis une vraie régularité, continue.' },
      { title: 'Régularité en place', message: 'Très bon signal. Continue comme ça, la constance prime tout.' },
      { title: 'Streak actif', message: `Bonne série en cours. Ne la coupe pas.` },
    ],
    workout: [
      { title: 'PR réalisé', message: 'Nouveau record personnel. Ton travail paie.' },
      { title: 'Séance terminée', message: 'Solide. Chaque séance complétée compte double dans la durée.' },
    ],
    nutrition: [
      { title: 'Objectifs atteints', message: 'Nutrition dans les clous aujourd\'hui. C\'est ce qui fait la différence.' },
    ],
    progress: [
      { title: 'Progression nette', message: 'La tendance est claire et positive. Continue sans changer.' },
    ],
    duel: [
      { title: 'Tu mènes le duel', message: 'Bonne semaine. Garde la pression jusqu\'au bout.' },
    ],
    sleep: [
      { title: 'Bon sommeil', message: 'Nuit optimale. Tu vas performer aujourd\'hui.' },
    ],
  },

  analytical: {
    dashboard: [
      { title: 'Analyse en cours', message: 'Données insuffisantes pour une analyse précise. Plus tu renseignes, plus le coach ajuste.' },
      { title: 'Tendance stable', message: 'Pas de signal fort cette semaine. Continue et les données parleront.' },
    ],
    nutrition: [
      { title: 'Ratio protéines correct', message: 'Calories dans la moyenne, protéines stables. Surveille l\'eau.' },
      { title: 'Légèrement sous l\'objectif', message: 'Tu es à environ 80% de tes calories. Ajuste le dîner si besoin.' },
    ],
    progress: [
      { title: 'Signal positif', message: 'Poids stable, force en hausse : recomposition probable. Ne change rien.' },
      { title: 'Poids stable', message: 'Aucune variation significative. Vérifie la consistance de ta nutrition.' },
    ],
    duel: [
      { title: 'Analyse du duel', message: 'Les points se jouent sur la nutrition et les séances. Deux leviers faciles à activer.' },
    ],
    sleep: [
      { title: 'Sommeil dans la norme', message: 'Durée correcte. Travaille la qualité pour aller plus loin.' },
    ],
  },
};

// ============================================================
// TONE SELECTION LOGIC (priority: warning → strict → calm → rival → motivating → analytical)
// ============================================================

function selectTone(ctx: CoachMessageContext): CoachTone {
  const m = ctx.metrics ?? {};

  // 1. WARNING
  if (m.hasPain) return 'warning';
  if (m.strengthTrend === 'down' && m.workoutStreakDays !== undefined && m.workoutStreakDays > 3) return 'warning';
  if (m.sleepMinutes !== undefined && m.sleepMinutes !== null && m.sleepMinutes < 300) return 'warning'; // < 5h
  if (
    m.weightTrendKg !== undefined &&
    m.weightTrendKg !== null &&
    Math.abs(m.weightTrendKg) > 1.5
  ) return 'warning'; // >1.5 kg/2 weeks = too aggressive

  // 2. STRICT
  if (m.hasEnoughData === false) return 'strict';
  if (ctx.area === 'nutrition' && m.nutritionLoggedToday === false) return 'strict';
  // Only analyse macros if nutrition has actually been logged today
  if (ctx.area === 'nutrition' && m.nutritionLoggedToday === true) {
    if (m.proteinProgress !== undefined && m.proteinProgress < 0.5) return 'strict';
    if (m.caloriesProgress !== undefined && m.caloriesProgress < 0.4) return 'strict';
  }
  if (ctx.area === 'sleep' && !m.sleepLoggedToday) return 'strict';

  // 3. CALM
  if (m.sleepMinutes !== undefined && m.sleepMinutes !== null && m.sleepMinutes < 360) return 'calm'; // < 6h
  if (m.isRestDay && ctx.area === 'dashboard') return 'calm';
  if (ctx.area === 'recovery') return 'calm';

  // 4. RIVAL  (only for duel / dashboard with a gap)
  if (
    (ctx.area === 'duel' || ctx.area === 'dashboard') &&
    m.weeklyPointsGap !== undefined &&
    m.weeklyPointsGap < 0 &&
    m.weeklyPointsGap > -40
  ) return 'rival';

  // 5. MOTIVATING
  if (m.workoutCompletedToday) return 'motivating';
  if (m.strengthTrend === 'up') return 'motivating';
  if (m.workoutStreakDays !== undefined && m.workoutStreakDays >= 3) return 'motivating';
  if (
    ctx.area === 'nutrition' &&
    m.nutritionLoggedToday === true &&
    m.caloriesProgress !== undefined &&
    m.caloriesProgress >= 0.9 &&
    m.proteinProgress !== undefined &&
    m.proteinProgress >= 0.85
  ) return 'motivating';
  if (
    ctx.area === 'duel' &&
    m.weeklyPointsGap !== undefined &&
    m.weeklyPointsGap > 0
  ) return 'motivating';
  if (
    ctx.area === 'sleep' &&
    m.sleepMinutes !== undefined &&
    m.sleepMinutes !== null &&
    m.sleepMinutes >= 420 // ≥7h
  ) return 'motivating';

  // 6. ANALYTICAL (default)
  return 'analytical';
}

function selectMessage(
  tone: CoachTone,
  area: CoachArea,
  metrics?: CoachMessageContext['metrics']
): { title: string; message: string } {
  const bank = MESSAGES[tone];
  const areaMessages = bank[area] ?? bank['dashboard'] ?? Object.values(bank)[0]!;

  // For strict/nutrition pick the right variant based on what's wrong
  if (tone === 'strict' && area === 'nutrition' && metrics) {
    if (metrics.nutritionLoggedToday === false) return areaMessages[0]; // "Nutrition non renseignée"
    if (metrics.proteinProgress !== undefined && metrics.proteinProgress < 0.5) return areaMessages[1] ?? areaMessages[0]; // "Priorité protéines"
    if (metrics.caloriesProgress !== undefined && metrics.caloriesProgress < 0.4) return areaMessages[2] ?? areaMessages[0]; // "Calories insuffisantes"
  }

  return areaMessages[0];
}

function selectSeverity(tone: CoachTone): CoachMessage['severity'] {
  if (tone === 'warning') return 'high';
  if (tone === 'strict') return 'medium';
  return 'low';
}

// ============================================================
// TONE PRIORITY VALUE (for sorting candidates)
// ============================================================

const TONE_PRIORITY: Record<CoachTone, number> = {
  warning: 0,
  strict: 1,
  calm: 2,
  rival: 3,
  motivating: 4,
  analytical: 5,
};

// ============================================================
// MAIN EXPORTS
// ============================================================

export function getCoachMessage(context: CoachMessageContext): CoachMessage {
  const tone = selectTone(context);
  const { title, message } = selectMessage(tone, context.area, context.metrics);
  return { tone, title, message, severity: selectSeverity(tone), area: context.area };
}

/**
 * Generate up to 2 prioritised coach messages for the Dashboard.
 * Evaluates sleep, nutrition, duel and workout independently,
 * deduplicates by tone, sorts by priority, returns max 2.
 */
export function getCoachMessages(ctx: DashboardCoachContext): CoachMessage[] {
  const candidates: CoachMessage[] = [];

  function push(area: CoachArea, extraMetrics?: Partial<CoachMessageContext['metrics']>) {
    const context: CoachMessageContext = {
      profileId: ctx.profileId,
      area,
      metrics: {
        workoutCompletedToday: ctx.workoutCompletedToday,
        isRestDay: ctx.isRestDay,
        workoutStreakDays: ctx.workoutStreakDays,
        sleepMinutes: ctx.sleepMinutes,
        sleepLoggedToday: ctx.sleepLoggedToday,
        nutritionLoggedToday: ctx.nutritionLoggedToday,
        caloriesProgress: ctx.caloriesProgress,
        proteinProgress: ctx.proteinProgress,
        waterProgress: ctx.waterProgress,
        weeklyPointsGap: ctx.weeklyPointsGap ?? undefined,
        currentWeightKg: ctx.currentWeightKg,
        strengthTrend: ctx.strengthTrend,
        weightTrendKg: ctx.weightTrendKg,
        hasPain: ctx.hasPain,
        hasEnoughData: ctx.currentWeightKg !== null,
        ...extraMetrics,
      },
    };
    const tone = selectTone(context);
    const { title, message } = selectMessage(tone, area, context.metrics);
    candidates.push({ tone, title, message, severity: selectSeverity(tone), area });
  }

  // Evaluate each dimension independently

  // 1. Sleep — only if logged or critically low
  if (ctx.sleepLoggedToday || (ctx.sleepMinutes !== null && ctx.sleepMinutes < 360)) {
    push('sleep');
  } else if (!ctx.sleepLoggedToday) {
    push('sleep', { sleepLoggedToday: false });
  }

  // 2. Nutrition
  push('nutrition');

  // 3. Duel — only if we have a gap signal
  if (ctx.weeklyPointsGap !== null) {
    push('duel');
  }

  // 4. Workout / dashboard
  push('dashboard');

  // Deduplicate: keep highest-priority message per tone,
  // then pick 2 with the best (lowest) priority value, preferring different areas
  const seenTones = new Set<CoachTone>();
  const seenAreas = new Set<CoachArea>();
  const deduped: CoachMessage[] = [];

  const sorted = [...candidates].sort(
    (a, b) => TONE_PRIORITY[a.tone] - TONE_PRIORITY[b.tone]
  );

  for (const msg of sorted) {
    if (seenTones.has(msg.tone) && seenAreas.has(msg.area)) continue;
    seenTones.add(msg.tone);
    seenAreas.add(msg.area);
    deduped.push(msg);
    if (deduped.length === 2) break;
  }

  // Always return at least 1 (analytical fallback for dashboard)
  if (deduped.length === 0) {
    const fallback: CoachMessage = {
      tone: 'analytical',
      area: 'dashboard',
      severity: 'low',
      ...selectMessage('analytical', 'dashboard'),
    };
    deduped.push(fallback);
  }

  return deduped;
}

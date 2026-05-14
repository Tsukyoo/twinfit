import { useState, useEffect, useCallback } from 'react';
import type { WeeklyDuelResult, ProfileId } from '../types';
import { weeklyDuelResultRepo } from '../db/repositories';
import { workoutSessionRepo, setLogRepo, nutritionLogRepo, bodyLogRepo, weeklyCheckinRepo, sleepLogRepo } from '../db/repositories';
import { pushWeeklyDuelResult } from '../services/duelSyncService';
import { computeWeeklyDuel, getWeekStart, getWeekEnd } from '../logic/weeklyDuelScoring';
import { getProfileById } from '../data/profiles';

export interface WeeklyDuelHistoryState {
  results: WeeklyDuelResult[];
  teomanWins: number;
  denizhanWins: number;
  isLoading: boolean;
}

/** Returns Monday of the week BEFORE the given weekStart string */
function getPreviousWeekStart(weekStart: string): string {
  const d = new Date(weekStart + 'T12:00:00');
  d.setDate(d.getDate() - 7);
  return d.toISOString().split('T')[0];
}

/** True if the given weekStart's Sunday has already passed */
function isWeekComplete(weekStart: string): boolean {
  const weekEnd = getWeekEnd(weekStart);
  const today = new Date().toISOString().split('T')[0];
  return today > weekEnd;
}

async function computeAndSaveWeek(weekStart: string): Promise<void> {
  const weekEnd = getWeekEnd(weekStart);

  const [
    tSessions, dSessions,
    tSets, dSets,
    allTSets, allDSets,
    tNutrition, dNutrition,
    tBody, dBody,
    tCheckin, dCheckin,
    tSleep, dSleep,
  ] = await Promise.all([
    workoutSessionRepo.getByProfile('teoman'),
    workoutSessionRepo.getByProfile('denizhan'),
    setLogRepo.getByProfile('teoman').then((s) => s.filter((l) => l.createdAt >= weekStart && l.createdAt <= weekEnd + 'T23:59:59')),
    setLogRepo.getByProfile('denizhan').then((s) => s.filter((l) => l.createdAt >= weekStart && l.createdAt <= weekEnd + 'T23:59:59')),
    setLogRepo.getByProfile('teoman'),
    setLogRepo.getByProfile('denizhan'),
    nutritionLogRepo.getByProfile('teoman'),
    nutritionLogRepo.getByProfile('denizhan'),
    bodyLogRepo.getByProfile('teoman'),
    bodyLogRepo.getByProfile('denizhan'),
    weeklyCheckinRepo.getByWeek('teoman', weekStart).catch(() => undefined),
    weeklyCheckinRepo.getByWeek('denizhan', weekStart).catch(() => undefined),
    sleepLogRepo.getByDateRange('teoman', weekStart, weekEnd).catch(() => []),
    sleepLogRepo.getByDateRange('denizhan', weekStart, weekEnd).catch(() => []),
  ]);

  const tProfile = getProfileById('teoman')!;
  const dProfile = getProfileById('denizhan')!;

  const tPrevBody = tBody.filter((b) => b.date < weekStart).sort((a, b) => b.date.localeCompare(a.date))[0];
  const dPrevBody = dBody.filter((b) => b.date < weekStart).sort((a, b) => b.date.localeCompare(a.date))[0];

  const duelResult = computeWeeklyDuel(weekStart, {
    teomanProfile: tProfile,
    denizhanProfile: dProfile,
    teomanSessions: tSessions,
    denizhanSessions: dSessions,
    teomanSets: tSets,
    denizhanSets: dSets,
    allTeomanSets: allTSets,
    allDenizhanSets: allDSets,
    teomanNutrition: tNutrition,
    denizhanNutrition: dNutrition,
    teomanBodyLogs: tBody,
    denizhanBodyLogs: dBody,
    teomanCheckin: tCheckin,
    denizhanCheckin: dCheckin,
    teomanPrevBodyLog: tPrevBody,
    denizhanPrevBodyLog: dPrevBody,
    teomanSleepLogs: tSleep,
    denizhanSleepLogs: dSleep,
  });

  const tPts = duelResult.teoman.total;
  const dPts = duelResult.denizhan.total;

  // 0/0 — no data, no winner recorded
  if (tPts === 0 && dPts === 0) return;

  let winnerProfileId: ProfileId | null = duelResult.winner;
  let reason: string;

  if (duelResult.isEmptyEquality) {
    winnerProfileId = null;
    reason = 'Aucune donnée cette semaine';
  } else if (duelResult.winner === null) {
    reason = 'Égalité parfaite';
  } else if (duelResult.tiebreakerApplied) {
    reason = duelResult.tiebreakerReason || 'Départage';
  } else {
    const winner = duelResult.winner === 'teoman' ? 'Teoman' : 'Denizhan';
    const diff = duelResult.scoreDiff;
    reason = `${winner} +${diff} pts`;
  }

  const saved = await weeklyDuelResultRepo.upsert({
    weekStart,
    weekEnd,
    winnerProfileId,
    teomanPoints: tPts,
    denizhanPoints: dPts,
    reason,
    createdAt: new Date().toISOString(),
  });

  // Push to Supabase async — silent on failure (offline safe)
  pushWeeklyDuelResult(saved).catch(() => {});
}

export function useWeeklyDuelHistory(): WeeklyDuelHistoryState {
  const [results, setResults] = useState<WeeklyDuelResult[]>([]);
  const [teomanWins, setTeomanWins] = useState(0);
  const [denizhanWins, setDenizhanWins] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check the previous completed week and save if not yet recorded
      const currentWeekStart = getWeekStart();
      const prevWeekStart = getPreviousWeekStart(currentWeekStart);

      if (isWeekComplete(prevWeekStart)) {
        const existing = await weeklyDuelResultRepo.getByWeekStart(prevWeekStart);
        if (!existing) {
          await computeAndSaveWeek(prevWeekStart).catch(console.error);
        }
      }

      // Also check 2 weeks back in case the app wasn't opened last week
      const twoWeeksBack = getPreviousWeekStart(prevWeekStart);
      if (isWeekComplete(twoWeeksBack)) {
        const existing2 = await weeklyDuelResultRepo.getByWeekStart(twoWeeksBack);
        if (!existing2) {
          await computeAndSaveWeek(twoWeeksBack).catch(console.error);
        }
      }

      const all = await weeklyDuelResultRepo.getAll();
      // Sort descending by weekStart (most recent first)
      all.sort((a, b) => b.weekStart.localeCompare(a.weekStart));

      const tWins = all.filter((r) => r.winnerProfileId === 'teoman').length;
      const dWins = all.filter((r) => r.winnerProfileId === 'denizhan').length;

      setResults(all);
      setTeomanWins(tWins);
      setDenizhanWins(dWins);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load().catch(console.error);
  }, [load]);

  return { results, teomanWins, denizhanWins, isLoading };
}

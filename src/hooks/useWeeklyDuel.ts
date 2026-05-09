import { useState, useEffect, useMemo } from 'react';
import type { WorkoutSession, SetLog, NutritionLog, BodyLog, WeeklyCheckin } from '../types';
import { getProfileById } from '../data/profiles';
import { workoutSessionRepo, setLogRepo, nutritionLogRepo, bodyLogRepo, weeklyCheckinRepo } from '../db/repositories';
import { computeWeeklyDuel, getWeekStart, getWeekEnd, type DuelResult } from '../logic/weeklyDuelScoring';

export interface WeeklyDuelState {
  result: DuelResult | null;
  isLoading: boolean;
  weekStart: string;
}

export function useWeeklyDuel(weekStart?: string): WeeklyDuelState {
  const targetWeek = weekStart ?? getWeekStart();
  const [isLoading, setIsLoading] = useState(true);
  const [rawData, setRawData] = useState<{
    teomanSessions: WorkoutSession[];
    denizhanSessions: WorkoutSession[];
    teomanSets: SetLog[];
    denizhanSets: SetLog[];
    allTeomanSets: SetLog[];
    allDenizhanSets: SetLog[];
    teomanNutrition: NutritionLog[];
    denizhanNutrition: NutritionLog[];
    teomanBody: BodyLog[];
    denizhanBody: BodyLog[];
    teomanCheckin?: WeeklyCheckin;
    denizhanCheckin?: WeeklyCheckin;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);

      const weekEnd = getWeekEnd(targetWeek);

      const [
        tSessions, dSessions,
        tSets, dSets,
        allTSets, allDSets,
        tNutrition, dNutrition,
        tBody, dBody,
        tCheckin, dCheckin,
      ] = await Promise.all([
        workoutSessionRepo.getByProfile('teoman'),
        workoutSessionRepo.getByProfile('denizhan'),
        setLogRepo.getByProfile('teoman').then((s) => s.filter((l) => l.createdAt >= targetWeek && l.createdAt <= weekEnd + 'T23:59:59')),
        setLogRepo.getByProfile('denizhan').then((s) => s.filter((l) => l.createdAt >= targetWeek && l.createdAt <= weekEnd + 'T23:59:59')),
        setLogRepo.getByProfile('teoman'),
        setLogRepo.getByProfile('denizhan'),
        nutritionLogRepo.getByProfile('teoman'),
        nutritionLogRepo.getByProfile('denizhan'),
        bodyLogRepo.getByProfile('teoman'),
        bodyLogRepo.getByProfile('denizhan'),
        weeklyCheckinRepo.getByWeek('teoman', targetWeek).catch(() => undefined),
        weeklyCheckinRepo.getByWeek('denizhan', targetWeek).catch(() => undefined),
      ]);

      if (!cancelled) {
        setRawData({
          teomanSessions: tSessions,
          denizhanSessions: dSessions,
          teomanSets: tSets,
          denizhanSets: dSets,
          allTeomanSets: allTSets,
          allDenizhanSets: allDSets,
          teomanNutrition: tNutrition,
          denizhanNutrition: dNutrition,
          teomanBody: tBody,
          denizhanBody: dBody,
          teomanCheckin: tCheckin,
          denizhanCheckin: dCheckin,
        });
        setIsLoading(false);
      }
    }

    load().catch(console.error);
    return () => { cancelled = true; };
  }, [targetWeek]);

  const result = useMemo((): DuelResult | null => {
    if (!rawData) return null;

    const tProfile = getProfileById('teoman')!;
    const dProfile = getProfileById('denizhan')!;

    const tPrevBody = rawData.teomanBody
      .filter((b) => b.date < targetWeek)
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    const dPrevBody = rawData.denizhanBody
      .filter((b) => b.date < targetWeek)
      .sort((a, b) => b.date.localeCompare(a.date))[0];

    return computeWeeklyDuel(targetWeek, {
      teomanProfile: tProfile,
      denizhanProfile: dProfile,
      teomanSessions: rawData.teomanSessions,
      denizhanSessions: rawData.denizhanSessions,
      teomanSets: rawData.teomanSets,
      denizhanSets: rawData.denizhanSets,
      allTeomanSets: rawData.allTeomanSets,
      allDenizhanSets: rawData.allDenizhanSets,
      teomanNutrition: rawData.teomanNutrition,
      denizhanNutrition: rawData.denizhanNutrition,
      teomanBodyLogs: rawData.teomanBody,
      denizhanBodyLogs: rawData.denizhanBody,
      teomanCheckin: rawData.teomanCheckin,
      denizhanCheckin: rawData.denizhanCheckin,
      teomanPrevBodyLog: tPrevBody,
      denizhanPrevBodyLog: dPrevBody,
    });
  }, [rawData, targetWeek]);

  return { result, isLoading, weekStart: targetWeek };
}

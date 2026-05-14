import { useState, useEffect, useCallback } from 'react';
import type { NutritionLog, NutritionTargets, ProfileId } from '../types';
import { nutritionLogRepo } from '../db/repositories';
import { getProfileById } from '../data/profiles';
import { getLocalDateISO, getDaysAgoISO } from '../utils/dates';

export interface MealInput {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  waterMl: number;
}

export interface NutritionData {
  todayLog: NutritionLog | null;
  history: NutritionLog[];
  targets: NutritionTargets;
  isLoading: boolean;
  addMeal: (input: MealInput) => Promise<void>;
}

function todayDateStr(): string {
  return getLocalDateISO();
}

function last7DaysStart(): string {
  return getDaysAgoISO(6);
}

export function useNutritionData(profileId: ProfileId): NutritionData {
  const profile = getProfileById(profileId);
  const targets: NutritionTargets = profile?.nutritionTargets ?? {
    calories: 2500,
    proteinG: 160,
    carbsG: 300,
    fatG: 70,
    waterMl: 3000,
  };

  const [todayLog, setTodayLog] = useState<NutritionLog | null>(null);
  const [history, setHistory] = useState<NutritionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    const today = todayDateStr();
    const start = last7DaysStart();
    const [existing, range] = await Promise.all([
      nutritionLogRepo.getByDate(profileId, today),
      nutritionLogRepo.getByDateRange(profileId, start, today),
    ]);
    setTodayLog(existing ?? null);
    // Sort descending by date, exclude today from history list
    setHistory(
      range
        .filter((l) => l.date !== today)
        .sort((a, b) => b.date.localeCompare(a.date))
    );
    setIsLoading(false);
  }, [profileId]);

  useEffect(() => {
    setIsLoading(true);
    reload().catch(console.error);
  }, [reload]);

  const addMeal = useCallback(async (input: MealInput) => {
    const today = todayDateStr();
    const now = new Date().toISOString();

    if (todayLog) {
      // Upsert: accumulate onto existing log
      const updated: NutritionLog = {
        ...todayLog,
        calories: todayLog.calories + input.calories,
        proteinG: todayLog.proteinG + input.proteinG,
        carbsG: (todayLog.carbsG ?? 0) + input.carbsG,
        fatG: (todayLog.fatG ?? 0) + input.fatG,
        waterMl: todayLog.waterMl + input.waterMl,
        planRespected: false,
        updatedAt: now,
      };
      await nutritionLogRepo.update(updated);
    } else {
      await nutritionLogRepo.create({
        profileId,
        date: today,
        calories: input.calories,
        proteinG: input.proteinG,
        carbsG: input.carbsG,
        fatG: input.fatG,
        waterMl: input.waterMl,
        planRespected: false,
        createdAt: now,
        updatedAt: now,
      });
    }
    await reload();
  }, [profileId, todayLog, reload]);

  return { todayLog, history, targets, isLoading, addMeal };
}

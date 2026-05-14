import { useState, useEffect, useCallback } from 'react';
import type { BodyLog, ProfileId } from '../types';
import { bodyLogRepo } from '../db/repositories';
import { getProfileById } from '../data/profiles';
import { getLocalDateISO, getDaysAgoISO } from '../utils/dates';

export interface ProgressData {
  logs: BodyLog[];          // all logs sorted ascending (for chart)
  recent: BodyLog[];        // 10 most recent descending (for list)
  currentWeightKg: number | null;
  initialWeightKg: number;
  goalWeightKg: number;
  deltaKg: number | null;   // current - initial
  isLoading: boolean;
  addLog: (weightKg: number, waistCm?: number, notes?: string) => Promise<void>;
  updateLog: (log: BodyLog, weightKg: number, waistCm?: number, notes?: string) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
}

function todayDateStr(): string {
  return getLocalDateISO();
}

function last30DaysStart(): string {
  return getDaysAgoISO(29);
}

export function useProgressData(profileId: ProfileId): ProgressData {
  const profile = getProfileById(profileId);
  const initialWeightKg = profile?.initialWeightKg ?? 0;
  const goalWeightKg = profile?.goalWeightKg ?? initialWeightKg;

  const [logs, setLogs] = useState<BodyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    const all = await bodyLogRepo.getByProfile(profileId);
    const sorted = all.sort((a, b) => a.date.localeCompare(b.date));
    setLogs(sorted);
    setIsLoading(false);
  }, [profileId]);

  useEffect(() => {
    setIsLoading(true);
    reload().catch(console.error);
  }, [reload]);

  const addLog = useCallback(async (weightKg: number, waistCm?: number, notes?: string) => {
    const today = todayDateStr();
    const now = new Date().toISOString();
    const existing = await bodyLogRepo.getByProfile(profileId)
      .then((all) => all.find((l) => l.date === today));

    if (existing) {
      await bodyLogRepo.update({ ...existing, weightKg, waistCm, notes, createdAt: existing.createdAt });
    } else {
      await bodyLogRepo.create({ profileId, date: today, weightKg, waistCm, notes, createdAt: now });
    }
    await reload();
  }, [profileId, reload]);

  const updateLog = useCallback(async (log: BodyLog, weightKg: number, waistCm?: number, notes?: string) => {
    await bodyLogRepo.update({ ...log, weightKg, waistCm, notes });
    await reload();
  }, [reload]);

  const deleteLog = useCallback(async (id: string) => {
    await bodyLogRepo.delete(id);
    await reload();
  }, [reload]);

  const currentWeightKg = logs.length > 0 ? logs[logs.length - 1].weightKg : null;
  const deltaKg = currentWeightKg !== null ? +(currentWeightKg - initialWeightKg).toFixed(1) : null;

  // Keep only last 30 days for chart
  const start30 = last30DaysStart();
  const chartLogs = logs.filter((l) => l.date >= start30);

  // 10 most recent for history list
  const recent = [...logs].reverse().slice(0, 10);

  return {
    logs: chartLogs,
    recent,
    currentWeightKg,
    initialWeightKg,
    goalWeightKg,
    deltaKg,
    isLoading,
    addLog,
    updateLog,
    deleteLog,
  };
}

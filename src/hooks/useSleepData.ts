import { useState, useEffect, useCallback } from 'react';
import type { SleepLog, SleepQuality, ProfileId } from '../types';
import { sleepLogRepo } from '../db/repositories';
import { getLocalDateISO, getDaysAgoISO } from '../utils/dates';

export const SLEEP_TARGET_HOURS = 8;
export const SLEEP_TARGET_MINUTES = SLEEP_TARGET_HOURS * 60;

export interface SleepInput {
  hours: number;
  minutes: number;
  quality: SleepQuality;
  bedtime?: string;
  wakeTime?: string;
  note?: string;
}

export interface SleepStats {
  todayLog: SleepLog | null;
  last7Days: SleepLog[];
  avgMinutesLast7: number | null;
  streak: number;
  isLoading: boolean;
}

export function sleepColor(totalMinutes: number): string {
  if (totalMinutes < 360) return 'text-ios-red';
  if (totalMinutes < 420) return 'text-ios-orange';
  if (totalMinutes <= 540) return 'text-ios-green';
  return 'text-ios-blue';
}

export function sleepProgressColor(totalMinutes: number): string {
  if (totalMinutes < 360) return 'bg-ios-red';
  if (totalMinutes < 420) return 'bg-ios-orange';
  if (totalMinutes <= 540) return 'bg-ios-green';
  return 'bg-ios-blue';
}

export function sleepLabel(totalMinutes: number): string {
  if (totalMinutes === 0) return 'Non renseigné';
  if (totalMinutes < 360) return 'Sommeil insuffisant';
  if (totalMinutes < 420) return 'Sommeil court';
  if (totalMinutes <= 480) return 'Bon sommeil';
  if (totalMinutes <= 540) return 'Excellent repos';
  return 'Sommeil long';
}

export function formatSleepDuration(totalMinutes: number): string {
  if (totalMinutes === 0) return '--';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

export function computeSleepStreak(logs: SleepLog[]): number {
  if (logs.length === 0) return 0;
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  let expected = getLocalDateISO();
  for (const log of sorted) {
    if (log.date === expected) {
      streak++;
      const d = new Date(expected + 'T12:00:00');
      d.setDate(d.getDate() - 1);
      expected = getLocalDateISO(d);
    } else {
      break;
    }
  }
  return streak;
}

export function useSleepData(profileId: ProfileId): SleepStats & {
  addOrUpdateSleep: (input: SleepInput) => Promise<void>;
  reload: () => Promise<void>;
} {
  const [todayLog, setTodayLog] = useState<SleepLog | null>(null);
  const [last7Days, setLast7Days] = useState<SleepLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const today = getLocalDateISO();
  const sevenDaysAgo = getDaysAgoISO(6);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const [allLogs] = await Promise.all([sleepLogRepo.getByProfile(profileId)]);
    const recent = allLogs
      .filter((l) => l.date >= sevenDaysAgo && l.date <= today)
      .sort((a, b) => b.date.localeCompare(a.date));
    const todayEntry = recent.find((l) => l.date === today) ?? null;
    setTodayLog(todayEntry);
    setLast7Days(recent);
    setIsLoading(false);
  }, [profileId, today, sevenDaysAgo]);

  useEffect(() => {
    reload().catch(console.error);
  }, [reload]);

  const addOrUpdateSleep = useCallback(async (input: SleepInput) => {
    const totalMinutes = input.hours * 60 + input.minutes;
    const now = new Date().toISOString();
    const existing = await sleepLogRepo.getByDate(profileId, today);
    if (existing) {
      await sleepLogRepo.update({
        ...existing,
        hours: input.hours,
        minutes: input.minutes,
        totalMinutes,
        quality: input.quality,
        bedtime: input.bedtime,
        wakeTime: input.wakeTime,
        note: input.note,
      });
    } else {
      await sleepLogRepo.create({
        profileId,
        date: today,
        hours: input.hours,
        minutes: input.minutes,
        totalMinutes,
        quality: input.quality,
        bedtime: input.bedtime,
        wakeTime: input.wakeTime,
        note: input.note,
        createdAt: now,
      });
    }
    await reload();
  }, [profileId, today, reload]);

  const avgMinutesLast7 = last7Days.length > 0
    ? Math.round(last7Days.reduce((sum, l) => sum + l.totalMinutes, 0) / last7Days.length)
    : null;

  const streak = computeSleepStreak(last7Days);

  return { todayLog, last7Days, avgMinutesLast7, streak, isLoading, addOrUpdateSleep, reload };
}

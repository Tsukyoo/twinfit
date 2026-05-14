import { useState, useEffect, useCallback } from 'react';
import type { ProfileId } from '../types';
import { bodyLogRepo } from '../db/repositories';
import { getLocalDateISO, getDayOfWeek } from '../utils/dates';

function todayDateStr(): string {
  return getLocalDateISO();
}

function isSunday(): boolean {
  return getDayOfWeek() === 0;
}

function dismissKey(profileId: ProfileId, date: string): string {
  return `weeklyWeighInDismissed:${profileId}:${date}`;
}

function isDismissed(profileId: ProfileId): boolean {
  return localStorage.getItem(dismissKey(profileId, todayDateStr())) === '1';
}

function dismiss(profileId: ProfileId): void {
  localStorage.setItem(dismissKey(profileId, todayDateStr()), '1');
}

export interface WeeklyWeighInPromptState {
  shouldShow: boolean;
  dismiss: () => void;
}

export function useWeeklyWeighInPrompt(profileId: ProfileId): WeeklyWeighInPromptState {
  const [hasTodayLog, setHasTodayLog] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    setDismissed(isDismissed(profileId));

    if (!isSunday()) {
      setHasTodayLog(true);
      return;
    }

    const today = todayDateStr();
    bodyLogRepo.getByProfile(profileId).then((logs) => {
      const hasLog = logs.some((l) => l.date === today);
      setHasTodayLog(hasLog);
    }).catch(() => setHasTodayLog(false));
  }, [profileId]);

  const handleDismiss = useCallback(() => {
    dismiss(profileId);
    setDismissed(true);
  }, [profileId]);

  const shouldShow = isSunday() && hasTodayLog === false && !dismissed;

  return { shouldShow, dismiss: handleDismiss };
}

export function markWeighInDone(profileId: ProfileId): void {
  const today = todayDateStr();
  localStorage.removeItem(dismissKey(profileId, today));
}

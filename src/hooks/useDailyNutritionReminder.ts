import { useState, useEffect, useCallback } from 'react';
import type { ProfileId } from '../types';
import { nutritionLogRepo } from '../db/repositories';
import { getLocalDateISO } from '../utils/dates';

function todayDateStr(): string {
  return getLocalDateISO();
}

function dismissKey(profileId: ProfileId): string {
  return `nutritionReminderDismissed:${profileId}:${todayDateStr()}`;
}

function isDismissed(profileId: ProfileId): boolean {
  return localStorage.getItem(dismissKey(profileId)) === '1';
}

export interface DailyNutritionReminderState {
  shouldShow: boolean;
  dismiss: () => void;
  markFilled: () => void;
}

export function useDailyNutritionReminder(profileId: ProfileId): DailyNutritionReminderState {
  const [hasTodayLog, setHasTodayLog] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(false);

  const checkLog = useCallback(async () => {
    const today = todayDateStr();
    const log = await nutritionLogRepo.getByDate(profileId, today);
    setHasTodayLog(!!log);
  }, [profileId]);

  useEffect(() => {
    setDismissed(isDismissed(profileId));
    checkLog().catch(console.error);
  }, [profileId, checkLog]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(dismissKey(profileId), '1');
    setDismissed(true);
  }, [profileId]);

  const markFilled = useCallback(() => {
    setHasTodayLog(true);
  }, []);

  const shouldShow = hasTodayLog === false && !dismissed;

  return { shouldShow, dismiss: handleDismiss, markFilled };
}

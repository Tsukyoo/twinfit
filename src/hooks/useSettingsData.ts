import { useState, useEffect, useCallback } from 'react';
import type { AppSettings, ProfileId } from '../types';
import { getSettings, saveSettings } from '../utils/storage';
import { getProfileById } from '../data/profiles';
import {
  workoutSessionRepo,
  bodyLogRepo,
  nutritionLogRepo,
} from '../db/repositories';

export interface AppStats {
  sessionCount: number;
  bodyLogCount: number;
  nutritionLogCount: number;
}

export interface SettingsData {
  settings: AppSettings;
  profileName: string;
  stats: AppStats;
  isLoadingStats: boolean;
  toggleTimerSound: () => void;
  toggleReducedMotion: () => void;
}

export function useSettingsData(profileId: ProfileId): SettingsData {
  const [settings, setSettings] = useState<AppSettings>(getSettings);
  const [stats, setStats] = useState<AppStats>({ sessionCount: 0, bodyLogCount: 0, nutritionLogCount: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const profile = getProfileById(profileId);
  const profileName = profile?.name ?? profileId;

  // Load stats from IndexedDB
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [sessions, bodyLogs, nutritionLogs] = await Promise.all([
        workoutSessionRepo.getByProfile(profileId),
        bodyLogRepo.getByProfile(profileId),
        nutritionLogRepo.getByProfile(profileId),
      ]);
      if (!cancelled) {
        setStats({
          sessionCount: sessions.length,
          bodyLogCount: bodyLogs.length,
          nutritionLogCount: nutritionLogs.length,
        });
        setIsLoadingStats(false);
      }
    }
    load().catch(console.error);
    return () => { cancelled = true; };
  }, [profileId]);

  const persist = useCallback((updated: AppSettings) => {
    setSettings(updated);
    saveSettings(updated);
  }, []);

  const toggleTimerSound = useCallback(() => {
    persist({ ...settings, restTimerSound: !settings.restTimerSound });
  }, [settings, persist]);

  const toggleReducedMotion = useCallback(() => {
    persist({ ...settings, reducedMotion: !settings.reducedMotion });
  }, [settings, persist]);

  return {
    settings,
    profileName,
    stats,
    isLoadingStats,
    toggleTimerSound,
    toggleReducedMotion,
  };
}

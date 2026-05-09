import type { AppSettings, ProfileId } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'twinfit_settings',
} as const;

const defaultSettings: AppSettings = {
  theme: 'light',
  restTimerSound: true,
  reducedMotion: false,
  units: 'metric',
};

export function getSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<AppSettings>;
      return { ...defaultSettings, ...parsed };
    }
  } catch {
    // Ignore parsing errors
  }
  return defaultSettings;
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function getSelectedProfile(): ProfileId | undefined {
  const settings = getSettings();
  return settings.selectedProfileId;
}

export function saveSelectedProfile(profileId: ProfileId): void {
  const settings = getSettings();
  settings.selectedProfileId = profileId;
  saveSettings(settings);
}

export function clearSelectedProfile(): void {
  const settings = getSettings();
  delete settings.selectedProfileId;
  saveSettings(settings);
}

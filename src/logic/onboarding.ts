import type { ProfileId } from '../types';

const STORAGE_KEY = 'onboardingCompleted';

export function getOnboardingKey(profileId: ProfileId): string {
  return `${STORAGE_KEY}:${profileId}`;
}

export function isOnboardingCompleted(profileId: ProfileId): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(getOnboardingKey(profileId)) === 'true';
}

export function markOnboardingCompleted(profileId: ProfileId): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getOnboardingKey(profileId), 'true');
}

export function resetOnboarding(profileId: ProfileId): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(getOnboardingKey(profileId));
}

import { useState, useCallback, useEffect } from 'react';
import type { ProfileId } from '../types';
import { isOnboardingCompleted, markOnboardingCompleted, resetOnboarding } from '../logic/onboarding';

export interface UseOnboardingResult {
  isCompleted: boolean;
  complete: () => void;
  reset: () => void;
}

export function useOnboarding(profileId: ProfileId | null): UseOnboardingResult {
  const [isCompleted, setIsCompleted] = useState(true);

  useEffect(() => {
    if (profileId) {
      setIsCompleted(isOnboardingCompleted(profileId));
    } else {
      setIsCompleted(true);
    }
  }, [profileId]);

  const complete = useCallback(() => {
    if (profileId) {
      markOnboardingCompleted(profileId);
      setIsCompleted(true);
    }
  }, [profileId]);

  const reset = useCallback(() => {
    if (profileId) {
      resetOnboarding(profileId);
      setIsCompleted(false);
    }
  }, [profileId]);

  return { isCompleted, complete, reset };
}

import { useState, useEffect, useCallback } from 'react';
import type { ProfileId } from '../types';
import { getProfileById } from '../data/profiles';
import { bodyLogRepo, nutritionLogRepo, workoutSessionRepo, sleepLogRepo } from '../db/repositories';
import {
  generateCoachingRecommendation,
  isCoachDismissedToday,
  dismissCoachForToday,
  type CoachRecommendation,
} from '../logic/dynamicNutritionCoach';

export interface DynamicCoachData {
  recommendation: CoachRecommendation | null;
  isLoading: boolean;
  isDismissed: boolean;
  dismiss: () => void;
  refresh: () => Promise<void>;
}

export function useDynamicNutritionCoach(profileId: ProfileId): DynamicCoachData {
  const [recommendation, setRecommendation] = useState<CoachRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(() => isCoachDismissedToday(profileId));

  const loadRecommendation = useCallback(async () => {
    setIsLoading(true);
    try {
      const profile = getProfileById(profileId);
      if (!profile) {
        setRecommendation(null);
        return;
      }

      // Load all necessary data
      const [bodyLogs, nutritionLogs, workoutSessions, sleepLogs] = await Promise.all([
        bodyLogRepo.getByProfile(profileId),
        nutritionLogRepo.getByProfile(profileId),
        workoutSessionRepo.getByProfile(profileId),
        sleepLogRepo.getByProfile(profileId).catch(() => []),
      ]);

      // Get current weight (last log)
      const sortedLogs = bodyLogs.sort((a, b) => a.date.localeCompare(b.date));
      const currentWeightKg = sortedLogs.length > 0
        ? sortedLogs[sortedLogs.length - 1].weightKg
        : null;

      // Base targets from profile
      const baseCalories = profile.nutritionTargets?.calories ?? (profileId === 'teoman' ? 2500 : 2800);
      const baseProtein = profile.nutritionTargets?.proteinG ?? (profileId === 'teoman' ? 160 : 130);
      const baseWater = profile.nutritionTargets?.waterMl ?? 3000;

      const recommendation = generateCoachingRecommendation({
        profileId,
        initialWeightKg: profile.initialWeightKg,
        goalWeightKg: profile.goalWeightKg,
        currentWeightKg,
        bodyLogs: sortedLogs,
        nutritionLogs,
        workoutSessions,
        sleepLogs,
        baseCalories,
        baseProtein,
        baseWater,
      });

      setRecommendation(recommendation);
    } catch (error) {
      console.error('Failed to load coach recommendation:', error);
      setRecommendation(null);
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  const dismiss = useCallback(() => {
    dismissCoachForToday(profileId);
    setIsDismissed(true);
  }, [profileId]);

  // Initial load
  useEffect(() => {
    loadRecommendation();
  }, [loadRecommendation]);

  // Check dismissal status on mount and when window regains focus
  useEffect(() => {
    const checkDismissal = () => {
      setIsDismissed(isCoachDismissedToday(profileId));
    };

    window.addEventListener('focus', checkDismissal);
    return () => window.removeEventListener('focus', checkDismissal);
  }, [profileId]);

  return {
    recommendation,
    isLoading,
    isDismissed,
    dismiss,
    refresh: loadRecommendation,
  };
}

import { useState, useEffect } from 'react';
import type { ProfileId, WorkoutPlanExercise, Exercise } from '../types';
import { getExerciseRecommendation, type ExerciseRecommendation } from '../logic/progressiveOverload';

export interface UseExerciseRecommendationResult {
  recommendation: ExerciseRecommendation | null;
  isLoading: boolean;
  error: Error | null;
}

export function useExerciseRecommendation(
  profileId: ProfileId | null,
  exerciseId: string | null,
  planExercise: WorkoutPlanExercise | null,
  exercise: Exercise | null
): UseExerciseRecommendationResult {
  const [recommendation, setRecommendation] = useState<ExerciseRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!profileId || !exerciseId || !planExercise || !exercise) {
      setRecommendation(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const reco = await getExerciseRecommendation(profileId!, exerciseId!, planExercise!, exercise!);
        if (!cancelled) {
          setRecommendation(reco);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [profileId, exerciseId, planExercise, exercise]);

  return { recommendation, isLoading, error };
}

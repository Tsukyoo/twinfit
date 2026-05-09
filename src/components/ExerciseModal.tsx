import { useEffect } from 'react';
import { X, Dumbbell, AlertTriangle, TrendingUp, Repeat } from 'lucide-react';
import type { Exercise, WorkoutPlanExercise } from '../types';
import { VideoPreview } from './VideoPreview';
import { getExerciseVideoPath } from '../data/exerciseVideos';
import { cn } from '@utils/cn';

interface ExerciseModalProps {
  exercise: Exercise;
  planEx: WorkoutPlanExercise;
  accentColor: string;
  accentBg: string;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  chest: 'Pectoraux',
  back: 'Dos',
  shoulders: 'Épaules',
  arms: 'Bras',
  legs: 'Jambes',
  core: 'Abdominaux',
  cardio: 'Cardio',
  full_body: 'Corps entier',
};

export function ExerciseModal({
  exercise,
  planEx,
  accentColor,
  accentBg,
  onClose,
}: ExerciseModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll while modal open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const videoPath = getExerciseVideoPath(exercise.id);
  const durationUnit = planEx.trackingType === 'minutes' ? 'min' : planEx.trackingType === 'seconds' ? 'sec' : null;
  const repsLabel = durationUnit
    ? (planEx.minReps === planEx.maxReps ? `${planEx.minReps} ${durationUnit}` : `${planEx.minReps}-${planEx.maxReps} ${durationUnit}`)
    : (planEx.minReps === planEx.maxReps ? `${planEx.minReps} reps` : `${planEx.minReps}-${planEx.maxReps} reps`);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-[480px] bg-background rounded-t-[28px] shadow-apple-lg overflow-hidden max-h-[92vh] flex flex-col">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-text-muted/30" />
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto no-scrollbar flex-1 px-5 pb-28">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 pt-2">
            <div className="flex-1 pr-3">
              <span className={cn('text-xs font-semibold uppercase tracking-wider', accentColor)}>
                {CATEGORY_LABELS[exercise.category] ?? exercise.category}
              </span>
              <h2 className="text-xl font-bold text-text-main mt-0.5 leading-tight">
                {exercise.name}
              </h2>
              <p className="text-sm text-text-secondary mt-0.5">{exercise.machineName}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center flex-shrink-0"
            >
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>

          {/* Sets/Reps summary */}
          <div className="flex gap-3 mb-5">
            {[
              { label: 'Séries', value: `${planEx.targetSets}` },
              { label: durationUnit ? 'Durée' : 'Reps', value: repsLabel },
              { label: 'Repos', value: planEx.restSeconds > 0 ? `${planEx.restSeconds}s` : '—' },
            ].map((stat) => (
              <div
                key={stat.label}
                className={cn('flex-1 rounded-2xl py-3 px-2 text-center', accentBg)}
              >
                <p className={cn('text-lg font-bold', accentColor)}>{stat.value}</p>
                <p className="text-xs text-text-secondary mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Video */}
          <div className="mb-5">
            <VideoPreview
              videoPath={videoPath}
              exerciseName={exercise.name}
              machineName={exercise.machineName}
              primaryMuscles={exercise.primaryMuscles}
              accentColor={accentColor}
              accentBg={accentBg}
            />
          </div>

          {/* Notes */}
          {planEx.notes && (
            <div className="mb-4 px-4 py-3 rounded-2xl bg-ios-orange/10">
              <p className="text-sm text-ios-orange font-medium">{planEx.notes}</p>
            </div>
          )}

          {/* Muscles */}
          <section className="mb-5">
            <h3 className="text-sm font-bold text-text-main mb-3 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-text-muted" />
              Muscles ciblés
            </h3>
            <div className="space-y-2">
              {exercise.primaryMuscles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {exercise.primaryMuscles.map((m) => (
                    <span
                      key={m}
                      className={cn('text-xs font-medium px-2.5 py-1 rounded-full', accentBg, accentColor)}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              )}
              {exercise.secondaryMuscles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {exercise.secondaryMuscles.map((m) => (
                    <span
                      key={m}
                      className="text-xs text-text-secondary px-2.5 py-1 rounded-full bg-surface-muted"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Instructions */}
          <section className="mb-5">
            <h3 className="text-sm font-bold text-text-main mb-3">Exécution</h3>
            <ol className="space-y-2">
              {exercise.instructions.map((instr, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5',
                    accentBg, accentColor
                  )}>
                    {i + 1}
                  </span>
                  <p className="text-sm text-text-secondary leading-relaxed">{instr}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Common mistakes */}
          {exercise.commonMistakes.length > 0 && (
            <section className="mb-5">
              <h3 className="text-sm font-bold text-text-main mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-ios-orange" />
                Erreurs fréquentes
              </h3>
              <ul className="space-y-2">
                {exercise.commonMistakes.map((mistake, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-ios-orange mt-1.5 flex-shrink-0" />
                    <p className="text-sm text-text-secondary">{mistake}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Progression tip */}
          <section className="mb-5">
            <h3 className="text-sm font-bold text-text-main mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-ios-green" />
              Progression
            </h3>
            <div className="px-4 py-3 rounded-2xl bg-ios-green/10">
              <p className="text-sm text-text-secondary">{exercise.progressionTip}</p>
            </div>
          </section>

          {/* Alternatives */}
          {exercise.alternatives.length > 0 && (
            <section className="mb-8">
              <h3 className="text-sm font-bold text-text-main mb-3 flex items-center gap-2">
                <Repeat className="w-4 h-4 text-text-muted" />
                Alternatives
              </h3>
              <div className="flex flex-wrap gap-2">
                {exercise.alternatives.map((alt) => (
                  <span
                    key={alt}
                    className="text-xs text-text-secondary px-2.5 py-1 rounded-full bg-surface-muted"
                  >
                    {alt}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

import { Dumbbell, AlertCircle, ChevronDown, ChevronUp, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@utils/cn';
import { AppleCard } from '@components/AppleCard';
import { getExerciseVideoPath } from '../../data/exerciseVideos';
import type { Exercise, WorkoutPlanExercise, TrackingType } from '../../types';
import type { RecommendationAction, ConfidenceLevel } from '../../logic/progressiveOverload';

interface WorkoutExerciseCardProps {
  exercise: Exercise;
  planEx: WorkoutPlanExercise;
  currentSetIndex: number;
  accentColor: string;
  accentBg: string;
  trackingType?: TrackingType;
  recommendation?: {
    action: RecommendationAction;
    confidence: ConfidenceLevel;
    reason: string;
    recommendedWeightKg?: number;
  } | null;
}

export function WorkoutExerciseCard({
  exercise,
  planEx,
  currentSetIndex,
  accentColor,
  accentBg,
  trackingType,
  recommendation,
}: WorkoutExerciseCardProps) {
  const [showTips, setShowTips] = useState(false);
  const [gifError, setGifError] = useState(false);
  const gifPath = getExerciseVideoPath(exercise.id);

  const isDuration = trackingType === 'minutes' || trackingType === 'seconds';
  const durationUnit = trackingType === 'minutes' ? 'min' : 'sec';

  const setsLabel = `${planEx.targetSets} séries`;
  const repsLabel = isDuration
    ? planEx.minReps === planEx.maxReps
      ? `${planEx.minReps} ${durationUnit}`
      : `${planEx.minReps}–${planEx.maxReps} ${durationUnit}`
    : planEx.minReps === planEx.maxReps
      ? `${planEx.minReps} reps`
      : `${planEx.minReps}–${planEx.maxReps} reps`;

  return (
    <AppleCard className="overflow-hidden">
      {/* GIF Preview */}
      {gifPath && !gifError ? (
        <div className="w-full aspect-square bg-surface-muted overflow-hidden">
          <img
            src={gifPath}
            alt={exercise.name}
            onError={() => setGifError(true)}
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <div className={cn(
          'w-full aspect-square flex flex-col items-center justify-center gap-2',
          'bg-gradient-to-br from-surface-muted to-surface-muted/60'
        )}>
          <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', accentBg)}>
            <Dumbbell className={cn('w-6 h-6', accentColor)} />
          </div>
          <p className="text-xs font-semibold text-text-secondary text-center px-4">{exercise.machineName}</p>
          <p className="text-xs text-text-muted text-center px-6">{exercise.primaryMuscles.join(' · ')}</p>
        </div>
      )}

      {/* Header */}
      <div className="p-4 pb-3">
        {/* Machine name badge */}
        <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-3', accentBg, accentColor)}>
          <Dumbbell className="w-3 h-3" />
          {exercise.machineName}
        </div>

        <h2 className="text-xl font-bold text-text-main leading-tight mb-1">
          {exercise.name}
        </h2>

        {/* Muscles */}
        <div className="flex flex-wrap gap-1 mb-3">
          {exercise.primaryMuscles.map((m) => (
            <span key={m} className={cn('text-xs font-medium px-2 py-0.5 rounded-full', accentBg, accentColor)}>
              {m}
            </span>
          ))}
          {exercise.secondaryMuscles.slice(0, 2).map((m) => (
            <span key={m} className="text-xs text-text-secondary px-2 py-0.5 rounded-full bg-surface-muted">
              {m}
            </span>
          ))}
        </div>

        {/* Sets / reps / rest summary */}
        <div className="flex items-center gap-3">
          <Chip label={setsLabel} />
          <Chip label={repsLabel} />
          <Chip label={`Série ${currentSetIndex + 1}/${planEx.targetSets}`} accent={accentColor} />
        </div>

        {/* Recommendation badge */}
        {recommendation && (
          <div className={cn('mt-3 rounded-xl p-2.5 flex items-center gap-2', getRecColor(recommendation.action))}>
            {getRecIcon(recommendation.action)}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium leading-tight truncate">{recommendation.reason}</p>
              {recommendation.action === 'increase' && recommendation.recommendedWeightKg && (
                <p className="text-[10px] opacity-70">Cible : {recommendation.recommendedWeightKg} kg</p>
              )}
            </div>
            <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', getConfidenceClass(recommendation.confidence))}>
              {recommendation.confidence === 'high' ? 'Confiance élevée' : recommendation.confidence === 'medium' ? 'Confiance moyenne' : 'Confiance faible'}
            </span>
          </div>
        )}
      </div>

      {/* Instructions — collapsible */}
      <button
        onClick={() => setShowTips((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 border-t border-black/5 bg-surface-muted/40 text-left"
      >
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
          Technique & conseils
        </span>
        {showTips
          ? <ChevronUp className="w-4 h-4 text-text-muted" />
          : <ChevronDown className="w-4 h-4 text-text-muted" />}
      </button>

      {showTips && (
        <div className="px-4 py-3 space-y-3 border-t border-black/5">
          {exercise.instructions.length > 0 && (
            <div>
              <p className="text-xs font-bold text-text-main mb-1">Instructions</p>
              <ol className="space-y-1">
                {exercise.instructions.slice(0, 4).map((ins, i) => (
                  <li key={i} className="text-xs text-text-secondary flex gap-2">
                    <span className={cn('font-bold flex-shrink-0', accentColor)}>{i + 1}.</span>
                    {ins}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {exercise.commonMistakes.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-1">
                <AlertCircle className="w-3 h-3 text-ios-red" />
                <p className="text-xs font-bold text-ios-red">Erreurs fréquentes</p>
              </div>
              <ul className="space-y-0.5">
                {exercise.commonMistakes.slice(0, 3).map((m, i) => (
                  <li key={i} className="text-xs text-text-secondary">• {m}</li>
                ))}
              </ul>
            </div>
          )}

          {planEx.notes && (
            <div className="p-2.5 rounded-xl bg-ios-yellow/10">
              <p className="text-xs text-text-main">📌 {planEx.notes}</p>
            </div>
          )}
        </div>
      )}
    </AppleCard>
  );
}

function Chip({ label, accent }: { label: string; accent?: string }) {
  return (
    <span className={cn(
      'text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-muted',
      accent ? accent : 'text-text-secondary'
    )}>
      {label}
    </span>
  );
}

function getRecIcon(action: RecommendationAction) {
  switch (action) {
    case 'increase': return <TrendingUp className="w-4 h-4 flex-shrink-0" />;
    case 'technique': return <Shield className="w-4 h-4 flex-shrink-0" />;
    case 'deload': return <AlertTriangle className="w-4 h-4 flex-shrink-0" />;
    default: return null;
  }
}

function getRecColor(action: RecommendationAction) {
  switch (action) {
    case 'increase': return 'bg-teoman-primary/10 text-teoman-primary';
    case 'technique': return 'bg-ios-yellow/10 text-ios-yellow';
    case 'deload': return 'bg-ios-red/10 text-ios-red';
    default: return 'bg-surface-muted text-text-secondary';
  }
}

function getConfidenceClass(confidence: ConfidenceLevel) {
  switch (confidence) {
    case 'high': return 'bg-white/50 text-teoman-primary';
    case 'medium': return 'bg-white/50 text-ios-yellow';
    case 'low': return 'bg-white/50 text-text-secondary';
  }
}

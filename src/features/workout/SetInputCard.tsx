import * as React from 'react';
import { cn } from '@utils/cn';
import { AppleCard } from '@components/AppleCard';
import { Check, Minus, Plus, AlertCircle, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import type { ActiveSetInput } from '../../hooks/useActiveWorkout';
import type { ExerciseCategory, TrackingType } from '../../types';
import type { RecommendationAction, ConfidenceLevel } from '../../logic/progressiveOverload';

// Categories where weight = 0 is valid (bodyweight / cardio / core time-based)
const BODYWEIGHT_CATEGORIES: ExerciseCategory[] = ['core', 'cardio'];

interface SetInputCardProps {
  input: ActiveSetInput;
  setIndex: number;
  targetSets: number;
  minReps: number;
  maxReps: number;
  gradient: string;
  exerciseCategory: ExerciseCategory;
  trackingType?: TrackingType;
  isBonus?: boolean;
  onChange: (patch: Partial<ActiveSetInput>) => void;
  onValidate: () => void;
  // Progression recommendation
  recommendation?: {
    action: RecommendationAction;
    recommendedWeightKg: number;
    reason: string;
    confidence: ConfidenceLevel;
    lastPerformance?: string;
  } | null;
}

export function SetInputCard({
  input,
  setIndex,
  targetSets,
  minReps,
  maxReps,
  gradient,
  exerciseCategory,
  trackingType,
  isBonus,
  onChange,
  onValidate,
  recommendation,
}: SetInputCardProps) {
  const isBodyweight = BODYWEIGHT_CATEGORIES.includes(exerciseCategory);
  const weightMinimum = isBodyweight ? 0 : 1;
  const isDuration = trackingType === 'minutes' || trackingType === 'seconds';
  const durationUnit = trackingType === 'minutes' ? 'min' : trackingType === 'seconds' ? 'sec' : '';
  const durationStep = trackingType === 'minutes' ? 1 : 5;

  // Auto-fill recommended weight on first render if empty
  const hasAutoFilled = React.useRef(false);
  React.useEffect(() => {
    if (!hasAutoFilled.current && recommendation && input.weightKg === null && !isDuration && !isBodyweight) {
      if (recommendation.action === 'increase' || recommendation.action === 'maintain') {
        onChange({ weightKg: recommendation.recommendedWeightKg });
        hasAutoFilled.current = true;
      }
    }
  }, [recommendation, input.weightKg, isDuration, isBodyweight, onChange]);

  // Validation rules
  const repsOk = input.reps !== null && input.reps > 0;
  const weightOk = isBodyweight
    ? true
    : input.weightKg !== null && input.weightKg >= weightMinimum;
  const weightError = !isBodyweight && input.weightKg !== null && input.weightKg < weightMinimum;
  const canValidate = repsOk && weightOk;

  const stepWeight = (dir: number) => {
    const cur = input.weightKg ?? weightMinimum;
    const next = Math.max(weightMinimum, +(cur + dir * 2.5).toFixed(1));
    onChange({ weightKg: next });
  };

  const stepReps = (dir: number) => {
    const cur = input.reps ?? maxReps;
    const next = Math.max(1, cur + (isDuration ? dir * durationStep : dir));
    onChange({ reps: next });
  };

  const getRecIcon = () => {
    if (!recommendation) return null;
    switch (recommendation.action) {
      case 'increase': return <TrendingUp className="w-3.5 h-3.5" />;
      case 'technique': return <Shield className="w-3.5 h-3.5" />;
      case 'deload': return <AlertTriangle className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const getRecColor = () => {
    if (!recommendation) return '';
    switch (recommendation.action) {
      case 'increase': return 'text-teoman-primary bg-teoman-primary/10';
      case 'technique': return 'text-ios-yellow bg-ios-yellow/10';
      case 'deload': return 'text-ios-red bg-ios-red/10';
      default: return 'text-text-secondary bg-surface-muted';
    }
  };

  const getRecLabel = () => {
    if (!recommendation) return '';
    switch (recommendation.action) {
      case 'increase': return 'Augmenter';
      case 'technique': return 'Technique';
      case 'deload': return 'Réduire';
      default: return 'Maintenir';
    }
  };

  return (
    <AppleCard className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-text-main">
          {isBonus ? 'Série bonus' : `Série ${setIndex + 1} / ${targetSets}`}
        </p>
        <p className="text-xs text-text-secondary">
          {isDuration
            ? `Objectif : ${minReps === maxReps ? minReps : `${minReps}–${maxReps}`} ${durationUnit}`
            : `Objectif : ${minReps === maxReps ? minReps : `${minReps}–${maxReps}`} reps`
          }
        </p>
      </div>

      {/* Recommendation badge */}
      {recommendation && setIndex === 0 && (
        <div className={cn('rounded-xl p-3 mb-4', getRecColor())}>
          <div className="flex items-center gap-2 mb-1">
            {getRecIcon()}
            <span className="text-xs font-semibold uppercase tracking-wide">{getRecLabel()}</span>
            <span className="text-[10px] opacity-70 ml-auto">Confiance {recommendation.confidence === 'high' ? 'élevée' : recommendation.confidence === 'medium' ? 'moyenne' : 'faible'}</span>
          </div>
          <p className="text-xs opacity-90 leading-relaxed">{recommendation.reason}</p>
          {recommendation.lastPerformance && (
            <p className="text-[10px] opacity-60 mt-1">Dernière fois : {recommendation.lastPerformance}</p>
          )}
        </div>
      )}

      {/* Poids + Reps — side by side, each with its own full-width stepper row */}
      <div className="grid grid-cols-2 gap-3 mb-1">
        {/* Weight */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
            {isBodyweight ? 'Poids (optionnel)' : <>Poids (kg) <span className="text-ios-red">*</span></>}
          </label>
          {/* Stepper on its own row above the input */}
          <div className="flex items-center gap-1.5">
            <StepButton icon={<Minus className="w-3.5 h-3.5" />} onClick={() => stepWeight(-1)} />
            <input
              inputMode="decimal"
              type="number"
              min={weightMinimum}
              step={2.5}
              value={input.weightKg ?? ''}
              placeholder={isBodyweight ? '0' : '—'}
              onChange={(e) => {
                const val = e.target.value;
                onChange({ weightKg: val === '' ? null : parseFloat(val) });
              }}
              className={cn(
                'flex-1 min-w-0 text-center text-xl font-bold text-text-main bg-surface-muted rounded-2xl h-12 focus:outline-none focus:ring-2 focus:ring-offset-0',
                weightError && 'ring-2 ring-ios-red bg-ios-red/5'
              )}
            />
            <StepButton icon={<Plus className="w-3.5 h-3.5" />} onClick={() => stepWeight(1)} />
          </div>
        </div>

        {/* Reps / Durée */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
            {isDuration ? <>{durationUnit.toUpperCase()} <span className="text-ios-red">*</span></> : <>Reps <span className="text-ios-red">*</span></>}
          </label>
          <div className="flex items-center gap-1.5">
            <StepButton icon={<Minus className="w-3.5 h-3.5" />} onClick={() => stepReps(-1)} />
            <input
              inputMode="numeric"
              type="number"
              min={1}
              step={1}
              value={input.reps ?? ''}
              placeholder={String(maxReps)}
              onChange={(e) => {
                const val = e.target.value;
                onChange({ reps: val === '' ? null : parseInt(val, 10) });
              }}
              className="flex-1 min-w-0 text-center text-xl font-bold text-text-main bg-surface-muted rounded-2xl h-12 focus:outline-none focus:ring-2 focus:ring-offset-0"
            />
            <StepButton icon={<Plus className="w-3.5 h-3.5" />} onClick={() => stepReps(1)} />
          </div>
        </div>
      </div>

      {/* Weight error message */}
      {weightError && (
        <div className="flex items-center gap-1.5 mb-3 mt-1 px-1">
          <AlertCircle className="w-3.5 h-3.5 text-ios-red flex-shrink-0" />
          <p className="text-xs text-ios-red font-medium">
            Poids minimum 1 kg pour cet exercice
          </p>
        </div>
      )}

      {/* RPE — horizontal scroll, 1–10, min 44px touch target */}
      <div className="mt-4 mb-4">
        <div className="flex items-baseline gap-2 mb-2">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
            RPE
          </label>
          <span className="text-xs text-text-muted">1 facile · 10 max — optionnel</span>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar flex-nowrap pb-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onChange({ rpe: input.rpe === v ? null : v })}
              className={cn(
                'flex-shrink-0 min-w-[44px] h-11 rounded-xl text-sm font-bold transition-all',
                input.rpe === v
                  ? `bg-gradient-to-br ${gradient} text-white shadow-sm`
                  : 'bg-surface-muted text-text-secondary'
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Pain toggle */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-text-main">Douleur ressentie ?</span>
        <button
          type="button"
          onClick={() => onChange({ pain: !input.pain })}
          className={cn(
            'w-12 h-7 rounded-full transition-colors duration-200 relative flex-shrink-0',
            input.pain ? 'bg-ios-red' : 'bg-surface-muted'
          )}
        >
          <div className={cn(
            'absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
            input.pain ? 'translate-x-6' : 'translate-x-1'
          )} />
        </button>
      </div>

      {/* Note */}
      <div className="mb-5">
        <input
          type="text"
          maxLength={80}
          value={input.notes}
          placeholder="Note optionnelle (sensation, fatigue…)"
          onChange={(e) => onChange({ notes: e.target.value })}
          className="w-full px-4 text-sm text-text-main bg-surface-muted rounded-2xl h-11 focus:outline-none focus:ring-2"
        />
      </div>

      {/* Validate */}
      <button
        type="button"
        onClick={onValidate}
        disabled={!canValidate}
        className={cn(
          'w-full py-4 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity',
          `bg-gradient-to-r ${gradient}`,
          !canValidate && 'opacity-40'
        )}
      >
        <Check className="w-4 h-4" />
        Valider la série
      </button>
    </AppleCard>
  );
}

function StepButton({ icon, onClick }: { icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-10 h-12 rounded-xl bg-surface-muted flex items-center justify-center text-text-secondary active:scale-95 transition-transform flex-shrink-0"
    >
      {icon}
    </button>
  );
}

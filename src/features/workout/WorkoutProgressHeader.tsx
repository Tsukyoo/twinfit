import { X, ChevronRight } from 'lucide-react';
import { cn } from '@utils/cn';
import type { WorkoutPlan } from '../../types';

interface WorkoutProgressHeaderProps {
  plan: WorkoutPlan;
  currentExerciseIndex: number;
  gradient: string;
  onAbandon: () => void;
}

export function WorkoutProgressHeader({
  plan,
  currentExerciseIndex,
  gradient,
  onAbandon,
}: WorkoutProgressHeaderProps) {
  const total = plan.exercises.length;
  const done = currentExerciseIndex;

  return (
    <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-black/5 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">
            {plan.name}
          </p>
          <p className="text-sm font-bold text-text-main">
            Exercice {currentExerciseIndex + 1}
            <span className="text-text-muted font-normal">/{total}</span>
          </p>
        </div>
        <button
          onClick={onAbandon}
          className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center"
        >
          <X className="w-4 h-4 text-text-secondary" />
        </button>
      </div>

      {/* Single progress bar — segmented by exercise */}
      <div className="flex items-center gap-0.5 h-1.5">
        {plan.exercises.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-full flex-1 rounded-full transition-all duration-300',
              i < done ? `bg-gradient-to-r ${gradient}` :
              i === done ? 'bg-text-muted/40' : 'bg-surface-muted'
            )}
          />
        ))}
      </div>
    </div>
  );
}

interface ExerciseNavChipProps {
  label: string;
  sub?: string;
  className?: string;
}

export function ExerciseNavChip({ label, sub, className }: ExerciseNavChipProps) {
  return (
    <div className={cn('flex items-center gap-1 text-xs text-text-secondary', className)}>
      <ChevronRight className="w-3 h-3" />
      <span className="font-medium">{label}</span>
      {sub && <span className="text-text-muted">· {sub}</span>}
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Clock, ChevronDown, ChevronUp, Play, Moon } from 'lucide-react';
import type { WorkoutPlan, WorkoutPlanExercise, Exercise, ProfileId } from '../types';
import { getExerciseById } from '../data/exercises';
import { AppleCard } from './AppleCard';
import { ExerciseModal } from './ExerciseModal';
import { cn } from '@utils/cn';

interface WorkoutDayCardProps {
  plan: WorkoutPlan;
  profileId: ProfileId;
  isToday: boolean;
  isPast: boolean;
  accentColor: string;
  accentBg: string;
  gradient: string;
}

const DAY_FR: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
};

export function WorkoutDayCard({
  plan,
  isToday,
  isPast,
  accentColor,
  accentBg,
  gradient,
}: WorkoutDayCardProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(isToday);
  const [selectedExercise, setSelectedExercise] = useState<{
    exercise: Exercise;
    planEx: WorkoutPlanExercise;
  } | null>(null);

  const exerciseCount = plan.exercises.length;
  const estimatedMin = estimateMinutes(plan);
  const dayLabel = DAY_FR[plan.day] ?? plan.day;

  return (
    <>
      <AppleCard
        className={cn(
          'overflow-hidden transition-all duration-300',
          isPast && 'opacity-60'
        )}
      >
        {/* Day header — clickable to expand */}
        <button
          className="w-full p-4 flex items-center gap-3 text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          {/* Day badge */}
          <div
            className={cn(
              'w-12 h-12 rounded-2xl flex flex-col items-center justify-center flex-shrink-0',
              isToday
                ? cn('bg-gradient-to-br text-white', gradient)
                : isPast
                  ? 'bg-surface-muted'
                  : accentBg
            )}
          >
            <span className={cn(
              'text-[10px] font-semibold uppercase',
              isToday ? 'text-white/80' : isPast ? 'text-text-muted' : accentColor
            )}>
              {dayLabel.slice(0, 3)}
            </span>
            <Dumbbell className={cn(
              'w-4 h-4 mt-0.5',
              isToday ? 'text-white' : isPast ? 'text-text-muted' : accentColor
            )} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {isToday && (
              <span className={cn('text-xs font-bold uppercase tracking-wider', accentColor)}>
                Aujourd'hui
              </span>
            )}
            <p className={cn(
              'font-semibold leading-tight',
              isToday ? 'text-text-main' : isPast ? 'text-text-secondary' : 'text-text-main'
            )}>
              {plan.name}
            </p>
            <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              {exerciseCount} ex. · ~{estimatedMin} min
            </p>
          </div>

          {/* Expand chevron */}
          <div className={cn('w-6 h-6 flex items-center justify-center', accentColor)}>
            {expanded
              ? <ChevronUp className="w-4 h-4" />
              : <ChevronDown className="w-4 h-4" />
            }
          </div>
        </button>

        {/* Exercises list — expandable */}
        {expanded && (
          <div className="border-t border-black/5 divide-y divide-black/5">
            {plan.exercises.map((planEx) => {
              const exercise = getExerciseById(planEx.exerciseId);
              if (!exercise) return null;

              const durationUnit = planEx.trackingType === 'minutes' ? 'min' : planEx.trackingType === 'seconds' ? 'sec' : null;
              const repsLabel = durationUnit
                ? (planEx.minReps === planEx.maxReps ? `${planEx.minReps}${durationUnit}` : `${planEx.minReps}-${planEx.maxReps}${durationUnit}`)
                : (planEx.minReps === planEx.maxReps ? `${planEx.minReps}` : `${planEx.minReps}-${planEx.maxReps}`);

              return (
                <button
                  key={planEx.exerciseId}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left active:bg-surface-muted transition-colors"
                  onClick={() => setSelectedExercise({ exercise, planEx })}
                >
                  {/* Order badge */}
                  <span className={cn(
                    'w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0',
                    accentBg, accentColor
                  )}>
                    {planEx.order}
                  </span>

                  {/* Name + machine */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-main truncate">
                      {exercise.name}
                    </p>
                    <p className="text-xs text-text-muted truncate">{exercise.machineName}</p>
                  </div>

                  {/* Sets × reps */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-text-main">
                      {planEx.targetSets}×{repsLabel}
                    </p>
                    <p className="text-xs text-text-muted">{planEx.restSeconds}s repos</p>
                  </div>

                  {/* Play icon hint */}
                  <Play className={cn('w-3.5 h-3.5 flex-shrink-0', accentColor)} />
                </button>
              );
            })}

            {/* Launch CTA if today */}
            {isToday && (
              <div className="px-4 py-3">
                <button
                  onClick={() => navigate(`/workout/${plan.id}`)}
                  className={cn(
                    'w-full py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2',
                    'bg-gradient-to-r', gradient
                  )}
                >
                  <Play className="w-4 h-4 fill-white" />
                  Lancer l'entraînement
                </button>
              </div>
            )}
          </div>
        )}
      </AppleCard>

      {/* Exercise detail modal */}
      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise.exercise}
          planEx={selectedExercise.planEx}
          accentColor={accentColor}
          accentBg={accentBg}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </>
  );
}

// ========== Rest day card ==========

interface RestDayCardProps {
  dayName: string;
  isPast: boolean;
}

export function RestDayCard({ dayName, isPast }: RestDayCardProps) {
  return (
    <AppleCard className={cn('p-4', isPast && 'opacity-50')}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-surface-muted flex items-center justify-center flex-shrink-0">
          <Moon className="w-5 h-5 text-text-muted" />
        </div>
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wide">{dayName}</p>
          <p className="text-sm font-medium text-text-secondary">Repos</p>
        </div>
      </div>
    </AppleCard>
  );
}

// ========== Helpers ==========

function estimateMinutes(plan: WorkoutPlan): number {
  let total = 0;
  for (const ex of plan.exercises) {
    const exercise = getExerciseById(ex.exerciseId);
    if (exercise?.category === 'cardio') {
      total += ex.maxReps * 60;
    } else {
      total += ex.targetSets * (45 + ex.restSeconds);
    }
  }
  return Math.round(total / 60) + 5;
}

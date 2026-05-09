import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Play, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@utils/cn';
import { AppleCard } from '@components/AppleCard';
import { WorkoutProgressHeader } from './WorkoutProgressHeader';
import { WorkoutExerciseCard } from './WorkoutExerciseCard';
import { SetInputCard } from './SetInputCard';
import { RestTimerSheet } from './RestTimerSheet';
import { WorkoutRecapPage } from './WorkoutRecapPage';
import { useActiveWorkout } from '../../hooks/useActiveWorkout';
import { useExerciseRecommendation } from '../../hooks/useExerciseRecommendation';
import { getExerciseById } from '../../data/exercises';
import type { ProfileId } from '../../types';

interface ActiveWorkoutPageProps {
  profileId: ProfileId;
  planId: string;
}

const VISUALS = {
  teoman: {
    gradient: 'from-teoman-primary to-teoman-secondary',
    accentColor: 'text-teoman-primary',
    accentBg: 'bg-teoman-primary/10',
  },
  denizhan: {
    gradient: 'from-denizhan-secondary to-denizhan-primary',
    accentColor: 'text-denizhan-primary',
    accentBg: 'bg-denizhan-primary/10',
  },
} as const;

export function ActiveWorkoutPage({ profileId, planId }: ActiveWorkoutPageProps) {
  const navigate = useNavigate();
  const { state, actions } = useActiveWorkout(profileId, planId);
  const visuals = VISUALS[profileId];
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);

  // ── Loading ────────────────────────────────────────────────────────────
  if (state.phase === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-surface-muted border-t-current animate-spin" />
      </div>
    );
  }

  // ── Abandoned ─────────────────────────────────────────────────────────
  if (state.phase === 'abandoned') {
    navigate('/dashboard', { replace: true });
    return null;
  }

  // ── Recap ──────────────────────────────────────────────────────────────
  if (state.phase === 'completed' && state.session) {
    return (
      <WorkoutRecapPage
        session={state.session}
        profileId={profileId}
        prEvents={state.prEvents}
        gradient={visuals.gradient}
        accentColor={visuals.accentColor}
        onBack={() => navigate('/dashboard', { replace: true })}
      />
    );
  }

  // ── Resume prompt ──────────────────────────────────────────────────────
  if (state.phase === 'resume_prompt' && state.existingSession) {
    const isDifferentPlan = state.existingSession.workoutPlanId !== planId;
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 gap-5">
        <div className="w-16 h-16 rounded-3xl bg-ios-orange/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-ios-orange" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-main mb-2">
            {isDifferentPlan ? 'Séance en cours' : 'Reprendre la séance ?'}
          </h2>
          <p className="text-sm text-text-secondary">
            {isDifferentPlan
              ? `Une séance "${state.existingSession.name}" est déjà active. Abandonne-la pour en lancer une nouvelle.`
              : `Tu as une séance "${state.existingSession.name}" en cours. Veux-tu reprendre là où tu t'es arrêté ?`}
          </p>
        </div>
        <div className="w-full space-y-3">
          {!isDifferentPlan && (
            <button
              onClick={actions.resumeSession}
              className={cn('w-full py-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r', visuals.gradient)}
            >
              <Play className="w-4 h-4 fill-white" />
              Reprendre la séance
            </button>
          )}
          <button
            onClick={() => actions.abandonAndRestart(profileId, planId)}
            className="w-full py-4 rounded-2xl bg-ios-red text-white font-bold text-sm flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            {isDifferentPlan ? 'Abandonner et lancer une nouvelle' : 'Abandonner et recommencer'}
          </button>
          <button
            onClick={() => navigate('/dashboard', { replace: true })}
            className="w-full py-4 rounded-2xl bg-surface-muted text-text-main font-semibold text-sm"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  // ── Guards ─────────────────────────────────────────────────────────────
  if (!state.plan || !state.session) return null;

  const plan = state.plan;
  const planEx = plan.exercises[state.currentExerciseIndex];
  const exercise = planEx ? getExerciseById(planEx.exerciseId) : null;

  // ── Exercise done screen ───────────────────────────────────────────────
  if (state.phase === 'exercise_done') {
    const isLast = state.currentExerciseIndex >= plan.exercises.length - 1;
    const nextEx = !isLast ? plan.exercises[state.currentExerciseIndex + 1] : null;
    const nextExercise = nextEx ? getExerciseById(nextEx.exerciseId) : null;
    const setsForCurrentEx = planEx
      ? state.completedSets.filter((s) => s.exerciseId === planEx.exerciseId)
      : [];
    const bonusAlreadyDone = setsForCurrentEx.some((s) => s.setIndex >= (planEx?.targetSets ?? 0));
    const totalSeriesDone = setsForCurrentEx.length;
    const bonusCount = totalSeriesDone - (planEx?.targetSets ?? 0);

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <WorkoutProgressHeader
          plan={plan}
          currentExerciseIndex={state.currentExerciseIndex}
          gradient={visuals.gradient}
          onAbandon={() => setShowAbandonConfirm(true)}
        />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <div className={cn('w-16 h-16 rounded-3xl flex items-center justify-center bg-gradient-to-br', visuals.gradient)}>
            <ChevronRight className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <p className={cn('text-sm font-bold uppercase tracking-wider mb-1', visuals.accentColor)}>
              Exercice terminé !
            </p>
            {exercise && (
              <h2 className="text-xl font-bold text-text-main mb-1">{exercise.name}</h2>
            )}
            <p className="text-sm text-text-secondary">
              {totalSeriesDone} série{totalSeriesDone > 1 ? 's' : ''} réalisée{totalSeriesDone > 1 ? 's' : ''}
              {bonusCount > 0 && <span className="text-text-muted"> · dont {bonusCount} bonus</span>}
              {' '}· +{state.totalPoints} pts
            </p>
          </div>

          {/* Bonus set option — only if no bonus done yet */}
          {!bonusAlreadyDone && (
            <button
              onClick={actions.addBonusSet}
              className="flex items-center gap-2 text-sm text-text-secondary border border-black/10 rounded-2xl px-4 py-2.5"
            >
              <Plus className="w-4 h-4" />
              Ajouter une série bonus
            </button>
          )}

          {nextExercise && (
            <AppleCard className="w-full p-4">
              <p className="text-xs text-text-secondary mb-1">Prochain exercice</p>
              <p className="font-bold text-text-main">{nextExercise.name}</p>
              <p className="text-xs text-text-muted mt-0.5">{nextExercise.machineName}</p>
            </AppleCard>
          )}

          <div className="w-full space-y-3">
            {isLast ? (
              <button
                onClick={() => actions.finishSession().catch(console.error)}
                className={cn('w-full py-4 rounded-2xl text-white font-bold text-sm bg-gradient-to-r flex items-center justify-center gap-2', visuals.gradient)}
              >
                Terminer la séance
              </button>
            ) : (
              <button
                onClick={actions.nextExercise}
                className={cn('w-full py-4 rounded-2xl text-white font-bold text-sm bg-gradient-to-r flex items-center justify-center gap-2', visuals.gradient)}
              >
                <ChevronRight className="w-4 h-4" />
                Exercice suivant
              </button>
            )}
          </div>
        </div>
        {showAbandonConfirm && (
          <AbandonConfirmModal
            onConfirm={actions.abandonSession}
            onCancel={() => setShowAbandonConfirm(false)}
          />
        )}
      </div>
    );
  }

  // ── Main active screen ────────────────────────────────────────────────
  if (!exercise || !planEx) return null;

  // Get progression recommendation for this exercise
  const { recommendation } = useExerciseRecommendation(
    profileId,
    exercise.id,
    planEx,
    exercise
  );

  // Build "next" label for rest timer.
  // After validateSet, state.currentSetIndex is already the 0-based index of the NEXT set to perform.
  // Display it as 1-based: currentSetIndex + 1.
  const nextLabel = state.currentSetIndex < planEx.targetSets
    ? `Série ${state.currentSetIndex + 1}/${planEx.targetSets}`
    : state.currentExerciseIndex + 1 < plan.exercises.length
      ? `Exercice suivant`
      : 'Fin de séance';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WorkoutProgressHeader
        plan={plan}
        currentExerciseIndex={state.currentExerciseIndex}
        gradient={visuals.gradient}
        onAbandon={() => setShowAbandonConfirm(true)}
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-8">
        {/* Exercise info */}
        <WorkoutExerciseCard
          exercise={exercise}
          planEx={planEx}
          currentSetIndex={state.currentSetIndex}
          accentColor={visuals.accentColor}
          accentBg={visuals.accentBg}
          trackingType={planEx.trackingType}
          recommendation={recommendation}
        />

        {/* Set input */}
        <SetInputCard
          input={state.currentInput}
          setIndex={state.currentSetIndex}
          targetSets={planEx.targetSets}
          minReps={planEx.minReps}
          maxReps={planEx.maxReps}
          gradient={visuals.gradient}
          exerciseCategory={exercise.category}
          trackingType={planEx.trackingType}
          isBonus={state.currentInput.isBonus}
          onChange={actions.updateInput}
          onValidate={() => actions.validateSet().catch(console.error)}
          recommendation={recommendation}
        />

        {/* Previous sets this exercise */}
        {state.completedSets.filter((s) => s.exerciseId === planEx.exerciseId).length > 0 && (
          <AppleCard className="p-4">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-2">
              Séries réalisées
            </p>
            <div className="space-y-1.5">
              {state.completedSets
                .filter((s) => s.exerciseId === planEx.exerciseId)
                .map((s, i) => (
                  <div key={s.id} className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">Série {i + 1}</span>
                    <span className={cn('text-xs font-semibold', visuals.accentColor)}>
                      {planEx.trackingType === 'minutes'
                        ? `${s.reps} min`
                        : planEx.trackingType === 'seconds'
                          ? `${s.reps} sec`
                          : `${s.weightKg} kg × ${s.reps} reps`
                      }{s.rpe ? ` @ RPE ${s.rpe}` : ''}
                    </span>
                  </div>
                ))}
            </div>
          </AppleCard>
        )}
      </div>

      {/* Rest timer overlay */}
      {state.phase === 'rest' && state.restInfo && (
        <RestTimerSheet
          restInfo={state.restInfo}
          secondsLeft={state.restSecondsLeft}
          paused={state.restPaused}
          nextLabel={nextLabel}
          gradient={visuals.gradient}
          accentColor={visuals.accentColor}
          onPause={actions.pauseRest}
          onResume={actions.resumeRest}
          onSkip={actions.skipRest}
        />
      )}

      {/* Abandon confirm */}
      {showAbandonConfirm && (
        <AbandonConfirmModal
          onConfirm={actions.abandonSession}
          onCancel={() => setShowAbandonConfirm(false)}
        />
      )}
    </div>
  );
}

// ── Abandon modal ─────────────────────────────────────────────────────────

function AbandonConfirmModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-[480px] bg-background rounded-t-[28px] shadow-apple-lg">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-text-muted/30" />
        </div>
        <div className="px-6 py-5">
          <div className="w-14 h-14 rounded-2xl bg-ios-red/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-ios-red" />
          </div>
          <h3 className="text-xl font-bold text-text-main text-center mb-2">
            Abandonner la séance ?
          </h3>
          <p className="text-sm text-text-secondary text-center mb-6">
            Ta progression sera perdue. Cette action est irréversible.
          </p>
          <div className="space-y-3">
            <button
              onClick={onConfirm}
              className="w-full py-4 rounded-2xl bg-ios-red text-white font-bold text-sm"
            >
              Oui, abandonner
            </button>
            <button
              onClick={onCancel}
              className="w-full py-4 rounded-2xl bg-surface-muted text-text-main font-semibold text-sm"
            >
              Continuer la séance
            </button>
          </div>
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}

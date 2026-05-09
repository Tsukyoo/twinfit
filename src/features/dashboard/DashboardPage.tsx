import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../app/layout';
import { AppleCard } from '@components/AppleCard';
import { AddWeightSheet } from '@components/AddWeightSheet';
import { Activity, Dumbbell, ChevronRight, Scale, Trophy, Moon, Play, CheckCircle2, Calendar, Flame } from 'lucide-react';
import type { ProfileId } from '../../types';
import { cn } from '@utils/cn';
import { useDashboardData } from '../../hooks/useDashboardData';
import { getProfileById } from '../../data/profiles';
import { useWeeklyWeighInPrompt } from '../../hooks/useWeeklyWeighInPrompt';
import { useDailyNutritionReminder } from '../../hooks/useDailyNutritionReminder';

interface DashboardPageProps {
  profileId: ProfileId;
  onChangeProfile: () => void;
}

const profileVisuals: Record<ProfileId, { gradient: string; accentColor: string; accentBg: string }> = {
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
};

const DAY_FR: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
};

export function DashboardPage({ profileId, onChangeProfile }: DashboardPageProps) {
  const navigate = useNavigate();
  const visuals = profileVisuals[profileId];
  const profile = getProfileById(profileId);
  const data = useDashboardData(profileId);
  const weighIn = useWeeklyWeighInPrompt(profileId);
  const nutritionReminder = useDailyNutritionReminder(profileId);
  const [showWeighInSheet, setShowWeighInSheet] = useState(false);

  const greeting = getGreeting(profile?.name ?? profileId);
  const todayLabel = getTodayLabel();

  return (
    <Layout profileId={profileId} onChangeProfile={onChangeProfile}>
      {/* Greeting */}
      <div>
        <p className="text-text-secondary text-sm">{todayLabel}</p>
        <h1 className="text-3xl font-bold tracking-tight text-text-main mt-0.5">
          {greeting}
        </h1>
      </div>

      {/* ===== Pesée du dimanche ===== */}
      {weighIn.shouldShow && (
        <AppleCard className="overflow-hidden">
          <div className="p-4 flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0', visuals.accentBg)}>
              <Calendar className={cn('w-5 h-5', visuals.accentColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn('text-xs font-bold uppercase tracking-wide', visuals.accentColor)}>Pesée du dimanche</p>
              <p className="text-sm text-text-secondary leading-snug">Ajoute ton poids pour suivre ta progression.</p>
            </div>
          </div>
          <div className="flex gap-2 px-4 pb-4">
            <button
              onClick={() => setShowWeighInSheet(true)}
              className={cn(
                'flex-1 py-2.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r',
                visuals.gradient
              )}
            >
              Ajouter ma pesée
            </button>
            <button
              onClick={weighIn.dismiss}
              className="px-4 py-2.5 rounded-2xl text-sm font-medium text-text-secondary bg-surface-muted"
            >
              Plus tard
            </button>
          </div>
        </AppleCard>
      )}

      {/* ===== Rappel nutrition ===== */}
      {nutritionReminder.shouldShow && (
        <AppleCard className="overflow-hidden">
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-ios-orange/10 flex items-center justify-center flex-shrink-0">
              <Flame className="w-5 h-5 text-ios-orange" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-ios-orange">Nutrition du jour</p>
              <p className="text-sm text-text-secondary leading-snug">Tu n'as pas encore enregistré tes repas.</p>
            </div>
          </div>
          <div className="flex gap-2 px-4 pb-4">
            <button
              onClick={() => navigate('/nutrition')}
              className="flex-1 py-2.5 rounded-2xl text-sm font-bold text-white bg-ios-orange"
            >
              Ajouter mes repas
            </button>
            <button
              onClick={nutritionReminder.dismiss}
              className="px-4 py-2.5 rounded-2xl text-sm font-medium text-text-secondary bg-surface-muted"
            >
              Plus tard
            </button>
          </div>
        </AppleCard>
      )}

      {/* ===== Séance du jour ===== */}
      {data.isLoading ? (
        <AppleCard className="p-6 h-28 animate-pulse bg-surface-muted"><div /></AppleCard>
      ) : data.isRestDay ? (
        <AppleCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-surface-muted flex items-center justify-center">
              <Moon className="w-6 h-6 text-text-muted" />
            </div>
            <div>
              <p className="text-sm text-text-secondary mb-0.5">Aujourd'hui</p>
              <h2 className="text-xl font-bold text-text-main">Repos</h2>
              {data.nextPlan && (
                <p className="text-sm text-text-secondary mt-1">
                  Prochaine séance : <span className="font-medium text-text-main">{DAY_FR[data.nextPlan.day]} — {data.nextPlan.name}</span>
                </p>
              )}
            </div>
          </div>
        </AppleCard>
      ) : (
        <AppleCard
          className={cn('p-6 bg-gradient-to-br text-white overflow-hidden relative', visuals.gradient)}
          interactive={!data.todayCompleted}
          onClick={() => !data.todayCompleted && data.todaysPlan && navigate(`/workout/${data.todaysPlan.id}`)}
        >
          {/* Background decoration */}
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -right-2 top-8 w-16 h-16 rounded-full bg-white/10" />

          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Dumbbell className="w-4 h-4 opacity-90" />
                <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                  Séance du jour
                </span>
                {data.todayCompleted && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/25">
                    Terminée ✓
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold mb-1">
                {data.todaysPlan?.name}
              </h2>
              <p className="text-sm opacity-80">
                {data.todayExerciseCount} exercices · ~{data.todayEstimatedMinutes} min
              </p>
            </div>

            {/* Action button */}
            <div className="w-12 h-12 rounded-full bg-white/25 flex items-center justify-center ml-4 flex-shrink-0">
              {data.todayCompleted
                ? <CheckCircle2 className="w-5 h-5 text-white" />
                : <Play className="w-5 h-5 fill-white text-white ml-0.5" />
              }
            </div>
          </div>

          {/* Exercise chips */}
          {data.todaysPlan && data.todaysPlan.exercises.length > 0 && (
            <div className="relative mt-4 flex gap-2 overflow-hidden">
              {data.todaysPlan.exercises.slice(0, 4).map((_ex, i) => (
                <span
                  key={i}
                  className="text-xs bg-white/20 rounded-full px-2 py-0.5 whitespace-nowrap"
                >
                  #{i + 1}
                </span>
              ))}
              {data.todaysPlan.exercises.length > 4 && (
                <span className="text-xs bg-white/20 rounded-full px-2 py-0.5 whitespace-nowrap">
                  +{data.todaysPlan.exercises.length - 4}
                </span>
              )}
            </div>
          )}
        </AppleCard>
      )}

      {/* ===== Stats rapides ===== */}
      <div className="grid grid-cols-2 gap-4">
        <AppleCard className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', visuals.accentBg)}>
              <Scale className={cn('w-4 h-4', visuals.accentColor)} />
            </div>
            <span className="text-xs text-text-secondary uppercase tracking-wide">Poids</span>
          </div>
          {data.isLoading ? (
            <div className="h-8 w-20 bg-surface-muted rounded animate-pulse" />
          ) : (
            <>
              <p className="text-2xl font-bold text-text-main">
                {data.currentWeightKg !== null ? `${data.currentWeightKg} kg` : '--'}
              </p>
              {data.currentWeightKg === null && (
                <p className="text-xs text-text-muted mt-0.5">Aucune mesure</p>
              )}
            </>
          )}
        </AppleCard>

        <AppleCard className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', visuals.accentBg)}>
              <Trophy className={cn('w-4 h-4', visuals.accentColor)} />
            </div>
            <span className="text-xs text-text-secondary uppercase tracking-wide">Points</span>
          </div>
          {data.isLoading ? (
            <div className="h-8 w-16 bg-surface-muted rounded animate-pulse" />
          ) : (
            <>
              <p className={cn('text-2xl font-bold', visuals.accentColor)}>
                {data.weeklyPoints}
              </p>
              <p className="text-xs text-text-muted mt-0.5">Cette semaine</p>
            </>
          )}
        </AppleCard>
      </div>

      {/* ===== Objectif nutritionnel ===== */}
      {profile && (
        <div>
          <h2 className="text-lg font-bold text-text-main mb-3">
            Objectifs journaliers
          </h2>
          <AppleCard className="p-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className={cn('text-xl font-bold', visuals.accentColor)}>
                  {profile.nutritionTargets.calories}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">kcal</p>
              </div>
              <div>
                <p className={cn('text-xl font-bold', visuals.accentColor)}>
                  {profile.nutritionTargets.proteinG}g
                </p>
                <p className="text-xs text-text-secondary mt-0.5">protéines</p>
              </div>
              <div>
                <p className={cn('text-xl font-bold', visuals.accentColor)}>
                  {profile.nutritionTargets.waterMl / 1000}L
                </p>
                <p className="text-xs text-text-secondary mt-0.5">eau</p>
              </div>
            </div>
          </AppleCard>
        </div>
      )}

      {/* ===== Prochaine séance ===== */}
      {!data.isLoading && data.nextPlan && (
        <AppleCard
          className="p-4"
          interactive={data.nextPlan.id === data.todaysPlan?.id}
          onClick={() => {
            if (data.nextPlan && data.nextPlan.id === data.todaysPlan?.id) {
              navigate(`/workout/${data.nextPlan.id}`);
            }
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-muted flex items-center justify-center">
              <Activity className="w-5 h-5 text-text-secondary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-xs text-text-secondary uppercase tracking-wide">Prochaine séance</p>
                {data.nextPlan.id === data.todaysPlan?.id && !data.todayCompleted && (
                  <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full text-white bg-gradient-to-r', visuals.gradient)}>
                    Aujourd'hui
                  </span>
                )}
                {data.todayCompleted && data.nextPlan.id !== data.todaysPlan?.id && data.isRestDay === false && (
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                    Terminée aujourd'hui ✓
                  </span>
                )}
              </div>
              <p className="font-semibold text-text-main">
                {DAY_FR[data.nextPlan.day]} — {data.nextPlan.name}
              </p>
            </div>
            {data.nextPlan.id === data.todaysPlan?.id && !data.todayCompleted ? (
              <Play className={cn('w-4 h-4 fill-current', visuals.accentColor)} />
            ) : (
              <ChevronRight className="w-4 h-4 text-text-muted" />
            )}
          </div>
        </AppleCard>
      )}
      {/* Weigh-in sheet */}
      {showWeighInSheet && (
        <AddWeightSheet
          lastWeightKg={data.currentWeightKg}
          gradient={visuals.gradient}
          mode="create"
          onSave={async (weightKg, waistCm, notes) => {
            await data.addWeightLog?.(weightKg, waistCm, notes);
          }}
          onClose={() => setShowWeighInSheet(false)}
        />
      )}
    </Layout>
  );
}

// ========== Helpers ==========

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Bonjour, ${name} !`;
  if (hour < 18) return `Bonne après-midi, ${name} !`;
  return `Bonsoir, ${name} !`;
}

function getTodayLabel(): string {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

import { Layout } from '../../app/layout';
import { AppleCard } from '@components/AppleCard';
import { WorkoutDayCard, RestDayCard } from '@components/WorkoutDayCard';
import { Calendar } from 'lucide-react';
import type { ProfileId, WorkoutDay } from '../../types';
import { getWorkoutPlansByProfile } from '../../data/workoutPlans';
import { cn } from '@utils/cn';

interface PlanningPageProps {
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

// Full week order for display (Mon → Sun)
const WEEK_DAYS: { key: string; label: string; short: string }[] = [
  { key: 'monday',    label: 'Lundi',    short: 'Lun' },
  { key: 'tuesday',   label: 'Mardi',    short: 'Mar' },
  { key: 'wednesday', label: 'Mercredi', short: 'Mer' },
  { key: 'thursday',  label: 'Jeudi',    short: 'Jeu' },
  { key: 'friday',    label: 'Vendredi', short: 'Ven' },
  { key: 'saturday',  label: 'Samedi',   short: 'Sam' },
  { key: 'sunday',    label: 'Dimanche', short: 'Dim' },
];

// JS getDay() → day key (0=Sun)
const JS_DAY_TO_KEY: Record<number, string> = {
  0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
  4: 'thursday', 5: 'friday', 6: 'saturday',
};

function getTodayKey(): string {
  return JS_DAY_TO_KEY[new Date().getDay()];
}

function dayIndex(key: string): number {
  const order = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  return order.indexOf(key);
}

export function PlanningPage({ profileId, onChangeProfile }: PlanningPageProps) {
  const visuals = profileVisuals[profileId];
  const plans = getWorkoutPlansByProfile(profileId);
  const todayKey = getTodayKey();
  const todayIdx = dayIndex(todayKey);

  // Build a map: day key → plan
  const planByDay = new Map(plans.map((p) => [p.day as string, p]));

  // Training days only (not rest days)
  const trainingDays = plans.map((p) => p.day as string);

  // Week mini-bar: training days with today highlight
  const weekBarDays = ['monday', 'wednesday', 'friday', 'saturday'];

  return (
    <Layout profileId={profileId} onChangeProfile={onChangeProfile}>
      {/* Page title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-main">Séances</h1>
        <p className="text-text-secondary mt-1">Ton programme hebdomadaire</p>
      </div>

      {/* Week mini overview */}
      <AppleCard className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', visuals.accentBg)}>
            <Calendar className={cn('w-4 h-4', visuals.accentColor)} />
          </div>
          <div>
            <p className="font-semibold text-text-main text-sm">Cette semaine</p>
            <p className="text-xs text-text-secondary">{plans.length} séances · Lun/Mer/Ven/Sam</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {weekBarDays.map((dayKey) => {
            const dIdx = dayIndex(dayKey);
            const isToday = dayKey === todayKey;
            const isPast = dIdx < todayIdx;
            const hasPlan = trainingDays.includes(dayKey);
            const dayShort = WEEK_DAYS.find((d) => d.key === dayKey)?.short ?? dayKey;

            return (
              <div
                key={dayKey}
                className={cn(
                  'flex-1 py-2 rounded-xl text-center text-xs font-semibold transition-all',
                  isToday
                    ? cn('bg-gradient-to-br text-white', visuals.gradient)
                    : hasPlan && isPast
                      ? 'bg-surface-muted text-text-muted line-through'
                      : hasPlan
                        ? cn(visuals.accentBg, visuals.accentColor)
                        : 'bg-surface-muted text-text-muted'
                )}
              >
                {dayShort}
              </div>
            );
          })}
        </div>
      </AppleCard>

      {/* Programme — training days only */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-text-main">Programme</h2>
        {(['monday', 'wednesday', 'friday', 'saturday'] as WorkoutDay[]).map((dayKey) => {
          const plan = planByDay.get(dayKey);
          const dIdx = dayIndex(dayKey);
          const isToday = dayKey === todayKey;
          const isPast = dIdx < todayIdx;
          const dayLabel = WEEK_DAYS.find((d) => d.key === dayKey)?.label ?? dayKey;

          if (!plan) {
            return (
              <RestDayCard key={dayKey} dayName={dayLabel} isPast={isPast} />
            );
          }

          return (
            <WorkoutDayCard
              key={plan.id}
              plan={plan}
              profileId={profileId}
              isToday={isToday}
              isPast={isPast}
              accentColor={visuals.accentColor}
              accentBg={visuals.accentBg}
              gradient={visuals.gradient}
            />
          );
        })}
      </div>
    </Layout>
  );
}

import { useState } from 'react';
import { Layout } from '../../app/layout';
import { AppleCard } from '@components/AppleCard';
import { AddMealSheet } from '@components/AddMealSheet';
import { Beef, Droplets, Flame, Plus, UtensilsCrossed } from 'lucide-react';
import type { ProfileId, NutritionLog } from '../../types';
import { useNutritionData } from '../../hooks/useNutritionData';
import { useDailyNutritionReminder } from '../../hooks/useDailyNutritionReminder';
import { cn } from '@utils/cn';
import { getNow } from '../../utils/dates';

interface NutritionPageProps {
  profileId: ProfileId;
  onChangeProfile: () => void;
}

const profileVisuals: Record<ProfileId, { gradient: string; accentColor: string }> = {
  teoman: { gradient: 'from-teoman-primary to-teoman-secondary', accentColor: 'text-teoman-primary' },
  denizhan: { gradient: 'from-denizhan-secondary to-denizhan-primary', accentColor: 'text-denizhan-primary' },
};

const DAY_FR: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };

export function NutritionPage({ profileId, onChangeProfile }: NutritionPageProps) {
  const visuals = profileVisuals[profileId];
  const { todayLog, history, targets, isLoading, addMeal } = useNutritionData(profileId);
  const nutritionReminder = useDailyNutritionReminder(profileId);
  const [showSheet, setShowSheet] = useState(false);

  const cal    = todayLog?.calories ?? 0;
  const prot   = todayLog?.proteinG ?? 0;
  const waterL = (todayLog?.waterMl ?? 0) / 1000;
  const targetWaterL = targets.waterMl / 1000;

  const pct = (val: number, target: number) =>
    Math.min(100, target > 0 ? Math.round((val / target) * 100) : 0);

  return (
    <Layout profileId={profileId} onChangeProfile={onChangeProfile}>
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-main">Nutrition</h1>
        <p className="text-text-secondary mt-1">Suivi du {getNow().toLocaleDateString('fr-FR', DAY_FR)}</p>
      </div>

      {/* ===== Rappel nutrition ===== */}
      {!isLoading && nutritionReminder.shouldShow && (
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
              onClick={() => setShowSheet(true)}
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

      {/* ===== Progress bars ===== */}
      <AppleCard className="p-5">
        <div className="space-y-5">
          <NutritionBar
            icon={<Flame className="w-4 h-4 text-ios-red" />}
            iconBg="bg-ios-red/10"
            label="Calories"
            value={cal}
            target={targets.calories}
            unit="kcal"
            barColor="bg-ios-red"
            pct={pct(cal, targets.calories)}
            isLoading={isLoading}
          />
          <NutritionBar
            icon={<Beef className="w-4 h-4 text-ios-purple" />}
            iconBg="bg-ios-purple/10"
            label="Protéines"
            value={prot}
            target={targets.proteinG}
            unit="g"
            barColor="bg-ios-purple"
            pct={pct(prot, targets.proteinG)}
            isLoading={isLoading}
          />
          <NutritionBar
            icon={<Droplets className="w-4 h-4 text-ios-lightBlue" />}
            iconBg="bg-ios-lightBlue/10"
            label="Eau"
            value={waterL}
            target={targetWaterL}
            unit="L"
            barColor="bg-ios-lightBlue"
            pct={pct(todayLog?.waterMl ?? 0, targets.waterMl)}
            isLoading={isLoading}
            decimals={1}
          />
        </div>
      </AppleCard>

      {/* Macro detail row (glucides + lipides) */}
      {todayLog && (
        <div className="grid grid-cols-2 gap-3">
          <AppleCard className="p-4">
            <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">Glucides</p>
            <p className="text-xl font-bold text-text-main">{todayLog.carbsG ?? 0}g</p>
            {targets.carbsG && (
              <p className="text-xs text-text-muted mt-0.5">/ {targets.carbsG}g</p>
            )}
          </AppleCard>
          <AppleCard className="p-4">
            <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">Lipides</p>
            <p className="text-xl font-bold text-text-main">{todayLog.fatG ?? 0}g</p>
            {targets.fatG && (
              <p className="text-xs text-text-muted mt-0.5">/ {targets.fatG}g</p>
            )}
          </AppleCard>
        </div>
      )}

      {/* ===== Add meal CTA ===== */}
      <AppleCard
        interactive
        onClick={() => setShowSheet(true)}
        className="p-4 flex items-center justify-center gap-2"
      >
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-white bg-gradient-to-br',
          visuals.gradient
        )}>
          <Plus className="w-4 h-4" />
        </div>
        <span className={cn('font-semibold', visuals.accentColor)}>Ajouter un repas</span>
      </AppleCard>

      {/* ===== History 7 days ===== */}
      <div>
        <h2 className="text-lg font-bold text-text-main mb-3">7 derniers jours</h2>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <AppleCard key={i} className="p-4 h-16 animate-pulse bg-surface-muted"><div /></AppleCard>
            ))}
          </div>
        ) : history.length === 0 ? (
          <AppleCard className="p-8 flex flex-col items-center gap-2">
            <UtensilsCrossed className="w-8 h-8 text-text-muted" />
            <p className="text-sm text-text-secondary">Aucun historique</p>
            <p className="text-xs text-text-muted">Tes repas apparaîtront ici</p>
          </AppleCard>
        ) : (
          <div className="space-y-2">
            {history.map((log) => (
              <HistoryRow key={log.id} log={log} targets={targets} accentColor={visuals.accentColor} />
            ))}
          </div>
        )}
      </div>

      {/* Add meal sheet */}
      {showSheet && (
        <AddMealSheet
          gradient={visuals.gradient}
          onSave={async (...args) => {
            await addMeal(...args);
            nutritionReminder.markFilled();
          }}
          onClose={() => setShowSheet(false)}
        />
      )}
    </Layout>
  );
}

// ========== Sub-components ==========

interface NutritionBarProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
  target: number;
  unit: string;
  barColor: string;
  pct: number;
  isLoading: boolean;
  decimals?: number;
}

function NutritionBar({
  icon, iconBg, label, value, target, unit, barColor, pct, isLoading, decimals = 0,
}: NutritionBarProps) {
  const displayVal = decimals ? value.toFixed(decimals) : Math.round(value);
  const displayTarget = decimals ? target.toFixed(decimals) : target;
  const over = pct >= 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', iconBg)}>
            {icon}
          </div>
          <span className="font-medium text-text-main">{label}</span>
        </div>
        <div className="text-right">
          {isLoading ? (
            <div className="w-20 h-4 bg-surface-muted rounded animate-pulse" />
          ) : (
            <span className={cn('text-sm font-semibold', over ? 'text-ios-orange' : 'text-text-secondary')}>
              {displayVal} / {displayTarget} {unit}
            </span>
          )}
        </div>
      </div>
      <div className="h-2.5 bg-surface-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', over ? 'bg-ios-orange' : barColor)}
          style={{ width: `${isLoading ? 0 : pct}%` }}
        />
      </div>
      {!isLoading && pct > 0 && (
        <p className="text-xs text-text-muted mt-1 text-right">{pct}%</p>
      )}
    </div>
  );
}

interface HistoryRowProps {
  log: NutritionLog;
  targets: { calories: number; proteinG: number; waterMl: number };
  accentColor: string;
}

function HistoryRow({ log, targets, accentColor }: HistoryRowProps) {
  const date = new Date(log.date + 'T12:00:00');
  const label = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  const calPct = Math.min(100, Math.round((log.calories / targets.calories) * 100));

  return (
    <AppleCard className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-text-main capitalize">{label}</p>
            <p className={cn('text-sm font-bold', accentColor)}>
              {log.calories} kcal
            </p>
          </div>
          {/* Mini progress bar */}
          <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-ios-red rounded-full"
              style={{ width: `${calPct}%` }}
            />
          </div>
          <div className="flex gap-3 mt-1.5">
            <span className="text-xs text-text-muted">{log.proteinG}g prot.</span>
            <span className="text-xs text-text-muted">{(log.waterMl / 1000).toFixed(1)}L eau</span>
          </div>
        </div>
      </div>
    </AppleCard>
  );
}

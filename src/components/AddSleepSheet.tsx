import { useState } from 'react';
import { Moon, X, Check } from 'lucide-react';
import { cn } from '@utils/cn';
import type { SleepQuality } from '../types';
import type { SleepInput } from '../hooks/useSleepData';
import { SLEEP_TARGET_HOURS } from '../hooks/useSleepData';

interface AddSleepSheetProps {
  gradient: string;
  accentColor: string;
  existing?: { hours: number; minutes: number; quality: SleepQuality; bedtime?: string; wakeTime?: string; note?: string } | null;
  onSave: (input: SleepInput) => Promise<void>;
  onClose: () => void;
}

const QUALITY_OPTIONS: { value: SleepQuality; label: string; emoji: string; desc: string }[] = [
  { value: 'poor',      label: 'Mauvais',   emoji: '😴', desc: 'Réveils fréquents, fatigue' },
  { value: 'average',   label: 'Moyen',     emoji: '😐', desc: 'Quelques interruptions' },
  { value: 'good',      label: 'Bon',       emoji: '😊', desc: 'Repos correct' },
  { value: 'excellent', label: 'Excellent', emoji: '🌟', desc: 'Profond et récupérateur' },
];

const HOUR_OPTIONS = Array.from({ length: 16 }, (_, i) => i); // 0–15h
const MINUTE_OPTIONS = [0, 15, 30, 45];

export function AddSleepSheet({ gradient, accentColor, existing, onSave, onClose }: AddSleepSheetProps) {
  const [hours, setHours] = useState(existing?.hours ?? 0);
  const [minutes, setMinutes] = useState(existing?.minutes ?? 0);
  const [quality, setQuality] = useState<SleepQuality>(existing?.quality ?? 'good');
  const [bedtime, setBedtime] = useState(existing?.bedtime ?? '');
  const [wakeTime, setWakeTime] = useState(existing?.wakeTime ?? '');
  const [note, setNote] = useState(existing?.note ?? '');
  const [saving, setSaving] = useState(false);

  const totalMinutes = hours * 60 + minutes;
  const pct = Math.min(100, (totalMinutes / (SLEEP_TARGET_HOURS * 60)) * 100);

  const progressColor =
    totalMinutes < 360 ? 'bg-ios-red' :
    totalMinutes < 420 ? 'bg-ios-orange' :
    totalMinutes <= 540 ? 'bg-ios-green' : 'bg-ios-blue';

  const canSave = totalMinutes > 0;

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await onSave({ hours, minutes, quality, bedtime: bedtime || undefined, wakeTime: wakeTime || undefined, note: note || undefined });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const bottomNavSpace = 'calc(80px + env(safe-area-inset-bottom, 0px))';
  const headerSpace = 'calc(16px + env(safe-area-inset-top, 0px))';

  return (
    <div className="fixed inset-0 z-[49]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel: sits between status bar and BottomNav */}
      <div
        className="absolute left-0 right-0 flex justify-center"
        style={{ top: headerSpace, bottom: bottomNavSpace }}
      >
        <div className="w-full max-w-[480px] h-full flex flex-col rounded-t-[32px] bg-background shadow-apple-lg overflow-hidden">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-text-muted/30" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-2 pb-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Moon className={cn('w-5 h-5', accentColor)} />
              <h2 className="text-lg font-bold text-text-main">Mon sommeil</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center">
              <X className="w-4 h-4 text-text-muted" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1 px-6 space-y-6 pb-4">

          {/* Duration display */}
          <div className="text-center">
            {totalMinutes === 0 ? (
              <>
                <p className="text-2xl font-bold text-text-muted">
                  Sélectionne une durée
                </p>
                <p className="text-sm text-text-muted mt-1">
                  Objectif : {SLEEP_TARGET_HOURS}h
                </p>
                <div className="mt-3 h-2 rounded-full bg-surface-muted overflow-hidden" />
              </>
            ) : (
              <>
                <p className="text-5xl font-bold tabular-nums text-text-main">
                  {hours}h{String(minutes).padStart(2, '0')}
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  Objectif : {SLEEP_TARGET_HOURS}h · {pct.toFixed(0)}% atteint
                </p>
                <div className="mt-3 h-2 rounded-full bg-surface-muted overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-300', progressColor)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Hours picker */}
          <div>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-2">Heures</p>
            <div className="flex gap-2 flex-wrap">
              {HOUR_OPTIONS.map((h) => (
                <button
                  key={h}
                  onClick={() => setHours(h)}
                  className={cn(
                    'w-12 h-12 rounded-2xl text-sm font-bold transition-all active:scale-95',
                    hours === h
                      ? `bg-gradient-to-br ${gradient} text-white shadow-md`
                      : 'bg-surface-muted text-text-secondary'
                  )}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          {/* Minutes picker */}
          <div>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-2">Minutes</p>
            <div className="flex gap-3">
              {MINUTE_OPTIONS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMinutes(m)}
                  className={cn(
                    'flex-1 h-12 rounded-2xl text-sm font-bold transition-all active:scale-95',
                    minutes === m
                      ? `bg-gradient-to-br ${gradient} text-white shadow-md`
                      : 'bg-surface-muted text-text-secondary'
                  )}
                >
                  {m === 0 ? '00' : m}min
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-2">Qualité du sommeil</p>
            <div className="grid grid-cols-2 gap-2">
              {QUALITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setQuality(opt.value)}
                  className={cn(
                    'p-3 rounded-2xl text-left transition-all active:scale-95 border-2',
                    quality === opt.value
                      ? 'border-transparent bg-gradient-to-br ' + gradient + ' text-white'
                      : 'border-transparent bg-surface-muted text-text-main'
                  )}
                >
                  <span className="text-2xl block mb-1">{opt.emoji}</span>
                  <p className="text-sm font-bold">{opt.label}</p>
                  <p className={cn('text-xs mt-0.5', quality === opt.value ? 'text-white/80' : 'text-text-muted')}>
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Bedtime / WakeTime */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wide block mb-1.5">
                Coucher
              </label>
              <input
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-muted border border-black/5 text-text-main font-medium text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wide block mb-1.5">
                Réveil
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-muted border border-black/5 text-text-main font-medium text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wide block mb-1.5">
              Note (optionnel)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Rêves, stress, café tard..."
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-muted border border-black/5 text-text-main text-sm placeholder:text-text-muted focus:outline-none resize-none"
            />
          </div>
          </div>

          {/* Sticky footer — always visible above BottomNav */}
          <div className="flex-shrink-0 px-5 pt-3 pb-4 border-t border-black/5 bg-background">
            <button
              onClick={handleSave}
              disabled={!canSave || saving}
              className={cn(
                'w-full py-4 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity bg-gradient-to-r',
                gradient,
                (!canSave || saving) && 'opacity-40'
              )}
            >
              {saving ? (
                <span className="animate-pulse">Enregistrement…</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Enregistrer le sommeil
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

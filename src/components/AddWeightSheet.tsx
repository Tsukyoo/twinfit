import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { cn } from '@utils/cn';

export interface WeightInitialData {
  weightKg: number;
  notes?: string;
}

interface AddWeightSheetProps {
  lastWeightKg: number | null;
  gradient: string;
  mode?: 'create' | 'edit';
  initialData?: WeightInitialData;
  /** Suggested weight to show as placeholder (last weigh-in or initial weight) */
  suggestedWeightKg?: number | null;
  onSave: (weightKg: number, waistCm?: number, notes?: string) => Promise<void>;
  onClose: () => void;
}

export function AddWeightSheet({
  lastWeightKg,
  gradient,
  mode = 'create',
  initialData,
  suggestedWeightKg,
  onSave,
  onClose,
}: AddWeightSheetProps) {
  const [weight, setWeight] = useState<string>(
    initialData ? String(initialData.weightKg) : ''
  );
  const [notes, setNotes]   = useState<string>(initialData?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string>('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleSave = async () => {
    const kg = parseFloat(weight);
    if (isNaN(kg) || kg < 20 || kg > 300) {
      setError('Poids invalide (20–300 kg)');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(kg, undefined, notes || undefined);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const stepWeight = (dir: number) => {
    const cur = parseFloat(weight) || (lastWeightKg ?? 70);
    setWeight(+(cur + dir * 0.1).toFixed(1) + '');
  };

  const bottomNavSpace = 'calc(80px + env(safe-area-inset-bottom, 0px))';

  return (
    <div className="fixed inset-0 z-[48] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-[480px] bg-background rounded-t-[28px] shadow-apple-lg flex flex-col overflow-hidden"
        style={{ marginBottom: bottomNavSpace }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-text-muted/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-text-main">
            {mode === 'edit' ? 'Modifier la pesée' : 'Ajouter une pesée'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {/* Content — not flex-1, just natural height */}
        <div className="px-5 pb-2 space-y-5">
          {/* Weight — big stepper */}
          <div>
            <label className="block text-sm font-semibold text-text-main mb-2">
              Poids (kg) <span className="text-ios-red">*</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => stepWeight(-1)}
                className="w-12 h-12 rounded-2xl bg-surface-muted flex items-center justify-center text-xl font-bold text-text-secondary active:scale-95 transition-transform"
              >
                −
              </button>
              <input
                type="number"
                step="0.1"
                min={20}
                max={300}
                value={weight}
                placeholder={suggestedWeightKg ? String(suggestedWeightKg) : (lastWeightKg ? String(lastWeightKg) : '75.0')}
                onChange={(e) => setWeight(e.target.value)}
                className="flex-1 text-center text-3xl font-bold text-text-main bg-surface-muted rounded-2xl h-14 focus:outline-none focus:ring-2"
              />
              <button
                type="button"
                onClick={() => stepWeight(1)}
                className={cn(
                  'w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold text-white active:scale-95 transition-transform',
                  `bg-gradient-to-br ${gradient}`
                )}
              >
                +
              </button>
            </div>
          </div>

          {/* Notes — optional */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-2">
              Note <span className="text-text-muted text-xs">optionnel</span>
            </label>
            <input
              type="text"
              maxLength={100}
              value={notes}
              placeholder="ex : lendemain de cheat meal"
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 text-sm text-text-main bg-surface-muted rounded-2xl h-11 focus:outline-none focus:ring-2"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-ios-red font-medium">{error}</p>
          )}
        </div>

        {/* Save button — always visible at bottom */}
        <div className="px-5 pt-4 pb-5 flex-shrink-0 bg-background border-t border-black/5 mt-4">
          <button
            onClick={handleSave}
            disabled={!weight || saving}
            className={cn(
              'w-full py-4 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity',
              `bg-gradient-to-r ${gradient}`,
              (!weight || saving) && 'opacity-40'
            )}
          >
            {saving ? (
              <span className="animate-pulse">Enregistrement…</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {mode === 'edit' ? 'Enregistrer les modifications' : 'Enregistrer la pesée'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

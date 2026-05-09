import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { cn } from '@utils/cn';

export interface WeightInitialData {
  weightKg: number;
  waistCm?: number;
  notes?: string;
}

interface AddWeightSheetProps {
  lastWeightKg: number | null;
  gradient: string;
  mode?: 'create' | 'edit';
  initialData?: WeightInitialData;
  onSave: (weightKg: number, waistCm?: number, notes?: string) => Promise<void>;
  onClose: () => void;
}

export function AddWeightSheet({
  lastWeightKg,
  gradient,
  mode = 'create',
  initialData,
  onSave,
  onClose,
}: AddWeightSheetProps) {
  const [weight, setWeight] = useState<string>(
    initialData ? String(initialData.weightKg) : (lastWeightKg ? String(lastWeightKg) : '')
  );
  const [waist, setWaist]   = useState<string>(initialData?.waistCm ? String(initialData.waistCm) : '');
  const [notes, setNotes]   = useState<string>(initialData?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string>('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.classList.add('sheet-open');
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('sheet-open');
    };
  }, []);

  const handleSave = async () => {
    const kg = parseFloat(weight);
    if (isNaN(kg) || kg < 20 || kg > 300) {
      setError('Poids invalide (20–300 kg)');
      return;
    }
    const waistNum = waist ? parseFloat(waist) : undefined;
    if (waist && (isNaN(waistNum!) || waistNum! < 40 || waistNum! > 200)) {
      setError('Tour de taille invalide (40–200 cm)');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(kg, waistNum, notes || undefined);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const stepWeight = (dir: number) => {
    const cur = parseFloat(weight) || (lastWeightKg ?? 70);
    setWeight(+(cur + dir * 0.1).toFixed(1) + '');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[480px] bg-background rounded-t-[28px] shadow-apple-lg flex flex-col" style={{ maxHeight: '82dvh' }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-text-muted/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4">
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

        <div className="px-5 pb-3 space-y-4 overflow-y-auto flex-1 no-scrollbar">
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
                placeholder="75.0"
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

          {/* Waist — optional */}
          <div>
            <label className="block text-sm font-medium text-text-main mb-2">
              Tour de taille (cm) <span className="text-text-muted text-xs">optionnel</span>
            </label>
            <input
              type="number"
              step="0.5"
              min={40}
              max={200}
              value={waist}
              placeholder="80"
              onChange={(e) => setWaist(e.target.value)}
              className="w-full text-center text-lg font-semibold text-text-main bg-surface-muted rounded-2xl h-11 focus:outline-none focus:ring-2"
            />
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
        <div
          className="px-5 pt-3 flex-shrink-0 bg-background border-t border-black/5"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}
        >
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

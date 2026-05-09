import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import type { MealInput } from '../hooks/useNutritionData';
import { cn } from '@utils/cn';

interface AddMealSheetProps {
  gradient: string;
  onSave: (input: MealInput) => Promise<void>;
  onClose: () => void;
}

const EMPTY: MealInput = { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, waterMl: 0 };

interface FieldConfig {
  key: keyof MealInput;
  label: string;
  unit: string;
  step: number;
  max: number;
}

const FIELDS: FieldConfig[] = [
  { key: 'calories', label: 'Calories',    unit: 'kcal', step: 50,  max: 5000 },
  { key: 'proteinG', label: 'Protéines',   unit: 'g',    step: 5,   max: 400  },
  { key: 'carbsG',   label: 'Glucides',    unit: 'g',    step: 10,  max: 600  },
  { key: 'fatG',     label: 'Lipides',     unit: 'g',    step: 5,   max: 300  },
  { key: 'waterMl',  label: 'Eau',         unit: 'mL',   step: 250, max: 5000 },
];

export function AddMealSheet({ gradient, onSave, onClose }: AddMealSheetProps) {
  const [values, setValues] = useState<MealInput>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const set = (key: keyof MealInput, raw: string) => {
    const v = Math.max(0, Number(raw) || 0);
    setValues((prev) => ({ ...prev, [key]: v }));
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onSave(values);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const isEmpty = Object.values(values).every((v) => v === 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[480px] bg-background rounded-t-[28px] shadow-apple-lg overflow-hidden">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-text-muted/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4">
          <h2 className="text-xl font-bold text-text-main">Ajouter un repas</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {/* Fields */}
        <div className="px-5 pb-3 space-y-3">
          {FIELDS.map((field) => (
            <div key={field.key} className="flex items-center gap-3">
              <label className="w-28 text-sm font-medium text-text-main flex-shrink-0">
                {field.label}
              </label>
              <div className="flex-1 flex items-center gap-2">
                {/* Decrement */}
                <button
                  type="button"
                  onClick={() => set(field.key, String(Math.max(0, values[field.key] - field.step)))}
                  className="w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center text-lg font-bold text-text-secondary active:scale-95 transition-transform"
                >
                  −
                </button>

                <input
                  type="number"
                  min={0}
                  max={field.max}
                  step={field.step}
                  value={values[field.key] || ''}
                  placeholder="0"
                  onChange={(e) => set(field.key, e.target.value)}
                  className="flex-1 text-center text-lg font-bold text-text-main bg-surface-muted rounded-xl h-9 focus:outline-none focus:ring-2 focus:ring-offset-1 appearance-none"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' } as React.CSSProperties}
                />

                {/* Increment */}
                <button
                  type="button"
                  onClick={() => set(field.key, String(Math.min(field.max, values[field.key] + field.step)))}
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold text-white active:scale-95 transition-transform',
                    `bg-gradient-to-br ${gradient}`
                  )}
                >
                  +
                </button>

                <span className="text-xs text-text-muted w-8 text-right">{field.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Save button */}
        <div className="px-5 pb-8 pt-4">
          <button
            onClick={handleSave}
            disabled={isEmpty || saving}
            className={cn(
              'w-full py-4 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity',
              `bg-gradient-to-r ${gradient}`,
              (isEmpty || saving) && 'opacity-40'
            )}
          >
            {saving ? (
              <span className="animate-pulse">Enregistrement…</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

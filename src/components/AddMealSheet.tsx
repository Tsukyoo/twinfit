import { useState, useEffect } from 'react';
import { X, Check, Flame, Wheat as WheatIcon, Droplets, Beef } from 'lucide-react';
import type { MealInput } from '../hooks/useNutritionData';
import { cn } from '@utils/cn';

interface AddMealSheetProps {
  gradient: string;
  onSave: (input: MealInput) => Promise<void>;
  onClose: () => void;
}

const EMPTY: MealInput = { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, waterMl: 0 };

interface NutritionCardConfig {
  key: keyof MealInput;
  label: string;
  unit: string;
  step: number;
  max: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const NUTRITION_CARDS: NutritionCardConfig[] = [
  {
    key: 'calories',
    label: 'Calories',
    unit: 'kcal',
    step: 50,
    max: 5000,
    icon: <Flame className="w-5 h-5" />,
    color: 'text-ios-orange',
    bgColor: 'bg-ios-orange/10',
  },
  {
    key: 'proteinG',
    label: 'Protéines',
    unit: 'g',
    step: 5,
    max: 400,
    icon: <Beef className="w-5 h-5" />,
    color: 'text-ios-red',
    bgColor: 'bg-ios-red/10',
  },
  {
    key: 'carbsG',
    label: 'Glucides',
    unit: 'g',
    step: 5,
    max: 600,
    icon: <WheatIcon className="w-5 h-5" />,
    color: 'text-ios-yellow',
    bgColor: 'bg-ios-yellow/10',
  },
  {
    key: 'fatG',
    label: 'Lipides',
    unit: 'g',
    step: 5,
    max: 300,
    icon: <Droplets className="w-5 h-5" />,
    color: 'text-ios-blue',
    bgColor: 'bg-ios-blue/10',
  },
  {
    key: 'waterMl',
    label: 'Eau',
    unit: 'mL',
    step: 250,
    max: 5000,
    icon: <Droplets className="w-5 h-5" />,
    color: 'text-ios-cyan',
    bgColor: 'bg-ios-cyan/10',
  },
];

function NutritionCard({
  config,
  value,
  onChange,
  gradient,
}: {
  config: NutritionCardConfig;
  value: number;
  onChange: (val: number) => void;
  gradient: string;
}) {
  const handleInput = (raw: string) => {
    const v = Math.max(0, Math.min(config.max, Number(raw) || 0));
    onChange(v);
  };

  const decrement = () => onChange(Math.max(0, value - config.step));
  const increment = () => onChange(Math.min(config.max, value + config.step));

  const placeholder = config.key === 'waterMl' ? '0 mL' : '0';

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5">
      {/* Header with icon and label */}
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', config.bgColor, config.color)}>
          {config.icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-text-main">{config.label}</p>
          <p className="text-xs text-text-muted">{config.unit}</p>
        </div>
      </div>

      {/* Input row */}
      <div className="flex items-center gap-3">
        {/* Decrement */}
        <button
          type="button"
          onClick={decrement}
          disabled={value === 0}
          className="w-12 h-12 rounded-xl bg-surface-muted flex items-center justify-center text-xl font-bold text-text-secondary active:scale-95 transition-transform disabled:opacity-30"
        >
          −
        </button>

        {/* Input */}
        <input
          type="number"
          min={0}
          max={config.max}
          step={config.step}
          value={value > 0 ? value : ''}
          placeholder={placeholder}
          onChange={(e) => handleInput(e.target.value)}
          className="flex-1 text-center text-2xl font-bold text-text-main bg-surface-muted rounded-xl h-14 focus:outline-none focus:ring-2 appearance-none"
          style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' } as React.CSSProperties}
        />

        {/* Increment */}
        <button
          type="button"
          onClick={increment}
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white active:scale-95 transition-transform',
            `bg-gradient-to-br ${gradient}`
          )}
        >
          +
        </button>
      </div>

      {/* Quick add chips */}
      <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
        {getQuickChips(config.key).map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => onChange(chip)}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-surface-muted text-text-secondary active:scale-95 transition-transform whitespace-nowrap"
          >
            +{config.key === 'waterMl' && chip >= 1000 ? `${chip / 1000}L` : chip}
          </button>
        ))}
      </div>
    </div>
  );
}

function getQuickChips(key: keyof MealInput): number[] {
  switch (key) {
    case 'calories': return [200, 300, 500, 800];
    case 'proteinG': return [10, 20, 30, 50];
    case 'carbsG': return [15, 30, 50, 80];
    case 'fatG': return [5, 10, 15, 25];
    case 'waterMl': return [250, 500, 750, 1000];
    default: return [];
  }
}

export function AddMealSheet({ gradient, onSave, onClose }: AddMealSheetProps) {
  const [values, setValues] = useState<MealInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const updateValue = (key: keyof MealInput, val: number) => {
    setValues((prev) => ({ ...prev, [key]: val }));
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

  const totalCalories = values.calories;
  const hasValues = totalCalories > 0 || values.proteinG > 0 || values.carbsG > 0 || values.fatG > 0 || values.waterMl > 0;

  const headerSpace = 'calc(64px + env(safe-area-inset-top, 0px))';
  const bottomNavSpace = 'calc(80px + env(safe-area-inset-bottom, 0px))';

  return (
    <div
      className="fixed inset-0 z-[48]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet — anchored between header and BottomNav */}
      <div
        className="absolute left-0 right-0 mx-auto max-w-[480px] bg-[#f5f5f7] rounded-t-[28px] shadow-apple-xl flex flex-col z-[49] overflow-hidden"
        style={{
          top: headerSpace,
          bottom: bottomNavSpace,
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-text-muted/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4 flex-shrink-0 bg-[#f5f5f7]">
          <div>
            <h2 className="text-xl font-bold text-text-main">Ajouter un repas</h2>
            {hasValues && (
              <p className="text-xs text-text-secondary mt-0.5">
                {values.calories > 0 ? `${values.calories} kcal` : 'Saisissez les valeurs'}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-95 transition-transform"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="px-4 pb-4 space-y-3 overflow-y-auto flex-1 no-scrollbar">
          {NUTRITION_CARDS.map((card) => (
            <NutritionCard
              key={card.key}
              config={card}
              value={values[card.key]}
              onChange={(val) => updateValue(card.key, val)}
              gradient={gradient}
            />
          ))}

          {/* Summary card when values entered */}
          {hasValues && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5">
              <p className="text-sm font-semibold text-text-main mb-2">Résumé</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {values.calories > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Calories</span>
                    <span className="font-semibold text-ios-orange">{values.calories} kcal</span>
                  </div>
                )}
                {values.proteinG > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Protéines</span>
                    <span className="font-semibold text-ios-red">{values.proteinG} g</span>
                  </div>
                )}
                {values.carbsG > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Glucides</span>
                    <span className="font-semibold text-ios-yellow">{values.carbsG} g</span>
                  </div>
                )}
                {values.fatG > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Lipides</span>
                    <span className="font-semibold text-ios-blue">{values.fatG} g</span>
                  </div>
                )}
                {values.waterMl > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Eau</span>
                    <span className="font-semibold text-ios-cyan">
                      {values.waterMl >= 1000 ? `${(values.waterMl / 1000).toFixed(1)} L` : `${values.waterMl} mL`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom spacer for scroll */}
          <div className="h-2" />
        </div>

        {/* Sticky footer with save button */}
        <div
          className="px-5 pt-3 pb-4 flex-shrink-0 bg-white/90 backdrop-blur-xl border-t border-black/5 rounded-t-[20px] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
        >
          <button
            onClick={handleSave}
            disabled={!hasValues || saving}
            className={cn(
              'w-full py-4 rounded-2xl text-base font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg',
              `bg-gradient-to-r ${gradient}`,
              (!hasValues || saving) && 'opacity-50 shadow-none'
            )}
          >
            {saving ? (
              <>
                <span className="animate-pulse">Enregistrement…</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Enregistrer le repas
              </>
            )}
          </button>

          {!hasValues && (
            <p className="text-xs text-text-muted text-center mt-2">
              Saisissez au moins une valeur pour enregistrer
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

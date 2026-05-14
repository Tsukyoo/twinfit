import { X, Zap, Clock, Dumbbell, AlertTriangle, ChevronRight } from 'lucide-react';
import { getAllBonusWorkoutTemplates, type BonusWorkoutTemplate } from '../data/bonusWorkoutPlans';
import { cn } from '@utils/cn';

interface BonusWorkoutPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBonus: (planId: string, bonusType: string) => void;
}

const INTENSITY_CONFIG = {
  light: {
    label: 'Légère',
    color: 'text-ios-green',
    bgColor: 'bg-ios-green/10',
  },
  moderate: {
    label: 'Modérée',
    color: 'text-ios-yellow',
    bgColor: 'bg-ios-yellow/10',
  },
  intense: {
    label: 'Intense',
    color: 'text-ios-orange',
    bgColor: 'bg-ios-orange/10',
  },
};

export function BonusWorkoutPicker({ isOpen, onClose, onSelectBonus }: BonusWorkoutPickerProps) {
  const templates = getAllBonusWorkoutTemplates();

  const handleSelect = (template: BonusWorkoutTemplate) => {
    // Use fixed ID format: bonus-{template.id}
    const planId = `bonus-${template.id}`;
    onSelectBonus(planId, template.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="relative w-full sm:w-[420px] sm:max-w-[90vw] bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-ios-purple/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-ios-purple" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-main">Séance bonus</h2>
              <p className="text-xs text-text-muted">Jour de repos — choisis une option</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center active:scale-95 transition-transform"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Warning */}
        <div className="mx-4 mt-4 p-3 rounded-2xl bg-ios-yellow/10 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-ios-yellow flex-shrink-0 mt-0.5" />
          <p className="text-xs text-text-secondary">
            Évite de forcer si tu es fatigué. Une séance bonus doit rester légère et optionnelle.
          </p>
        </div>

        {/* Templates List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {templates.map((template) => {
            const intensity = INTENSITY_CONFIG[template.intensity];
            return (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                className="w-full text-left bg-white rounded-2xl p-4 border border-black/5 shadow-sm active:scale-[0.98] transition-transform"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-text-main">{template.name}</h3>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', intensity.bgColor, intensity.color)}>
                        {intensity.label}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mb-3">{template.description}</p>
                    <div className="flex items-center gap-4 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {template.estimatedDurationMinutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Dumbbell className="w-3.5 h-3.5" />
                        {template.exercises.length} exercices
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-muted flex-shrink-0" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/5 safe-bottom">
          <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
            <span>Maximum 1 bonus/jour compté</span>
            <span>•</span>
            <span>Maximum 2 bonus/semaine comptés</span>
          </div>
        </div>
      </div>
    </div>
  );
}

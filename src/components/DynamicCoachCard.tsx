import { Sparkles, TrendingUp, TrendingDown, Minus, X, AlertCircle, Moon } from 'lucide-react';
import type { CoachRecommendation } from '../logic/dynamicNutritionCoach';
import { cn } from '@utils/cn';

interface DynamicCoachCardProps {
  recommendation: CoachRecommendation | null;
  isLoading: boolean;
  onDismiss: () => void;
  gradient?: string;
  accentColor?: string;
}

export function DynamicCoachCard({
  recommendation,
  isLoading,
  onDismiss,
  gradient: _gradient,
  accentColor: _accentColor,
}: DynamicCoachCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5 animate-pulse">
        <div className="h-4 w-32 bg-surface-muted rounded mb-3" />
        <div className="h-6 w-48 bg-surface-muted rounded" />
      </div>
    );
  }

  if (!recommendation) return null;

  const { verdict, reason, action, confidence, detailMessage, currentCalories, recommendedCalories, calorieDelta, sleepNote } = recommendation;

  // Verdict display config
  const verdictConfig = {
    maintain: {
      icon: <Minus className="w-5 h-5" />,
      color: 'text-ios-green',
      bgColor: 'bg-ios-green/10',
      label: 'Garde tes objectifs',
    },
    increase: {
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-ios-orange',
      bgColor: 'bg-ios-orange/10',
      label: 'Augmente légèrement',
    },
    decrease: {
      icon: <TrendingDown className="w-5 h-5" />,
      color: 'text-ios-blue',
      bgColor: 'bg-ios-blue/10',
      label: 'Réduis légèrement',
    },
    insufficient_data: {
      icon: <AlertCircle className="w-5 h-5" />,
      color: 'text-text-muted',
      bgColor: 'bg-surface-muted',
      label: 'Données insuffisantes',
    },
  };

  const config = verdictConfig[verdict];

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center', config.bgColor, config.color)}>
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Coach dynamique</p>
            <p className={cn('text-sm font-bold', config.color)}>{config.label}</p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center active:scale-95 transition-transform"
        >
          <X className="w-4 h-4 text-text-secondary" />
        </button>
      </div>

      {/* Main message */}
      <p className="text-text-main font-medium mb-2">{reason}</p>
      <p className="text-sm text-text-secondary mb-4">{detailMessage}</p>

      {/* Action box */}
      <div className={cn('rounded-2xl p-4 mb-4', config.bgColor)}>
        <p className={cn('text-sm font-semibold', config.color)}>{action}</p>
      </div>

      {/* Sleep note */}
      {sleepNote && (
        <div className="flex items-start gap-2 rounded-2xl p-3 mb-4 bg-ios-blue/5 border border-ios-blue/10">
          <Moon className="w-4 h-4 text-ios-blue mt-0.5 flex-shrink-0" />
          <p className="text-xs text-text-secondary leading-snug">{sleepNote}</p>
        </div>
      )}

      {/* Stats comparison */}
      {verdict !== 'insufficient_data' && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-surface-muted rounded-2xl p-3">
            <p className="text-xs text-text-muted mb-1">Actuel</p>
            <p className="text-lg font-bold text-text-main">{currentCalories} kcal</p>
          </div>
          <div className={cn('rounded-2xl p-3', config.bgColor)}>
            <p className={cn('text-xs mb-1', config.color)}>Recommandé</p>
            <p className={cn('text-lg font-bold', config.color)}>{recommendedCalories} kcal</p>
            {calorieDelta !== 0 && (
              <p className={cn('text-xs', config.color)}>
                {calorieDelta > 0 ? '+' : ''}{calorieDelta} kcal
              </p>
            )}
          </div>
        </div>
      )}

      {/* Confidence badge */}
      <div className="flex items-center justify-between">
        <div className={cn(
          'px-3 py-1 rounded-full text-xs font-medium',
          confidence === 'high' ? 'bg-ios-green/10 text-ios-green' :
          confidence === 'medium' ? 'bg-ios-yellow/10 text-ios-yellow' :
          'bg-surface-muted text-text-muted'
        )}>
          Confiance : {confidence === 'high' ? 'Élevée' : confidence === 'medium' ? 'Moyenne' : 'Faible'}
        </div>
        
        {verdict === 'insufficient_data' && (
          <p className="text-xs text-text-muted">
            Ajoute une pesée pour activer
          </p>
        )}
      </div>
    </div>
  );
}

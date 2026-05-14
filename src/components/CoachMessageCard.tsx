import type { CoachMessage, CoachTone } from '../logic/coachTone';
import { cn } from '@utils/cn';
import { AlertTriangle, TrendingUp, BarChart2, Swords, Wind, MessageSquare } from 'lucide-react';

interface CoachMessageCardProps {
  msg: CoachMessage;
  compact?: boolean;
  className?: string;
  areaLabel?: string;
}

const TONE_CONFIG: Record<CoachTone, {
  icon: React.ReactNode;
  labelColor: string;
  iconBg: string;
  borderColor: string;
}> = {
  warning: {
    icon: <AlertTriangle className="w-4 h-4" />,
    labelColor: 'text-ios-red',
    iconBg: 'bg-ios-red/10',
    borderColor: 'border-ios-red/20',
  },
  strict: {
    icon: <MessageSquare className="w-4 h-4" />,
    labelColor: 'text-text-main',
    iconBg: 'bg-surface-muted',
    borderColor: 'border-black/10',
  },
  calm: {
    icon: <Wind className="w-4 h-4" />,
    labelColor: 'text-ios-lightBlue',
    iconBg: 'bg-ios-lightBlue/10',
    borderColor: 'border-ios-lightBlue/20',
  },
  rival: {
    icon: <Swords className="w-4 h-4" />,
    labelColor: 'text-ios-orange',
    iconBg: 'bg-ios-orange/10',
    borderColor: 'border-ios-orange/20',
  },
  motivating: {
    icon: <TrendingUp className="w-4 h-4" />,
    labelColor: 'text-ios-green',
    iconBg: 'bg-ios-green/10',
    borderColor: 'border-ios-green/20',
  },
  analytical: {
    icon: <BarChart2 className="w-4 h-4" />,
    labelColor: 'text-ios-blue',
    iconBg: 'bg-ios-blue/10',
    borderColor: 'border-ios-blue/20',
  },
};

export function CoachMessageCard({ msg, compact = false, className, areaLabel }: CoachMessageCardProps) {
  const cfg = TONE_CONFIG[msg.tone];

  return (
    <div className={cn(
      'rounded-2xl border bg-background flex items-start gap-3',
      compact ? 'p-3' : 'p-4',
      cfg.borderColor,
      className
    )}>
      <div className={cn(
        'rounded-xl flex items-center justify-center flex-shrink-0',
        compact ? 'w-7 h-7' : 'w-9 h-9',
        cfg.iconBg,
        cfg.labelColor
      )}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={cn('font-semibold leading-tight', cfg.labelColor, compact ? 'text-xs' : 'text-sm')}>
            {msg.title}
          </p>
          {areaLabel && (
            <span className="text-[10px] font-medium text-text-muted bg-surface-muted rounded-full px-1.5 py-0.5 leading-none">
              {areaLabel}
            </span>
          )}
        </div>
        <p className={cn('text-text-secondary leading-snug', compact ? 'text-xs' : 'text-sm')}>
          {msg.message}
        </p>
      </div>
    </div>
  );
}

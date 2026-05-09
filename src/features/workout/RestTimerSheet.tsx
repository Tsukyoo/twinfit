import { Play, Pause, SkipForward, Clock } from 'lucide-react';
import { cn } from '@utils/cn';
import type { RestInfo } from '../../logic/workoutSession';

interface RestTimerSheetProps {
  restInfo: RestInfo;
  secondsLeft: number;
  paused: boolean;
  nextLabel: string;      // e.g. "Série 3/4" or "Exercice suivant"
  gradient: string;
  accentColor: string;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
}

export function RestTimerSheet({
  restInfo,
  secondsLeft,
  paused,
  nextLabel,
  gradient,
  accentColor,
  onPause,
  onResume,
  onSkip,
}: RestTimerSheetProps) {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const pct = restInfo.durationSeconds > 0
    ? (secondsLeft / restInfo.durationSeconds) * 100
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onSkip} />

      <div className="relative w-full max-w-[480px] bg-background rounded-t-[32px] shadow-apple-lg overflow-hidden">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-text-muted/30" />
        </div>

        <div className="px-6 pb-10 pt-2">
          {/* Label */}
          <div className="flex items-center gap-2 mb-4">
            <Clock className={cn('w-4 h-4', accentColor)} />
            <p className={cn('text-xs font-bold uppercase tracking-wider', accentColor)}>
              Temps de repos
            </p>
            <span className="ml-auto text-xs text-text-muted">
              Repos prévu : {restInfo.displayLabel}
            </span>
          </div>

          {/* Circular-ish progress ring using SVG */}
          <div className="flex justify-center mb-5">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Track */}
                <circle
                  cx="50" cy="50" r="44"
                  fill="none"
                  stroke="rgb(var(--color-surface-muted, 240 240 243))"
                  strokeWidth="6"
                />
                {/* Progress */}
                <circle
                  cx="50" cy="50" r="44"
                  fill="none"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct / 100)}`}
                  className={cn('transition-all duration-1000', `stroke-current ${accentColor}`)}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              {/* Time display in center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold tabular-nums text-text-main">
                  {timeStr}
                </span>
                {paused && (
                  <span className="text-xs text-text-muted mt-1">En pause</span>
                )}
              </div>
            </div>
          </div>

          {/* Next label */}
          <p className="text-center text-sm text-text-secondary mb-6">
            Prochain : <span className="font-semibold text-text-main">{nextLabel}</span>
          </p>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {/* Pause / Resume */}
            <button
              onClick={paused ? onResume : onPause}
              className="w-14 h-14 rounded-2xl bg-surface-muted flex items-center justify-center active:scale-95 transition-transform"
            >
              {paused
                ? <Play className="w-6 h-6 text-text-main ml-0.5" />
                : <Pause className="w-6 h-6 text-text-main" />}
            </button>

            {/* Skip */}
            <button
              onClick={onSkip}
              className={cn(
                'flex-1 h-14 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform bg-gradient-to-r',
                gradient
              )}
            >
              <SkipForward className="w-4 h-4" />
              Passer le repos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

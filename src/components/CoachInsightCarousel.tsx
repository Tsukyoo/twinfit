import { useRef, useState } from 'react';
import type { CoachMessage } from '../logic/coachTone';
import { CoachMessageCard } from './CoachMessageCard';
import { cn } from '@utils/cn';

interface CoachInsightCarouselProps {
  messages: CoachMessage[];
  compact?: boolean;
  className?: string;
}

const AREA_LABEL: Partial<Record<string, string>> = {
  nutrition: 'Nutrition',
  sleep: 'Sommeil',
  duel: 'Duel',
  workout: 'Séance',
  progress: 'Progrès',
  recovery: 'Récupération',
  dashboard: 'Coach',
};

export function CoachInsightCarousel({ messages, compact = true, className }: CoachInsightCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Single message — no carousel overhead
  if (messages.length === 0) return null;
  if (messages.length === 1) {
    return (
      <CoachMessageCard
        msg={messages[0]}
        compact={compact}
        className={className}
        areaLabel={AREA_LABEL[messages[0].area]}
      />
    );
  }

  // Update dot on scroll
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.offsetWidth);
    setActiveIndex(idx);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Scrollable track */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-0 no-scrollbar"
        style={{ scrollbarWidth: 'none' }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className="snap-center flex-shrink-0 w-full"
          >
            <CoachMessageCard
              msg={msg}
              compact={compact}
              areaLabel={AREA_LABEL[msg.area]}
            />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-1.5">
        {messages.map((_, i) => (
          <button
            key={i}
            aria-label={`Conseil ${i + 1}`}
            onClick={() => {
              const el = scrollRef.current;
              if (!el) return;
              el.scrollTo({ left: i * el.offsetWidth, behavior: 'smooth' });
            }}
            className={cn(
              'rounded-full transition-all duration-200',
              i === activeIndex
                ? 'w-4 h-1.5 bg-text-secondary'
                : 'w-1.5 h-1.5 bg-text-muted/40'
            )}
          />
        ))}
      </div>
    </div>
  );
}

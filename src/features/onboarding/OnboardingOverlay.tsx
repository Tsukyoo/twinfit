import { useState, useCallback } from 'react';
import { X, ChevronRight, Dumbbell, UtensilsCrossed, Trophy, TrendingUp, Sparkles } from 'lucide-react';
import { cn } from '@utils/cn';
import type { ProfileId } from '../../types';

interface OnboardingOverlayProps {
  profileId: ProfileId;
  onComplete: () => void;
  onSkip?: () => void;
}

interface Slide {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    icon: <Sparkles className="w-8 h-8" />,
    title: 'Bienvenue sur TwinFit',
    description: 'Ton compagnon salle pour suivre tes entraînements, ta nutrition et ta progression.',
  },
  {
    id: 2,
    icon: <Dumbbell className="w-8 h-8" />,
    title: 'Mode Séance',
    description: 'Pendant tes séances, TwinFit suit automatiquement tes performances et recommande quand progresser.',
    highlight: 'séries · reps · poids · timer repos',
  },
  {
    id: 3,
    icon: <UtensilsCrossed className="w-8 h-8" />,
    title: 'Nutrition',
    description: 'Remplis ta nutrition chaque jour pour améliorer ton Duel et ta progression.',
    highlight: 'calories · protéines · eau · rappels',
  },
  {
    id: 4,
    icon: <Trophy className="w-8 h-8" />,
    title: 'Le Duel',
    description: 'Chaque semaine, un gagnant est désigné selon vos performances et votre régularité.',
    highlight: 'classement · streaks · gagnant semaine',
  },
  {
    id: 5,
    icon: <TrendingUp className="w-8 h-8" />,
    title: 'Progression Intelligente',
    description: 'TwinFit analyse tes performances et te pousse à progresser automatiquement.',
    highlight: 'recommandations · surcharge progressive',
  },
];

export function OnboardingOverlay({ profileId, onComplete, onSkip }: OnboardingOverlayProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const isLastSlide = currentSlide === SLIDES.length - 1;
  const slide = SLIDES[currentSlide];

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      setIsExiting(true);
      setTimeout(onComplete, 300);
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  }, [isLastSlide, onComplete]);

  const handleSkip = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onSkip?.();
      onComplete();
    }, 300);
  }, [onComplete, onSkip]);

  const handleDotClick = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const accentColor = profileId === 'teoman' ? 'text-teoman-primary' : 'text-denizhan-primary';
  const accentBg = profileId === 'teoman' ? 'bg-teoman-primary' : 'bg-denizhan-primary';
  const gradient = profileId === 'teoman'
    ? 'from-teoman-primary to-teoman-secondary'
    : 'from-denizhan-secondary to-denizhan-primary';

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-black/60 backdrop-blur-sm',
        'transition-opacity duration-300',
        isExiting ? 'opacity-0' : 'opacity-100'
      )}
    >
      {/* Close button */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
        aria-label="Passer le tutoriel"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Skip text - desktop */}
      <button
        onClick={handleSkip}
        className="absolute top-4 left-4 text-sm text-white/60 hover:text-white transition-colors hidden sm:block"
      >
        Passer
      </button>

      {/* Main card */}
      <div
        className={cn(
          'relative w-full max-w-sm mx-4',
          'bg-white/95 backdrop-blur-xl',
          'rounded-3xl shadow-2xl',
          'overflow-hidden',
          'transition-all duration-300',
          isExiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        )}
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-surface-muted">
          <div
            className={cn('h-full transition-all duration-300', accentBg)}
            style={{ width: `${((currentSlide + 1) / SLIDES.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 pt-10">
          {/* Icon */}
          <div
            className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center mb-6',
              'bg-gradient-to-br',
              gradient,
              'text-white shadow-lg'
            )}
          >
            {slide.icon}
          </div>

          {/* Title */}
          <h2 className={cn('text-2xl font-bold mb-3', accentColor)}>
            {slide.title}
          </h2>

          {/* Description */}
          <p className="text-text-secondary leading-relaxed mb-4">
            {slide.description}
          </p>

          {/* Highlight */}
          {slide.highlight && (
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
              {slide.highlight}
            </p>
          )}
        </div>

        {/* Bottom section */}
        <div className="px-8 pb-8">
          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-200',
                  index === currentSlide
                    ? cn('w-6', accentBg)
                    : 'bg-surface-muted hover:bg-text-muted'
                )}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleNext}
            className={cn(
              'w-full py-4 rounded-2xl',
              'bg-gradient-to-r',
              gradient,
              'text-white font-semibold',
              'flex items-center justify-center gap-2',
              'shadow-lg shadow-black/10',
              'hover:shadow-xl hover:shadow-black/15',
              'active:scale-[0.98]',
              'transition-all duration-200'
            )}
          >
            {isLastSlide ? (
              <>Commencer l&apos;entraînement</>
            ) : (
              <>
                Suivant
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Slide counter */}
          <p className="text-center text-xs text-text-muted mt-4">
            {currentSlide + 1} / {SLIDES.length}
          </p>
        </div>
      </div>

      {/* Background decoration */}
      <div
        className={cn(
          'absolute inset-0 -z-10',
          'bg-gradient-to-br',
          profileId === 'teoman'
            ? 'from-teoman-primary/20 via-transparent to-denizhan-primary/10'
            : 'from-denizhan-primary/20 via-transparent to-teoman-primary/10',
          'pointer-events-none'
        )}
      />
    </div>
  );
}

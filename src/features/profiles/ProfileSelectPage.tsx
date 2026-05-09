import { AppleCard } from '@components/AppleCard';
import { Activity, ChevronRight, Target, Weight } from 'lucide-react';
import type { ProfileId } from '../../types';
import { cn } from '@utils/cn';
import { getAllProfiles } from '../../data/profiles';

interface ProfileSelectPageProps {
  onSelectProfile: (profileId: ProfileId) => void;
}

const profileVisuals: Record<ProfileId, { gradient: string; accent: string }> = {
  denizhan: {
    gradient: 'from-denizhan-secondary to-denizhan-primary',
    accent: 'text-denizhan-primary',
  },
  teoman: {
    gradient: 'from-teoman-primary to-teoman-secondary',
    accent: 'text-teoman-primary',
  },
};

const DAY_LABELS: Record<string, string> = {
  monday: 'Lun',
  wednesday: 'Mer',
  friday: 'Ven',
  saturday: 'Sam',
};

export function ProfileSelectPage({ onSelectProfile }: ProfileSelectPageProps) {
  const profiles = getAllProfiles();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-[28px] bg-gradient-to-br from-ios-orange to-ios-red flex items-center justify-center shadow-apple-lg">
          <Activity className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-text-main mb-2">
          TwinFit
        </h1>
        <p className="text-text-secondary text-sm">
          L'expérience fitness exclusive
        </p>
      </div>

      {/* Section title */}
      <p className="text-xs text-text-muted uppercase tracking-widest mb-4">
        Qui s'entraîne aujourd'hui ?
      </p>

      {/* Profile Cards */}
      <div className="w-full max-w-sm space-y-4">
        {profiles.map((profile) => {
          const visuals = profileVisuals[profile.id];
          return (
            <AppleCard
              key={profile.id}
              interactive
              onClick={() => onSelectProfile(profile.id)}
              className="p-5"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className={cn(
                    'w-14 h-14 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0',
                    visuals.gradient
                  )}
                >
                  <span className="text-white font-bold text-xl">
                    {profile.name[0]}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-lg text-text-main">
                    {profile.name}
                  </h2>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Target className="w-3 h-3 text-text-muted" />
                    <p className="text-sm text-text-secondary truncate">
                      {profile.goal}
                    </p>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <Weight className="w-3 h-3 text-text-muted" />
                      <span className="text-xs text-text-muted">
                        {profile.initialWeightKg} kg
                      </span>
                    </div>
                    <span className="text-text-muted text-xs">·</span>
                    <div className="flex gap-1">
                      {profile.trainingDays.map((day) => (
                        <span
                          key={day}
                          className={cn(
                            'text-xs font-medium px-1 py-0.5 rounded',
                            visuals.accent,
                            'bg-black/5'
                          )}
                        >
                          {DAY_LABELS[day] ?? day}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Chevron */}
                <ChevronRight className="w-5 h-5 text-text-muted flex-shrink-0" />
              </div>
            </AppleCard>
          );
        })}
      </div>

      {/* Footer */}
      <p className="mt-12 text-xs text-text-muted text-center">
        TwinFit v0.1 · Basic Fit Edition
      </p>
    </div>
  );
}

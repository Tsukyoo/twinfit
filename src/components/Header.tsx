import { cn } from '@utils/cn';
import { Activity, ChevronRight } from 'lucide-react';
import type { ProfileId } from '../types';

interface HeaderProps {
  profileId?: ProfileId;
  onChangeProfile?: () => void;
  className?: string;
}

const profileConfig: Record<ProfileId, { name: string; initial: string; gradient: string }> = {
  teoman: {
    name: 'Teoman',
    initial: 'T',
    gradient: 'from-teoman-primary to-teoman-secondary',
  },
  denizhan: {
    name: 'Denizhan',
    initial: 'D',
    gradient: 'from-denizhan-secondary to-denizhan-primary',
  },
};

export function Header({ profileId, onChangeProfile, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 glass-header',
        className
      )}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="h-16 px-4 flex items-center justify-between">
        {/* Logo / App Name */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ios-orange to-ios-red flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-text-main">
            TwinFit
          </span>
        </div>

        {/* Profile Info */}
        {profileId && profileConfig[profileId] ? (
          <button
            onClick={onChangeProfile}
            className="flex items-center gap-3 active:scale-95 transition-transform"
          >
            <div
              className={cn(
                'w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center',
                profileConfig[profileId].gradient
              )}
            >
              <span className="text-white font-semibold text-sm">
                {profileConfig[profileId].initial}
              </span>
            </div>
            <span className="font-medium text-sm text-text-main hidden sm:inline">
              {profileConfig[profileId].name}
            </span>
            <ChevronRight className="w-4 h-4 text-text-secondary" />
          </button>
        ) : (
          <div className="text-sm text-text-secondary">
            Sélectionner un profil
          </div>
        )}
      </div>
    </header>
  );
}

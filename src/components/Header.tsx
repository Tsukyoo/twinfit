import { cn } from '@utils/cn';
import { Activity, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ProfileId } from '../types';

interface HeaderProps {
  profileId?: ProfileId;
  onChangeProfile?: () => void;
  className?: string;
  showSettings?: boolean;
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

export function Header({ profileId, className, showSettings = true }: HeaderProps) {
  const navigate = useNavigate();
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

        {/* Right side: profile avatar + settings */}
        <div className="flex items-center gap-2">
          {profileId && profileConfig[profileId] && (
            <div
              className={cn(
                'w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center',
                profileConfig[profileId].gradient
              )}
            >
              <span className="text-white font-semibold text-xs">
                {profileConfig[profileId].initial}
              </span>
            </div>
          )}
          {showSettings && (
            <button
              onClick={() => navigate('/settings')}
              className="w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Paramètres"
            >
              <Settings className="w-5 h-5 text-text-secondary" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

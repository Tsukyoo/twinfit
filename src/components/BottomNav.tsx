import { cn } from '@utils/cn';
import { LayoutDashboard, Dumbbell, Beef, TrendingUp, Trophy } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import type { ProfileId, TabId } from '../types';

interface BottomNavProps {
  profileId?: ProfileId;
}

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Résumé', icon: <LayoutDashboard className="w-5 h-5" />, path: '#/dashboard' },
  { id: 'planning', label: 'Séance', icon: <Dumbbell className="w-5 h-5" />, path: '#/planning' },
  { id: 'nutrition', label: 'Nutrition', icon: <Beef className="w-5 h-5" />, path: '#/nutrition' },
  { id: 'progress', label: 'Progrès', icon: <TrendingUp className="w-5 h-5" />, path: '#/progress' },
  { id: 'leaderboard', label: 'Duel', icon: <Trophy className="w-5 h-5" />, path: '#/leaderboard' },
];

function getActiveTab(pathname: string): TabId {
  if (pathname.includes('/dashboard')) return 'dashboard';
  if (pathname.includes('/planning')) return 'planning';
  if (pathname.includes('/nutrition')) return 'nutrition';
  if (pathname.includes('/progress')) return 'progress';
  if (pathname.includes('/leaderboard')) return 'leaderboard';
  return 'dashboard';
}

export function BottomNav({ profileId }: BottomNavProps) {
  const location = useLocation();
  const activeTab = getActiveTab(location.pathname + location.hash);

  // Determine accent color based on profile
  const accentClass = profileId === 'denizhan' 
    ? 'text-denizhan-primary' 
    : 'text-teoman-primary';

  return (
    <nav className="bottom-nav-bar fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 safe-bottom">
      <div className="max-w-mobile mx-auto">
        <div className="glass-nav px-2 py-2 flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                to={item.path.replace('#', '')}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200',
                  'min-w-[56px]',
                  isActive 
                    ? cn('bg-gray-100', accentClass) 
                    : 'text-text-secondary hover:text-text-main'
                )}
              >
                {item.icon}
                <span className={cn(
                  'text-[10px] font-medium',
                  isActive ? 'font-semibold' : ''
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

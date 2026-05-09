import { Header } from '@components/Header';
import { BottomNav } from '@components/BottomNav';
import type { ProfileId } from '../types';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  profileId?: ProfileId;
  onChangeProfile?: () => void;
  showNav?: boolean;
  showHeader?: boolean;
}

export function Layout({
  children,
  profileId,
  onChangeProfile,
  showNav = true,
  showHeader = true,
}: LayoutProps) {
  return (
    <div className="mobile-frame">
      {showHeader && (
        <Header
          profileId={profileId}
          onChangeProfile={onChangeProfile}
        />
      )}
      
      <main className={showNav ? 'pb-24' : ''}>
        <div className="px-4 pt-3 pb-6 space-y-4">
          {children}
        </div>
      </main>

      {showNav && profileId && (
        <BottomNav profileId={profileId} />
      )}
    </div>
  );
}

import { cn } from '@utils/cn';
import type { ReactNode } from 'react';

interface AppleCardProps {
  children: ReactNode;
  className?: string;
  size?: 'default' | 'large';
  interactive?: boolean;
  onClick?: () => void;
}

export function AppleCard({
  children,
  className,
  size = 'default',
  interactive = false,
  onClick,
}: AppleCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white/80 backdrop-blur-xl border border-white overflow-hidden',
        'shadow-apple transition-all duration-200',
        size === 'default' ? 'rounded-apple' : 'rounded-apple-lg',
        interactive && 'active:scale-[0.98] cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

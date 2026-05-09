import { Link } from 'react-router-dom';
import { Activity, ArrowLeft } from 'lucide-react';
import { AppleCard } from '@components/AppleCard';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-ios-orange to-ios-red flex items-center justify-center shadow-apple">
          <Activity className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* 404 Content */}
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold text-text-main mb-2">404</h1>
        <p className="text-xl text-text-secondary mb-2">Page introuvable</p>
        <p className="text-sm text-text-muted">
          Cette page n'existe pas ou a été déplacée.
        </p>
      </div>

      {/* Back Button */}
      <Link to="/">
        <AppleCard
          className="p-4 flex items-center gap-2 text-text-main hover:text-text-secondary transition-colors"
          interactive
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Retour à l'accueil</span>
        </AppleCard>
      </Link>
    </div>
  );
}

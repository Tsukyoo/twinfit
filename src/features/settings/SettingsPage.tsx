import { useState } from 'react';
import { Layout } from '../../app/layout';
import { AppleCard } from '@components/AppleCard';
import {
  User, Bell, Download, RotateCcw, Info,
  LogOut, Dumbbell, Scale, UtensilsCrossed,
  AlertTriangle, X, Check, Zap, Sparkles,
} from 'lucide-react';
import type { ProfileId } from '../../types';
import { useSettingsData } from '../../hooks/useSettingsData';
import { resetOnboarding } from '../../logic/onboarding';
import { cn } from '@utils/cn';

interface SettingsPageProps {
  profileId: ProfileId;
  onChangeProfile: () => void;
}

const profileVisuals: Record<ProfileId, { gradient: string; accentColor: string; initial: string }> = {
  teoman: { gradient: 'from-teoman-primary to-teoman-secondary', accentColor: 'text-teoman-primary', initial: 'T' },
  denizhan: { gradient: 'from-denizhan-secondary to-denizhan-primary', accentColor: 'text-denizhan-primary', initial: 'D' },
};

export function SettingsPage({ profileId, onChangeProfile }: SettingsPageProps) {
  const visuals = profileVisuals[profileId];
  const {
    settings, profileName, stats, isLoadingStats,
    toggleTimerSound, toggleReducedMotion,
    exportData, resetData,
  } = useSettingsData(profileId);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try { await exportData(); }
    finally { setIsExporting(false); }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetData();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 2000);
    } finally {
      setIsResetting(false);
      setShowResetConfirm(false);
    }
  };

  return (
    <Layout profileId={profileId} onChangeProfile={onChangeProfile}>
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-main">Paramètres</h1>
        <p className="text-text-secondary mt-1">Gestion du profil et données</p>
      </div>

      {/* ===== Profil actif ===== */}
      <SectionTitle>Profil</SectionTitle>
      <AppleCard className="overflow-hidden">
        {/* Profile identity */}
        <div className="p-4 flex items-center gap-3 border-b border-black/5">
          <div className={cn('w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0', visuals.gradient)}>
            <span className="text-white font-bold text-lg">{visuals.initial}</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-text-main">{profileName}</p>
            <p className={cn('text-xs font-medium', visuals.accentColor)}>Profil actif</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 divide-x divide-black/5">
          <StatCell icon={<Dumbbell className="w-4 h-4 text-ios-blue" />} label="Séances" value={stats.sessionCount} loading={isLoadingStats} />
          <StatCell icon={<Scale className="w-4 h-4 text-ios-green" />} label="Pesées" value={stats.bodyLogCount} loading={isLoadingStats} />
          <StatCell icon={<UtensilsCrossed className="w-4 h-4 text-ios-orange" />} label="Repas" value={stats.nutritionLogCount} loading={isLoadingStats} />
        </div>
      </AppleCard>

      {/* Change profile */}
      <button
        onClick={onChangeProfile}
        className="w-full p-4 rounded-apple bg-white/80 backdrop-blur-xl border border-white shadow-apple flex items-center gap-3 text-ios-red active:scale-[0.98] transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-ios-red/10 flex items-center justify-center flex-shrink-0">
          <LogOut className="w-5 h-5 text-ios-red" />
        </div>
        <div className="text-left">
          <p className="font-semibold">Changer de profil</p>
          <p className="text-xs text-ios-red/70">Retour à la sélection</p>
        </div>
      </button>

      {/* ===== Préférences ===== */}
      <SectionTitle>Préférences</SectionTitle>
      <AppleCard className="overflow-hidden divide-y divide-black/5">
        <ToggleRow
          icon={<Bell className="w-5 h-5 text-ios-purple" />}
          iconBg="bg-ios-purple/10"
          label="Son timer repos"
          description="Bip à la fin du temps de repos"
          checked={settings.restTimerSound}
          onToggle={toggleTimerSound}
        />
        <ToggleRow
          icon={<Zap className="w-5 h-5 text-ios-orange" />}
          iconBg="bg-ios-orange/10"
          label="Mouvements réduits"
          description="Désactive les animations"
          checked={settings.reducedMotion}
          onToggle={toggleReducedMotion}
        />
      </AppleCard>

      {/* ===== Aide ===== */}
      <SectionTitle>Aide</SectionTitle>
      <button
        onClick={() => {
          resetOnboarding(profileId);
          window.location.reload();
        }}
        className="w-full p-4 rounded-apple bg-white/80 backdrop-blur-xl border border-white shadow-apple flex items-center gap-3 active:scale-[0.98] transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-ios-purple/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-ios-purple" />
        </div>
        <div className="text-left">
          <p className="font-semibold text-text-main">Revoir le tutoriel</p>
          <p className="text-xs text-text-secondary">Relancer l&apos;onboarding de démarrage</p>
        </div>
      </button>

      {/* ===== Données ===== */}
      <SectionTitle>Données</SectionTitle>
      <div className="space-y-3">
        {/* Export */}
        <AppleCard interactive onClick={handleExport} className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ios-blue/10 flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-ios-blue" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-text-main">Exporter les données</p>
              <p className="text-xs text-text-secondary">Télécharger un fichier JSON</p>
            </div>
            {isExporting
              ? <span className="text-xs text-text-muted animate-pulse">Export…</span>
              : <Check className="w-4 h-4 text-ios-blue opacity-0" />}
          </div>
        </AppleCard>

        {/* Reset destructif */}
        <AppleCard
          interactive
          onClick={() => setShowResetConfirm(true)}
          className="p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ios-red/10 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5 text-ios-red" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-ios-red">Réinitialiser les données</p>
              <p className="text-xs text-text-secondary">Supprime tout et réinitialise</p>
            </div>
            {resetDone && <Check className="w-4 h-4 text-ios-green" />}
          </div>
        </AppleCard>
      </div>

      {/* ===== À propos ===== */}
      <SectionTitle>Application</SectionTitle>
      <AppleCard className="overflow-hidden divide-y divide-black/5">
        <InfoRow icon={<Info className="w-5 h-5 text-text-muted" />} label="Version" value="0.1.0" />
        <InfoRow icon={<User className="w-5 h-5 text-text-muted" />} label="Build" value="Basic Fit Edition" />
      </AppleCard>

      {/* Footer */}
      <p className="text-center text-xs text-text-muted pb-2">
        TwinFit · Données stockées localement sur cet appareil
      </p>

      {/* ===== Reset confirmation modal ===== */}
      {showResetConfirm && (
        <ResetConfirmModal
          isResetting={isResetting}
          onConfirm={handleReset}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}
    </Layout>
  );
}

// ========== Sub-components ==========

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold text-text-secondary uppercase tracking-widest px-1">
      {children}
    </h2>
  );
}

interface ToggleRowProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}

function ToggleRow({ icon, iconBg, label, description, checked, onToggle }: ToggleRowProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full p-4 flex items-center gap-3 text-left active:bg-surface-muted transition-colors"
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-text-main">{label}</p>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
      {/* iOS-style toggle */}
      <div className={cn(
        'w-12 h-7 rounded-full transition-colors duration-200 relative flex-shrink-0',
        checked ? 'bg-ios-green' : 'bg-surface-muted'
      )}>
        <div className={cn(
          'absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
          checked ? 'translate-x-6' : 'translate-x-1'
        )} />
      </div>
    </button>
  );
}

interface StatCellProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  loading: boolean;
}

function StatCell({ icon, label, value, loading }: StatCellProps) {
  return (
    <div className="p-3 flex flex-col items-center gap-1">
      {icon}
      {loading
        ? <div className="w-6 h-4 bg-surface-muted rounded animate-pulse" />
        : <p className="text-base font-bold text-text-main">{value}</p>}
      <p className="text-[10px] text-text-muted">{label}</p>
    </div>
  );
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-surface-muted flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <span className="flex-1 font-medium text-text-main">{label}</span>
      <span className="text-sm text-text-secondary">{value}</span>
    </div>
  );
}

interface ResetConfirmModalProps {
  isResetting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ResetConfirmModal({ isResetting, onConfirm, onCancel }: ResetConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-[480px] bg-background rounded-t-[28px] shadow-apple-lg overflow-hidden">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-text-muted/30" />
        </div>

        <div className="px-6 py-5">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-ios-red/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-ios-red" />
          </div>

          {/* Text */}
          <h3 className="text-xl font-bold text-text-main text-center mb-2">
            Réinitialiser toutes les données ?
          </h3>
          <p className="text-sm text-text-secondary text-center mb-6">
            Toutes tes séances, pesées, repas et scores seront <span className="font-semibold text-ios-red">définitivement supprimés</span>.
            Cette action est irréversible.
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={onConfirm}
              disabled={isResetting}
              className={cn(
                'w-full py-4 rounded-2xl text-sm font-bold text-white bg-ios-red flex items-center justify-center gap-2 transition-opacity',
                isResetting && 'opacity-50'
              )}
            >
              {isResetting ? (
                <span className="animate-pulse">Réinitialisation…</span>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Oui, tout supprimer
                </>
              )}
            </button>
            <button
              onClick={onCancel}
              disabled={isResetting}
              className="w-full py-4 rounded-2xl text-sm font-semibold text-text-main bg-surface-muted flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
          </div>

          {/* Safe zone spacer */}
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}

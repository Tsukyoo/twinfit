import { useState } from 'react';
import { Layout } from '../../app/layout';
import { AppleCard } from '@components/AppleCard';
import { WeightChart } from '@components/WeightChart';
import { AddWeightSheet } from '@components/AddWeightSheet';
import { Scale, Target, TrendingUp, TrendingDown, Plus, History, Pencil, Trash2, AlertTriangle, X, Calendar } from 'lucide-react';
import type { ProfileId, BodyLog } from '../../types';
import { useProgressData } from '../../hooks/useProgressData';
import { useWeeklyWeighInPrompt } from '../../hooks/useWeeklyWeighInPrompt';
import { cn } from '@utils/cn';

interface ProgressPageProps {
  profileId: ProfileId;
  onChangeProfile: () => void;
}

const profileVisuals: Record<ProfileId, {
  gradient: string;
  accentColor: string;
  accentBg: string;
  chartColor: string;
}> = {
  teoman: {
    gradient: 'from-teoman-primary to-teoman-secondary',
    accentColor: 'text-teoman-primary',
    accentBg: 'bg-teoman-primary/10',
    chartColor: '#34c759',
  },
  denizhan: {
    gradient: 'from-denizhan-secondary to-denizhan-primary',
    accentColor: 'text-denizhan-primary',
    accentBg: 'bg-denizhan-primary/10',
    chartColor: '#ff3b30',
  },
};

export function ProgressPage({ profileId, onChangeProfile }: ProgressPageProps) {
  const visuals = profileVisuals[profileId];
  const { logs, recent, currentWeightKg, initialWeightKg, goalWeightKg, deltaKg, isLoading, addLog, updateLog, deleteLog } = useProgressData(profileId);
  const weighIn = useWeeklyWeighInPrompt(profileId);
  const [showSheet, setShowSheet] = useState(false);
  const [showWeighInSheet, setShowWeighInSheet] = useState(false);
  const [editingLog, setEditingLog] = useState<BodyLog | null>(null);
  const [deletingLog, setDeletingLog] = useState<BodyLog | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isGaining = profileId === 'denizhan';

  const handleDeleteConfirm = async () => {
    if (!deletingLog) return;
    setIsDeleting(true);
    try {
      await deleteLog(deletingLog.id);
    } finally {
      setIsDeleting(false);
      setDeletingLog(null);
    }
  };

  return (
    <Layout profileId={profileId} onChangeProfile={onChangeProfile}>
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-main">Progression</h1>
        <p className="text-text-secondary mt-1">Évolution du poids</p>
      </div>

      {/* ===== Pesée du dimanche ===== */}
      {weighIn.shouldShow && (
        <AppleCard className="overflow-hidden">
          <div className="p-4 flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0', visuals.accentBg)}>
              <Calendar className={cn('w-5 h-5', visuals.accentColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn('text-xs font-bold uppercase tracking-wide', visuals.accentColor)}>Pesée du dimanche</p>
              <p className="text-sm text-text-secondary leading-snug">Ajoute ton poids pour suivre ta progression.</p>
            </div>
          </div>
          <div className="flex gap-2 px-4 pb-4">
            <button
              onClick={() => setShowWeighInSheet(true)}
              className={cn(
                'flex-1 py-2.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r',
                visuals.gradient
              )}
            >
              Ajouter ma pesée
            </button>
            <button
              onClick={weighIn.dismiss}
              className="px-4 py-2.5 rounded-2xl text-sm font-medium text-text-secondary bg-surface-muted"
            >
              Plus tard
            </button>
          </div>
        </AppleCard>
      )}

      {/* ===== Stats grid ===== */}
      <div className="grid grid-cols-2 gap-3">
        {/* Poids actuel */}
        <AppleCard className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', visuals.accentBg)}>
              <Scale className={cn('w-4 h-4', visuals.accentColor)} />
            </div>
            <span className="text-xs text-text-secondary uppercase tracking-wide">Actuel</span>
          </div>
          {isLoading ? (
            <div className="h-8 w-20 bg-surface-muted rounded animate-pulse" />
          ) : (
            <>
              <p className="text-2xl font-bold text-text-main">
                {currentWeightKg !== null ? `${currentWeightKg} kg` : '--'}
              </p>
              <p className="text-xs text-text-muted mt-0.5">Dernière pesée</p>
            </>
          )}
        </AppleCard>

        {/* Objectif */}
        <AppleCard className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-ios-orange/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-ios-orange" />
            </div>
            <span className="text-xs text-text-secondary uppercase tracking-wide">Objectif</span>
          </div>
          <p className="text-2xl font-bold text-text-main">{goalWeightKg} kg</p>
          <p className="text-xs text-text-muted mt-0.5">
            {Math.abs(goalWeightKg - initialWeightKg)} kg à {isGaining ? 'prendre' : 'perdre'}
          </p>
        </AppleCard>

        {/* Poids initial */}
        <AppleCard className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-surface-muted flex items-center justify-center">
              <Scale className="w-4 h-4 text-text-muted" />
            </div>
            <span className="text-xs text-text-secondary uppercase tracking-wide">Initial</span>
          </div>
          <p className="text-2xl font-bold text-text-main">{initialWeightKg} kg</p>
          <p className="text-xs text-text-muted mt-0.5">Point de départ</p>
        </AppleCard>

        {/* Delta */}
        <AppleCard className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              deltaKg === null ? 'bg-surface-muted'
                : deltaKg > 0 ? 'bg-ios-green/10' : 'bg-ios-red/10'
            )}>
              {deltaKg !== null && deltaKg > 0
                ? <TrendingUp className="w-4 h-4 text-ios-green" />
                : <TrendingDown className="w-4 h-4 text-ios-red" />}
            </div>
            <span className="text-xs text-text-secondary uppercase tracking-wide">Évolution</span>
          </div>
          {isLoading ? (
            <div className="h-8 w-16 bg-surface-muted rounded animate-pulse" />
          ) : (
            <>
              <p className={cn(
                'text-2xl font-bold',
                deltaKg === null ? 'text-text-muted'
                  : deltaKg > 0 ? 'text-ios-green' : 'text-ios-red'
              )}>
                {deltaKg !== null
                  ? `${deltaKg > 0 ? '+' : ''}${deltaKg} kg`
                  : '--'}
              </p>
              <p className="text-xs text-text-muted mt-0.5">depuis début</p>
            </>
          )}
        </AppleCard>
      </div>

      {/* ===== Weight chart ===== */}
      <div>
        <h2 className="text-lg font-bold text-text-main mb-3">30 derniers jours</h2>
        <AppleCard className="px-3 py-4">
          {isLoading ? (
            <div className="h-36 bg-surface-muted rounded-xl animate-pulse" />
          ) : (
            <WeightChart
              logs={logs}
              initialWeightKg={initialWeightKg}
              goalWeightKg={goalWeightKg}
              accentColor={visuals.chartColor}
              gradientId={`weight-grad-${profileId}`}
            />
          )}
        </AppleCard>
      </div>

      {/* ===== Add weight CTA ===== */}
      <AppleCard
        interactive
        onClick={() => setShowSheet(true)}
        className="p-4 flex items-center justify-center gap-2"
      >
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-white bg-gradient-to-br',
          visuals.gradient
        )}>
          <Plus className="w-4 h-4" />
        </div>
        <span className={cn('font-semibold', visuals.accentColor)}>Ajouter une pesée</span>
      </AppleCard>

      {/* ===== History list ===== */}
      <div>
        <h2 className="text-lg font-bold text-text-main mb-3">Historique</h2>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <AppleCard key={i} className="p-4 h-14 animate-pulse bg-surface-muted"><div /></AppleCard>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <AppleCard className="p-8 flex flex-col items-center gap-2">
            <History className="w-8 h-8 text-text-muted" />
            <p className="text-sm text-text-secondary">Aucune pesée enregistrée</p>
            <p className="text-xs text-text-muted">Ajoute ta première mesure</p>
          </AppleCard>
        ) : (
          <div className="space-y-2">
            {recent.map((log) => (
              <WeightHistoryRow
                key={log.id}
                log={log}
                accentColor={visuals.accentColor}
                onEdit={() => setEditingLog(log)}
                onDelete={() => setDeletingLog(log)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add weight sheet */}
      {showSheet && (
        <AddWeightSheet
          lastWeightKg={currentWeightKg}
          gradient={visuals.gradient}
          mode="create"
          onSave={addLog}
          onClose={() => setShowSheet(false)}
        />
      )}

      {/* Edit weight sheet */}
      {editingLog && (
        <AddWeightSheet
          lastWeightKg={currentWeightKg}
          gradient={visuals.gradient}
          mode="edit"
          initialData={{ weightKg: editingLog.weightKg, waistCm: editingLog.waistCm, notes: editingLog.notes }}
          onSave={async (weightKg, waistCm, notes) => {
            await updateLog(editingLog, weightKg, waistCm, notes);
          }}
          onClose={() => setEditingLog(null)}
        />
      )}

      {/* Delete confirmation */}
      {deletingLog && (
        <DeleteConfirmModal
          log={deletingLog}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingLog(null)}
        />
      )}

      {/* Weigh-in sheet */}
      {showWeighInSheet && (
        <AddWeightSheet
          lastWeightKg={currentWeightKg}
          gradient={visuals.gradient}
          mode="create"
          onSave={async (weightKg, waistCm, notes) => {
            await addLog(weightKg, waistCm, notes);
          }}
          onClose={() => setShowWeighInSheet(false)}
        />
      )}
    </Layout>
  );
}

// ========== Sub-components ==========

interface WeightHistoryRowProps {
  log: BodyLog;
  accentColor: string;
  onEdit: () => void;
  onDelete: () => void;
}

function WeightHistoryRow({ log, accentColor, onEdit, onDelete }: WeightHistoryRowProps) {
  const date = new Date(log.date + 'T12:00:00');
  const label = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <AppleCard className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-main capitalize">{label}</p>
          {log.waistCm && (
            <p className="text-xs text-text-muted mt-0.5">Tour de taille : {log.waistCm} cm</p>
          )}
          {log.notes && (
            <p className="text-xs text-text-muted mt-0.5 italic truncate">"{log.notes}"</p>
          )}
        </div>
        <p className={cn('text-lg font-bold flex-shrink-0', accentColor)}>{log.weightKg} kg</p>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onEdit}
            className="w-8 h-8 rounded-xl bg-surface-muted flex items-center justify-center active:scale-95 transition-transform"
          >
            <Pencil className="w-3.5 h-3.5 text-text-secondary" />
          </button>
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-xl bg-ios-red/10 flex items-center justify-center active:scale-95 transition-transform"
          >
            <Trash2 className="w-3.5 h-3.5 text-ios-red" />
          </button>
        </div>
      </div>
    </AppleCard>
  );
}

interface DeleteConfirmModalProps {
  log: BodyLog;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmModal({ log, isDeleting, onConfirm, onCancel }: DeleteConfirmModalProps) {
  const date = new Date(log.date + 'T12:00:00');
  const label = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-[480px] bg-background rounded-t-[28px] shadow-apple-lg">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-text-muted/30" />
        </div>
        <div className="px-6 py-5">
          <div className="w-14 h-14 rounded-2xl bg-ios-red/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-ios-red" />
          </div>
          <h3 className="text-xl font-bold text-text-main text-center mb-1">
            Supprimer cette pesée ?
          </h3>
          <p className="text-sm text-text-secondary text-center mb-1 capitalize">{label}</p>
          <p className="text-lg font-bold text-text-main text-center mb-6">{log.weightKg} kg</p>
          <div className="space-y-3">
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className={cn(
                'w-full py-4 rounded-2xl text-sm font-bold text-white bg-ios-red flex items-center justify-center gap-2 transition-opacity',
                isDeleting && 'opacity-50'
              )}
            >
              {isDeleting ? (
                <span className="animate-pulse">Suppression…</span>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </>
              )}
            </button>
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="w-full py-4 rounded-2xl text-sm font-semibold text-text-main bg-surface-muted flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
          </div>
          <div className="h-3" />
        </div>
      </div>
    </div>
  );
}

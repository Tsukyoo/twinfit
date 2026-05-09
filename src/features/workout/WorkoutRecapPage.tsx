import { useState } from 'react';
import { Trophy, Dumbbell, Clock, Zap, Star, ArrowLeft, CheckCircle } from 'lucide-react';
import { cn } from '@utils/cn';
import { AppleCard } from '@components/AppleCard';
import type { WorkoutSession, ProfileId } from '../../types';
import type { PREvent } from '../../hooks/useActiveWorkout';

interface WorkoutRecapPageProps {
  session: WorkoutSession;
  profileId: ProfileId;
  prEvents: PREvent[];
  gradient: string;
  accentColor: string;
  onBack: () => void;
}

export function WorkoutRecapPage({
  session,
  prEvents,
  gradient,
  accentColor,
  onBack,
}: WorkoutRecapPageProps) {
  const [note, setNote] = useState(session.notes ?? '');

  const duration = session.durationSeconds ?? 0;
  const mins = Math.floor(duration / 60);
  const secs = duration % 60;
  const durationStr = mins > 0 ? `${mins} min ${secs > 0 ? `${secs}s` : ''}`.trim() : `${secs}s`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero banner */}
      <div className={cn('p-6 pb-8 bg-gradient-to-br text-white relative overflow-hidden', gradient)}>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -right-2 bottom-4 w-20 h-20 rounded-full bg-white/10" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/25 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium">Séance terminée !</p>
              <h1 className="text-2xl font-bold text-white">{session.name}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 overflow-y-auto pb-8">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Clock className="w-5 h-5 text-ios-blue" />}
            label="Durée"
            value={durationStr}
            bg="bg-ios-blue/10"
          />
          <StatCard
            icon={<Dumbbell className="w-5 h-5 text-ios-purple" />}
            label="Séries"
            value={String(session.totalSets ?? 0)}
            bg="bg-ios-purple/10"
          />
          <StatCard
            icon={<Zap className="w-5 h-5 text-ios-orange" />}
            label="Volume"
            value={session.totalVolumeKg ? `${Math.round(session.totalVolumeKg)} kg` : '--'}
            bg="bg-ios-orange/10"
          />
          <StatCard
            icon={<Trophy className="w-5 h-5 text-ios-yellow" />}
            label="Points"
            value={`+${session.pointsEarned ?? 0}`}
            bg="bg-ios-yellow/10"
            accent={accentColor}
          />
        </div>

        {/* PR events */}
        {prEvents.length > 0 && (
          <AppleCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-ios-yellow fill-ios-yellow" />
              <p className="font-bold text-text-main text-sm">
                {prEvents.length === 1 ? 'Nouveau PR !' : `${prEvents.length} nouveaux PR !`}
              </p>
            </div>
            <div className="space-y-2">
              {prEvents.map((pr, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-black/5 last:border-0">
                  <p className="text-sm text-text-main">{pr.exerciseName}</p>
                  <p className={cn('text-sm font-bold', accentColor)}>
                    {pr.weightKg} kg × {pr.reps}
                  </p>
                </div>
              ))}
            </div>
          </AppleCard>
        )}

        {/* Session note */}
        <AppleCard className="p-4">
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-2">
            Note de séance (optionnel)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Comment s'est passée cette séance ?"
            className="w-full text-sm text-text-main bg-surface-muted rounded-2xl p-3 resize-none focus:outline-none focus:ring-2"
          />
        </AppleCard>

        {/* Back to dashboard */}
        <button
          onClick={onBack}
          className={cn(
            'w-full py-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r',
            gradient
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </button>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
  accent?: string;
}

function StatCard({ icon, label, value, bg, accent }: StatCardProps) {
  return (
    <AppleCard className="p-4">
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-2', bg)}>
        {icon}
      </div>
      <p className={cn('text-xl font-bold', accent ?? 'text-text-main')}>{value}</p>
      <p className="text-xs text-text-secondary mt-0.5">{label}</p>
    </AppleCard>
  );
}

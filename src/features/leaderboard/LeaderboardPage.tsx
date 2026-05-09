import { Layout } from '../../app/layout';
import { AppleCard } from '@components/AppleCard';
import { Trophy, Flame, Dumbbell, Crown, Target, UtensilsCrossed, Zap, TrendingUp } from 'lucide-react';
import type { ProfileId } from '../../types';
import type { DuelScore } from '../../logic/weeklyDuelScoring';
import { useWeeklyDuel } from '../../hooks/useWeeklyDuel';
import { cn } from '@utils/cn';

interface LeaderboardPageProps {
  profileId: ProfileId;
  onChangeProfile: () => void;
}

interface ProfileVisuals {
  gradient: string;
  accentColor: string;
  accentBg: string;
  initial: string;
  name: string;
}

const VISUALS: Record<ProfileId, ProfileVisuals> = {
  teoman: {
    gradient: 'from-teoman-primary to-teoman-secondary',
    accentColor: 'text-teoman-primary',
    accentBg: 'bg-teoman-primary/10',
    initial: 'T',
    name: 'Teoman',
  },
  denizhan: {
    gradient: 'from-denizhan-secondary to-denizhan-primary',
    accentColor: 'text-denizhan-primary',
    accentBg: 'bg-denizhan-primary/10',
    initial: 'D',
    name: 'Denizhan',
  },
};

function fmtWeekLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export function LeaderboardPage({ profileId, onChangeProfile }: LeaderboardPageProps) {
  const { result, isLoading, weekStart } = useWeeklyDuel();

  const t = result?.teoman;
  const d = result?.denizhan;
  const winner = result?.winner;
  const tiebreaker = result?.tiebreakerApplied;
  const tiebreakerReason = result?.tiebreakerReason;
  const scoreDiff = result?.scoreDiff ?? 0;

  const maxPts = Math.max(t?.total ?? 0, d?.total ?? 0, 1);
  const noData = !isLoading && (!t || !d) && (!t?.total && !d?.total);
  const bothZero = !isLoading && t?.total === 0 && d?.total === 0;

  return (
    <Layout profileId={profileId} onChangeProfile={onChangeProfile}>
      {/* Title */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-text-main">Le Duel</h1>
        <p className="text-text-secondary mt-1">Semaine du {fmtWeekLabel(weekStart)}</p>
      </div>

      {/* No data state */}
      {noData && (
        <AppleCard className="p-8 flex flex-col items-center gap-3">
          <Trophy className="w-10 h-10 text-text-muted" />
          <p className="text-sm text-text-secondary">Duel pas encore lancé</p>
          <p className="text-xs text-text-muted">Commencez vos séances pour démarrer le classement</p>
        </AppleCard>
      )}

      {/* Empty equality banner - both at 0 */}
      {!isLoading && bothZero && (
        <AppleCard className="p-6 flex flex-col items-center gap-3 bg-surface-muted">
          <Trophy className="w-10 h-10 text-text-muted" />
          <div className="text-center">
            <p className="text-base font-semibold text-text-main">
              Égalité parfaite pour l&apos;instant
            </p>
            <p className="text-sm text-text-secondary mt-1">
              Commencez vos séances et votre nutrition pour lancer le duel.
            </p>
          </div>
        </AppleCard>
      )}

      {/* Winner banner */}
      {!isLoading && !noData && !bothZero && winner && (
        <AppleCard className={cn(
          'p-4 flex items-center gap-3 overflow-hidden relative',
          winner === 'teoman'
            ? 'bg-gradient-to-br from-teoman-primary to-teoman-secondary'
            : 'bg-gradient-to-br from-denizhan-secondary to-denizhan-primary'
        )}>
          <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
              Gagnant de la semaine
            </p>
            <p className="text-lg font-bold text-white">
              {VISUALS[winner].name} mène le duel
            </p>
            {tiebreaker && tiebreakerReason && (
              <p className="text-xs text-white/70 mt-0.5">{tiebreakerReason}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-white/70">Écart</p>
            <p className="text-sm font-bold text-white">+{scoreDiff} pts</p>
          </div>
        </AppleCard>
      )}

      {/* Duel score cards */}
      {!isLoading && !noData && t && d && (
        <AppleCard className="p-5">
          <div className="flex items-center gap-3">
            <ProfileColumn score={t} visuals={VISUALS.teoman} isLeader={winner === 'teoman'} isMe={profileId === 'teoman'} />
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center">
                <span className="text-xs font-bold text-text-secondary">VS</span>
              </div>
            </div>
            <ProfileColumn score={d} visuals={VISUALS.denizhan} isLeader={winner === 'denizhan'} isMe={profileId === 'denizhan'} />
          </div>

          {/* Progress bars */}
          <div className="mt-5 space-y-3">
            {([
              { id: 'teoman', pts: t.total, v: VISUALS.teoman } as const,
              { id: 'denizhan', pts: d.total, v: VISUALS.denizhan } as const,
            ]).map(({ id, pts, v }) => {
              const pct = maxPts > 0 ? Math.round((pts / maxPts) * 100) : 0;
              return (
                <div key={id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text-main">{v.name}</span>
                    <span className={cn('text-sm font-bold', v.accentColor)}>{pts} pts</span>
                  </div>
                  <div className="h-2.5 bg-surface-muted rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', v.gradient)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </AppleCard>
      )}

      {/* Category breakdown */}
      {!isLoading && !noData && t && d && (
        <>
          <h2 className="text-lg font-bold text-text-main">Détail par catégorie</h2>
          <div className="grid grid-cols-2 gap-3">
            <CategoryCard
              icon={<Dumbbell className="w-4 h-4" />}
              label="Séances"
              tValue={t.sessionsTotal}
              dValue={d.sessionsTotal}
              tCount={t.sessionsCount}
              dCount={d.sessionsCount}
              tColor={VISUALS.teoman.accentColor}
              dColor={VISUALS.denizhan.accentColor}
            />
            <CategoryCard
              icon={<Zap className="w-4 h-4" />}
              label="Séries"
              tValue={t.setsTotal}
              dValue={d.setsTotal}
              tColor={VISUALS.teoman.accentColor}
              dColor={VISUALS.denizhan.accentColor}
            />
            <CategoryCard
              icon={<TrendingUp className="w-4 h-4" />}
              label="Progression"
              tValue={t.progressionTotal}
              dValue={d.progressionTotal}
              tCount={t.prCount}
              dCount={d.prCount}
              tColor={VISUALS.teoman.accentColor}
              dColor={VISUALS.denizhan.accentColor}
            />
            <CategoryCard
              icon={<UtensilsCrossed className="w-4 h-4" />}
              label="Nutrition"
              tValue={t.nutritionTotal}
              dValue={d.nutritionTotal}
              tCount={t.nutritionDaysRespected}
              dCount={d.nutritionDaysRespected}
              tColor={VISUALS.teoman.accentColor}
              dColor={VISUALS.denizhan.accentColor}
            />
            <CategoryCard
              icon={<Target className="w-4 h-4" />}
              label="Poids"
              tValue={t.weightTotal}
              dValue={d.weightTotal}
              tColor={VISUALS.teoman.accentColor}
              dColor={VISUALS.denizhan.accentColor}
            />
            <CategoryCard
              icon={<Flame className="w-4 h-4" />}
              label="Check-in"
              tValue={t.checkinTotal}
              dValue={d.checkinTotal}
              tColor={VISUALS.teoman.accentColor}
              dColor={VISUALS.denizhan.accentColor}
            />
          </div>
        </>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          <AppleCard className="p-6 h-24 animate-pulse bg-surface-muted"><div /></AppleCard>
          <AppleCard className="p-6 h-32 animate-pulse bg-surface-muted"><div /></AppleCard>
        </div>
      )}
    </Layout>
  );
}

function ProfileColumn({ score, visuals, isLeader, isMe }: { score: DuelScore; visuals: ProfileVisuals; isLeader: boolean; isMe: boolean }) {
  return (
    <div className="flex-1 text-center">
      <div className="relative inline-block mb-2">
        <div className={cn('w-16 h-16 rounded-full bg-gradient-to-br flex items-center justify-center mx-auto', visuals.gradient)}>
          <span className="text-white font-bold text-xl">{visuals.initial}</span>
        </div>
        {isLeader && (
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-ios-yellow flex items-center justify-center shadow-sm">
            <Crown className="w-3 h-3 text-white" />
          </div>
        )}
        {isMe && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white rounded-full px-1.5 py-0.5 shadow-sm">
            <span className="text-[9px] font-bold text-text-main">Moi</span>
          </div>
        )}
      </div>
      <p className="text-sm font-semibold text-text-main mt-3">{visuals.name}</p>
      <p className={cn('text-3xl font-bold mt-1', visuals.accentColor)}>{score.total}</p>
      <p className="text-xs text-text-secondary">pts cette sem.</p>
    </div>
  );
}

function CategoryCard({
  icon,
  label,
  tValue,
  dValue,
  tCount,
  dCount,
  tColor,
  dColor,
}: {
  icon: React.ReactNode;
  label: string;
  tValue: number;
  dValue: number;
  tCount?: number;
  dCount?: number;
  tColor: string;
  dColor: string;
}) {
  const leader = tValue > dValue ? 'teoman' : dValue > tValue ? 'denizhan' : null;

  return (
    <AppleCard className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-surface-muted flex items-center justify-center text-text-secondary">
          {icon}
        </div>
        <span className="font-semibold text-text-main text-sm">{label}</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">Teoman</span>
          <div className="flex items-center gap-1">
            {tCount !== undefined && <span className="text-xs text-text-muted">({tCount})</span>}
            <span className={cn('text-sm font-bold', leader === 'teoman' ? tColor : 'text-text-secondary')}>{tValue} pts</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">Denizhan</span>
          <div className="flex items-center gap-1">
            {dCount !== undefined && <span className="text-xs text-text-muted">({dCount})</span>}
            <span className={cn('text-sm font-bold', leader === 'denizhan' ? dColor : 'text-text-secondary')}>{dValue} pts</span>
          </div>
        </div>
      </div>
    </AppleCard>
  );
}

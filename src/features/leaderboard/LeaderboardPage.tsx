import { Layout } from '../../app/layout';
import { AppleCard } from '@components/AppleCard';
import { Trophy, Flame, Dumbbell, Crown, Target, UtensilsCrossed, Zap, TrendingUp, Moon, WifiOff, RefreshCw } from 'lucide-react';
import type { ProfileId, WeeklyDuelResult } from '../../types';
import type { DuelScore } from '../../logic/weeklyDuelScoring';
import { useWeeklyDuel } from '../../hooks/useWeeklyDuel';
import { useWeeklyDuelHistory } from '../../hooks/useWeeklyDuelHistory';
import { useRealtimeDuel } from '../../hooks/useRealtimeDuel';
import type { SyncStatus } from '../../hooks/useRealtimeDuel';
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
  const history = useWeeklyDuelHistory();
  const { remoteScores, syncStatus, lastSyncedAt, triggerSync } = useRealtimeDuel();

  const t = result?.teoman;
  const d = result?.denizhan;

  // Merge: use remote score when available, fall back to local
  const tDisplayPts = remoteScores.teoman ?? t?.total ?? 0;
  const dDisplayPts = remoteScores.denizhan ?? d?.total ?? 0;

  // Derive display winner from merged scores
  const displayWinner: 'teoman' | 'denizhan' | null =
    tDisplayPts > dDisplayPts ? 'teoman' :
    dDisplayPts > tDisplayPts ? 'denizhan' :
    null;
  const displayScoreDiff = Math.abs(tDisplayPts - dDisplayPts);

  // Keep original for tie-breaker labels (local compute still valid)
  const tiebreaker = result?.tiebreakerApplied;
  const tiebreakerReason = result?.tiebreakerReason;

  const noData = !isLoading && tDisplayPts === 0 && dDisplayPts === 0 && !t && !d;
  const bothZero = !isLoading && tDisplayPts === 0 && dDisplayPts === 0;

  return (
    <Layout profileId={profileId} onChangeProfile={onChangeProfile}>
      {/* Title */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-text-main">Le Duel</h1>
        <div className="flex items-center justify-center gap-2 mt-1">
          <p className="text-text-secondary">Semaine du {fmtWeekLabel(weekStart)}</p>
          <SyncBadge status={syncStatus} lastSyncedAt={lastSyncedAt} onRetry={triggerSync} />
        </div>
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
      {!isLoading && !noData && !bothZero && displayWinner && (
        <AppleCard className={cn(
          'p-4 flex items-center gap-3 overflow-hidden relative',
          displayWinner === 'teoman'
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
              {VISUALS[displayWinner].name} mène le duel
            </p>
            {tiebreaker && tiebreakerReason && (
              <p className="text-xs text-white/70 mt-0.5">{tiebreakerReason}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-white/70">Écart</p>
            <p className="text-sm font-bold text-white">+{displayScoreDiff} pts</p>
          </div>
        </AppleCard>
      )}

      {/* Duel score cards */}
      {!isLoading && !noData && t && d && (
        <AppleCard className="p-5">
          <div className="flex items-center gap-3">
            <ProfileColumn score={t} visuals={VISUALS.teoman} isLeader={displayWinner === 'teoman'} isMe={profileId === 'teoman'} displayTotal={tDisplayPts} />
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center">
                <span className="text-xs font-bold text-text-secondary">VS</span>
              </div>
            </div>
            <ProfileColumn score={d} visuals={VISUALS.denizhan} isLeader={displayWinner === 'denizhan'} isMe={profileId === 'denizhan'} displayTotal={dDisplayPts} />
          </div>

          {/* Weekly wins row */}
          {!history.isLoading && (
            <div className="mt-5 pt-4 border-t border-black/5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-3">Victoires hebdo</p>
              <div className="flex items-center">
                <div className="flex-1 flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5 text-teoman-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-text-secondary">Teoman</span>
                  <span className={cn(
                    'ml-auto text-lg font-bold tabular-nums',
                    history.teomanWins > history.denizhanWins ? 'text-teoman-primary' : 'text-text-secondary'
                  )}>{history.teomanWins}</span>
                </div>
                <div className="w-px h-8 bg-black/8 mx-4 flex-shrink-0" />
                <div className="flex-1 flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5 text-denizhan-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-text-secondary">Denizhan</span>
                  <span className={cn(
                    'ml-auto text-lg font-bold tabular-nums',
                    history.denizhanWins > history.teomanWins ? 'text-denizhan-primary' : 'text-text-secondary'
                  )}>{history.denizhanWins}</span>
                </div>
              </div>
            </div>
          )}
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
            <CategoryCard
              icon={<Moon className="w-4 h-4" />}
              label="Sommeil"
              tValue={t.sleepTotal}
              dValue={d.sleepTotal}
              tColor={VISUALS.teoman.accentColor}
              dColor={VISUALS.denizhan.accentColor}
            />
          </div>
        </>
      )}

      {/* History — last 5 completed weeks */}
      {!history.isLoading && history.results.length > 0 && (
        <WeekHistoryList results={history.results.slice(0, 5)} />
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

function ProfileColumn({ score, visuals, isLeader, isMe, displayTotal }: {
  score: DuelScore;
  visuals: ProfileVisuals;
  isLeader: boolean;
  isMe: boolean;
  displayTotal?: number;
}) {
  const shownTotal = displayTotal ?? score.total;
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
      <p className={cn('text-3xl font-bold mt-1', visuals.accentColor)}>{shownTotal}</p>
      <p className="text-xs text-text-secondary">pts cette sem.</p>
    </div>
  );
}


function WeekHistoryList({ results }: { results: WeeklyDuelResult[] }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-text-main mb-3">Historique</h2>
      <AppleCard className="divide-y divide-black/5">
        {results.map((r) => {
          const winnerVisuals = r.winnerProfileId ? VISUALS[r.winnerProfileId] : null;
          const weekLabel = fmtWeekLabel(r.weekStart);
          const tPts = r.teomanPoints;
          const dPts = r.denizhanPoints;

          return (
            <div key={r.id} className="flex items-center gap-3 px-4 py-3">
              {/* Week icon */}
              <div className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                winnerVisuals ? winnerVisuals.accentBg : 'bg-surface-muted'
              )}>
                {winnerVisuals
                  ? <Crown className={cn('w-4 h-4', winnerVisuals.accentColor)} />
                  : <Trophy className="w-4 h-4 text-text-muted" />
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-main">Semaine du {weekLabel}</p>
                <p className="text-xs text-text-muted truncate">{r.reason}</p>
              </div>

              {/* Score */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-bold">
                  <span className="text-teoman-primary">{tPts}</span>
                  <span className="text-text-muted mx-1">–</span>
                  <span className="text-denizhan-primary">{dPts}</span>
                </p>
                {winnerVisuals && (
                  <p className={cn('text-[10px] font-semibold', winnerVisuals.accentColor)}>{winnerVisuals.name}</p>
                )}
              </div>
            </div>
          );
        })}
      </AppleCard>
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

function SyncBadge({
  status,
  lastSyncedAt,
  onRetry,
}: {
  status: SyncStatus;
  lastSyncedAt: string | null;
  onRetry: () => void;
}) {
  if (status === 'disabled') return null;

  if (status === 'offline') {
    return (
      <button
        onClick={onRetry}
        className="flex items-center gap-1 text-[10px] font-medium text-text-muted bg-surface-muted rounded-full px-2 py-0.5"
      >
        <WifiOff className="w-2.5 h-2.5" />
        Hors ligne
      </button>
    );
  }

  if (status === 'syncing') {
    return (
      <span className="flex items-center gap-1 text-[10px] font-medium text-text-muted">
        <RefreshCw className="w-2.5 h-2.5 animate-spin" />
        Sync…
      </span>
    );
  }

  if (status === 'synced' && lastSyncedAt) {
    return (
      <span className="text-[10px] font-medium text-ios-green opacity-70">
        • Synchronisé
      </span>
    );
  }

  return null;
}

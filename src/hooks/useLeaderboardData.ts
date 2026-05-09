import { useState, useEffect } from 'react';
import type { LeaderboardScore } from '../types';
import { leaderboardScoreRepo } from '../db/repositories';

export interface ProfileScoreData {
  current: LeaderboardScore | null;
  history: LeaderboardScore[];   // last 4 weeks, descending
}

export interface LeaderboardData {
  teoman: ProfileScoreData;
  denizhan: ProfileScoreData;
  leaderId: 'teoman' | 'denizhan' | 'tie' | null;
  isLoading: boolean;
}

export function useLeaderboardData(): LeaderboardData {
  const [teoman, setTeoman] = useState<ProfileScoreData>({ current: null, history: [] });
  const [denizhan, setDenizhan] = useState<ProfileScoreData>({ current: null, history: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [tScores, dScores] = await Promise.all([
        leaderboardScoreRepo.getByProfile('teoman'),
        leaderboardScoreRepo.getByProfile('denizhan'),
      ]);

      if (cancelled) return;

      const sortDesc = (arr: LeaderboardScore[]) =>
        [...arr].sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate));

      const tSorted = sortDesc(tScores);
      const dSorted = sortDesc(dScores);

      setTeoman({ current: tSorted[0] ?? null, history: tSorted.slice(0, 4) });
      setDenizhan({ current: dSorted[0] ?? null, history: dSorted.slice(0, 4) });
      setIsLoading(false);
    }

    load().catch(console.error);
    return () => { cancelled = true; };
  }, []);

  const tPts = teoman.current?.weeklyPoints ?? 0;
  const dPts = denizhan.current?.weeklyPoints ?? 0;
  const leaderId = isLoading
    ? null
    : tPts === dPts
      ? 'tie'
      : tPts > dPts ? 'teoman' : 'denizhan';

  return { teoman, denizhan, leaderId, isLoading };
}

import { supabase, isSupabaseEnabled } from '../lib/supabase';
import type { DuelPointsRow, WeeklyDuelResultRow } from '../lib/supabase';
import type { ProfileId, WeeklyDuelResult } from '../types';
import { weeklyDuelResultRepo } from '../db/repositories';

// ============================================================
// DUEL SYNC SERVICE
// Local-first: IndexedDB is always the source of truth for UX.
// Supabase is the shared source of truth between devices.
// Conflict resolution: latest updated_at wins.
// ============================================================

// ──────────────────────────────────────────────
// Push a profile's weekly points to Supabase
// ──────────────────────────────────────────────

export async function pushDuelPoints(
  profileId: ProfileId,
  weekStart: string,
  totalPoints: number
): Promise<void> {
  if (!isSupabaseEnabled || !supabase) return;

  const now = new Date().toISOString();

  const { error } = await supabase
    .from('duel_points')
    .upsert(
      {
        id: `${profileId}-${weekStart}`,
        profile_id: profileId,
        week_start: weekStart,
        total_points: totalPoints,
        updated_at: now,
      },
      { onConflict: 'profile_id,week_start' }
    );

  if (error) {
    console.warn('[DuelSync] pushDuelPoints error:', error.message);
  }
}

// ──────────────────────────────────────────────
// Pull both profiles' points for the current week
// Returns null if offline or Supabase disabled
// ──────────────────────────────────────────────

export async function pullDuelPoints(weekStart: string): Promise<{
  teoman: DuelPointsRow | null;
  denizhan: DuelPointsRow | null;
} | null> {
  if (!isSupabaseEnabled || !supabase) return null;

  const { data, error } = await supabase
    .from('duel_points')
    .select('*')
    .eq('week_start', weekStart)
    .in('profile_id', ['teoman', 'denizhan']);

  if (error) {
    console.warn('[DuelSync] pullDuelPoints error:', error.message);
    return null;
  }

  const rows = (data ?? []) as DuelPointsRow[];
  return {
    teoman: rows.find((r) => r.profile_id === 'teoman') ?? null,
    denizhan: rows.find((r) => r.profile_id === 'denizhan') ?? null,
  };
}

// ──────────────────────────────────────────────
// Push a weekly duel result to Supabase
// ──────────────────────────────────────────────

export async function pushWeeklyDuelResult(result: WeeklyDuelResult): Promise<void> {
  if (!isSupabaseEnabled || !supabase) return;

  const { error } = await supabase
    .from('weekly_duel_results')
    .upsert(
      {
        id: result.id,
        week_start: result.weekStart,
        winner_profile_id: result.winnerProfileId,
        teoman_points: result.teomanPoints,
        denizhan_points: result.denizhanPoints,
        created_at: result.createdAt,
      },
      { onConflict: 'week_start' }
    );

  if (error) {
    console.warn('[DuelSync] pushWeeklyDuelResult error:', error.message);
  }
}

// ──────────────────────────────────────────────
// Pull all weekly duel results from Supabase
// and merge into local IndexedDB (latest wins)
// ──────────────────────────────────────────────

export async function syncWeeklyDuelResults(): Promise<void> {
  if (!isSupabaseEnabled || !supabase) return;

  const { data, error } = await supabase
    .from('weekly_duel_results')
    .select('*')
    .order('week_start', { ascending: false })
    .limit(52); // 1 year max

  if (error) {
    console.warn('[DuelSync] syncWeeklyDuelResults error:', error.message);
    return;
  }

  const rows = (data ?? []) as WeeklyDuelResultRow[];

  for (const row of rows) {
    const existing = await weeklyDuelResultRepo.getByWeekStart(row.week_start);

    // Merge: remote wins if local doesn't have it or remote created_at is newer
    if (
      !existing ||
      new Date(row.created_at) > new Date(existing.createdAt)
    ) {
      await weeklyDuelResultRepo.upsert({
        id: row.id,
        weekStart: row.week_start,
        weekEnd: getWeekEnd(row.week_start),
        winnerProfileId: row.winner_profile_id as ProfileId | null,
        teomanPoints: row.teoman_points,
        denizhanPoints: row.denizhan_points,
        reason: '',
        createdAt: row.created_at,
      });
    }
  }
}

// ──────────────────────────────────────────────
// Utility: compute week end (Sunday) from week start (Monday)
// ──────────────────────────────────────────────

function getWeekEnd(weekStart: string): string {
  const d = new Date(weekStart + 'T12:00:00');
  d.setDate(d.getDate() + 6);
  return d.toISOString().split('T')[0];
}

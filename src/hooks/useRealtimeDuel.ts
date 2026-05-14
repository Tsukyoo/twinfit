import { useState, useEffect, useRef, useCallback } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseEnabled } from '../lib/supabase';
import type { DuelPointsRow } from '../lib/supabase';
import { pullDuelPoints, syncWeeklyDuelResults } from '../services/duelSyncService';
import { getWeekStart } from '../logic/weeklyDuelScoring';

// ============================================================
// SYNC STATUS
// ============================================================

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'disabled';

// ============================================================
// REALTIME DUEL HOOK
// Subscribes to Supabase duel_points changes for the current week.
// Falls back gracefully when offline or Supabase is not configured.
// ============================================================

export interface RemoteScores {
  teoman: number | null;
  denizhan: number | null;
}

export interface RealtimeDuelState {
  remoteScores: RemoteScores;
  hasRemoteScores: boolean;
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  /** Pull latest from Supabase immediately */
  refetch: () => void;
  /** @deprecated use refetch */
  triggerSync: () => void;
}

export function useRealtimeDuel(): RealtimeDuelState {
  const weekStart = getWeekStart();

  const [remoteScores, setRemoteScores] = useState<RemoteScores>({ teoman: null, denizhan: null });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    isSupabaseEnabled ? 'idle' : 'disabled'
  );
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const isMountedRef = useRef(true);

  // ──────────────────────────────────────────────
  // Pull remote data once
  // ──────────────────────────────────────────────

  const fetchRemote = useCallback(async () => {
    if (!isSupabaseEnabled) return;

    setSyncStatus('syncing');

    try {
      const rows = await pullDuelPoints(weekStart);
      if (!isMountedRef.current) return;

      if (rows) {
        setRemoteScores({
          teoman: rows.teoman?.total_points ?? null,
          denizhan: rows.denizhan?.total_points ?? null,
        });
        setSyncStatus('synced');
        setLastSyncedAt(new Date().toISOString());
      } else {
        setSyncStatus('offline');
      }

      // Also sync historical weekly results in background
      syncWeeklyDuelResults().catch(() => {});
    } catch {
      if (isMountedRef.current) setSyncStatus('offline');
    }
  }, [weekStart]);

  // ──────────────────────────────────────────────
  // Realtime subscription
  // ──────────────────────────────────────────────

  useEffect(() => {
    isMountedRef.current = true;

    if (!isSupabaseEnabled || !supabase) {
      setSyncStatus('disabled');
      return;
    }

    // Initial fetch
    fetchRemote();

    // Subscribe to changes on duel_points for current week
    const channel = supabase
      .channel(`duel_points_${weekStart}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'duel_points',
          filter: `week_start=eq.${weekStart}`,
        },
        (payload) => {
          if (!isMountedRef.current) return;

          const row = payload.new as DuelPointsRow;
          if (!row?.profile_id) return;

          setRemoteScores((prev) => ({
            ...prev,
            [row.profile_id]: row.total_points,
          }));
          setSyncStatus('synced');
          setLastSyncedAt(new Date().toISOString());
        }
      )
      .subscribe((status) => {
        if (!isMountedRef.current) return;
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setSyncStatus('offline');
        }
      });

    channelRef.current = channel;

    // Online/offline detection
    const handleOnline = () => {
      if (isMountedRef.current) fetchRemote();
    };
    window.addEventListener('online', handleOnline);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('online', handleOnline);
      if (channelRef.current && supabase) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [weekStart, fetchRemote]);

  const hasRemoteScores = remoteScores.teoman !== null || remoteScores.denizhan !== null;

  return {
    remoteScores,
    hasRemoteScores,
    syncStatus,
    lastSyncedAt,
    refetch: fetchRemote,
    triggerSync: fetchRemote,
  };
}

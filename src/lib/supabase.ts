import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// ============================================================
// Supabase client — only created when env vars are present.
// When running without a Supabase project the whole sync layer
// silently no-ops so the app stays fully functional locally.
// ============================================================

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        realtime: { params: { eventsPerSecond: 5 } },
      })
    : null;

export const isSupabaseEnabled = supabase !== null;

// ============================================================
// Database row types (mirrors Supabase schema)
// ============================================================

export interface DuelPointsRow {
  id: string;
  profile_id: string;
  week_start: string;
  total_points: number;
  updated_at: string;
}

export interface WeeklyDuelResultRow {
  id: string;
  week_start: string;
  winner_profile_id: string | null;
  teoman_points: number;
  denizhan_points: number;
  created_at: string;
}

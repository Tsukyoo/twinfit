import type {
  WorkoutSession,
  SetLog,
  NutritionLog,
  BodyLog,
  WeeklyCheckin,
  LeaderboardScore,
  SleepLog,
  WeeklyDuelResult,
  ExportData,
  ProfileId,
} from '../types';
import {
  STORES,
  add,
  put,
  get,
  remove,
  getAll,
  getByIndex,
  clearAllData,
} from './indexedDb';
import { profiles } from '../data/profiles';
import { getSettings } from '../utils/storage';

// ========== WORKOUT SESSION REPOSITORY ==========

export const workoutSessionRepo = {
  async create(session: Omit<WorkoutSession, 'id'>): Promise<WorkoutSession> {
    const newSession: WorkoutSession = {
      ...session,
      id: generateId(),
    };
    return add(STORES.WORKOUT_SESSIONS, newSession);
  },

  async update(session: WorkoutSession): Promise<WorkoutSession> {
    return put(STORES.WORKOUT_SESSIONS, session);
  },

  async getById(id: string): Promise<WorkoutSession | undefined> {
    return get(STORES.WORKOUT_SESSIONS, id);
  },

  async getAll(): Promise<WorkoutSession[]> {
    return getAll(STORES.WORKOUT_SESSIONS);
  },

  async getByProfile(profileId: ProfileId): Promise<WorkoutSession[]> {
    return getByIndex(STORES.WORKOUT_SESSIONS, 'profileId', profileId);
  },

  async getActiveByProfile(profileId: ProfileId): Promise<WorkoutSession | undefined> {
    const sessions = await getByIndex<WorkoutSession>(STORES.WORKOUT_SESSIONS, 'profileId', profileId);
    return sessions.find((s) => s.status === 'active');
  },

  async delete(id: string): Promise<void> {
    return remove(STORES.WORKOUT_SESSIONS, id);
  },
};

// ========== SET LOG REPOSITORY ==========

export const setLogRepo = {
  async create(setLog: Omit<SetLog, 'id'>): Promise<SetLog> {
    const newSetLog: SetLog = {
      ...setLog,
      id: generateId(),
    };
    return add(STORES.SET_LOGS, newSetLog);
  },

  async update(setLog: SetLog): Promise<SetLog> {
    return put(STORES.SET_LOGS, setLog);
  },

  async getById(id: string): Promise<SetLog | undefined> {
    return get(STORES.SET_LOGS, id);
  },

  async getAll(): Promise<SetLog[]> {
    return getAll(STORES.SET_LOGS);
  },

  async getBySession(sessionId: string): Promise<SetLog[]> {
    return getByIndex(STORES.SET_LOGS, 'sessionId', sessionId);
  },

  async getByProfile(profileId: ProfileId): Promise<SetLog[]> {
    return getByIndex(STORES.SET_LOGS, 'profileId', profileId);
  },

  async getByExercise(exerciseId: string): Promise<SetLog[]> {
    return getByIndex(STORES.SET_LOGS, 'exerciseId', exerciseId);
  },

  async delete(id: string): Promise<void> {
    return remove(STORES.SET_LOGS, id);
  },

  async deleteBySession(sessionId: string): Promise<void> {
    const logs = await this.getBySession(sessionId);
    for (const log of logs) {
      await this.delete(log.id);
    }
  },
};

// ========== NUTRITION LOG REPOSITORY ==========

export const nutritionLogRepo = {
  async create(log: Omit<NutritionLog, 'id'>): Promise<NutritionLog> {
    const newLog: NutritionLog = {
      ...log,
      id: generateId(),
    };
    return add(STORES.NUTRITION_LOGS, newLog);
  },

  async update(log: NutritionLog): Promise<NutritionLog> {
    return put(STORES.NUTRITION_LOGS, log);
  },

  async getById(id: string): Promise<NutritionLog | undefined> {
    return get(STORES.NUTRITION_LOGS, id);
  },

  async getAll(): Promise<NutritionLog[]> {
    return getAll(STORES.NUTRITION_LOGS);
  },

  async getByProfile(profileId: ProfileId): Promise<NutritionLog[]> {
    return getByIndex(STORES.NUTRITION_LOGS, 'profileId', profileId);
  },

  async getByDate(profileId: ProfileId, date: string): Promise<NutritionLog | undefined> {
    const logs = await getByIndex<NutritionLog>(STORES.NUTRITION_LOGS, 'profileId', profileId);
    return logs.find((l) => l.date === date);
  },

  async getByDateRange(profileId: ProfileId, startDate: string, endDate: string): Promise<NutritionLog[]> {
    const logs = await getByIndex<NutritionLog>(STORES.NUTRITION_LOGS, 'profileId', profileId);
    return logs.filter((l) => l.date >= startDate && l.date <= endDate);
  },

  async delete(id: string): Promise<void> {
    return remove(STORES.NUTRITION_LOGS, id);
  },
};

// ========== BODY LOG REPOSITORY ==========

export const bodyLogRepo = {
  async create(log: Omit<BodyLog, 'id'>): Promise<BodyLog> {
    const newLog: BodyLog = {
      ...log,
      id: generateId(),
    };
    return add(STORES.BODY_LOGS, newLog);
  },

  async update(log: BodyLog): Promise<BodyLog> {
    return put(STORES.BODY_LOGS, log);
  },

  async getById(id: string): Promise<BodyLog | undefined> {
    return get(STORES.BODY_LOGS, id);
  },

  async getAll(): Promise<BodyLog[]> {
    return getAll(STORES.BODY_LOGS);
  },

  async getByProfile(profileId: ProfileId): Promise<BodyLog[]> {
    return getByIndex(STORES.BODY_LOGS, 'profileId', profileId);
  },

  async getLatest(profileId: ProfileId): Promise<BodyLog | undefined> {
    const logs = await getByIndex<BodyLog>(STORES.BODY_LOGS, 'profileId', profileId);
    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  },

  async delete(id: string): Promise<void> {
    return remove(STORES.BODY_LOGS, id);
  },
};

// ========== WEEKLY CHECKIN REPOSITORY ==========

export const weeklyCheckinRepo = {
  async create(checkin: Omit<WeeklyCheckin, 'id'>): Promise<WeeklyCheckin> {
    const newCheckin: WeeklyCheckin = {
      ...checkin,
      id: generateId(),
    };
    return add(STORES.WEEKLY_CHECKINS, newCheckin);
  },

  async update(checkin: WeeklyCheckin): Promise<WeeklyCheckin> {
    return put(STORES.WEEKLY_CHECKINS, checkin);
  },

  async getById(id: string): Promise<WeeklyCheckin | undefined> {
    return get(STORES.WEEKLY_CHECKINS, id);
  },

  async getAll(): Promise<WeeklyCheckin[]> {
    return getAll(STORES.WEEKLY_CHECKINS);
  },

  async getByProfile(profileId: ProfileId): Promise<WeeklyCheckin[]> {
    return getByIndex(STORES.WEEKLY_CHECKINS, 'profileId', profileId);
  },

  async getByWeek(profileId: ProfileId, weekStartDate: string): Promise<WeeklyCheckin | undefined> {
    const checkins = await getByIndex<WeeklyCheckin>(STORES.WEEKLY_CHECKINS, 'profileId', profileId);
    return checkins.find((c) => c.weekStartDate === weekStartDate);
  },

  async delete(id: string): Promise<void> {
    return remove(STORES.WEEKLY_CHECKINS, id);
  },
};

// ========== LEADERBOARD SCORE REPOSITORY ==========

export const leaderboardScoreRepo = {
  async create(score: Omit<LeaderboardScore, 'id'>): Promise<LeaderboardScore> {
    const newScore: LeaderboardScore = {
      ...score,
      id: generateId(),
    };
    return add(STORES.LEADERBOARD_SCORES, newScore);
  },

  async update(score: LeaderboardScore): Promise<LeaderboardScore> {
    return put(STORES.LEADERBOARD_SCORES, score);
  },

  async getById(id: string): Promise<LeaderboardScore | undefined> {
    return get(STORES.LEADERBOARD_SCORES, id);
  },

  async getAll(): Promise<LeaderboardScore[]> {
    return getAll(STORES.LEADERBOARD_SCORES);
  },

  async getByProfile(profileId: ProfileId): Promise<LeaderboardScore[]> {
    return getByIndex(STORES.LEADERBOARD_SCORES, 'profileId', profileId);
  },

  async getLatest(profileId: ProfileId): Promise<LeaderboardScore | undefined> {
    const scores = await getByIndex<LeaderboardScore>(STORES.LEADERBOARD_SCORES, 'profileId', profileId);
    return scores.sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime())[0];
  },

  async delete(id: string): Promise<void> {
    return remove(STORES.LEADERBOARD_SCORES, id);
  },
};

// ========== SLEEP LOG REPOSITORY ==========

export const sleepLogRepo = {
  async create(log: Omit<SleepLog, 'id'>): Promise<SleepLog> {
    const newLog: SleepLog = { ...log, id: generateId() };
    return add(STORES.SLEEP_LOGS, newLog);
  },

  async update(log: SleepLog): Promise<SleepLog> {
    return put(STORES.SLEEP_LOGS, log);
  },

  async getById(id: string): Promise<SleepLog | undefined> {
    return get(STORES.SLEEP_LOGS, id);
  },

  async getAll(): Promise<SleepLog[]> {
    return getAll(STORES.SLEEP_LOGS);
  },

  async getByProfile(profileId: ProfileId): Promise<SleepLog[]> {
    return getByIndex(STORES.SLEEP_LOGS, 'profileId', profileId);
  },

  async getByDate(profileId: ProfileId, date: string): Promise<SleepLog | undefined> {
    const logs = await getByIndex<SleepLog>(STORES.SLEEP_LOGS, 'profileId', profileId);
    return logs.find((l) => l.date === date);
  },

  async getByDateRange(profileId: ProfileId, startDate: string, endDate: string): Promise<SleepLog[]> {
    const logs = await getByIndex<SleepLog>(STORES.SLEEP_LOGS, 'profileId', profileId);
    return logs.filter((l) => l.date >= startDate && l.date <= endDate);
  },

  async delete(id: string): Promise<void> {
    return remove(STORES.SLEEP_LOGS, id);
  },
};

// ========== WEEKLY DUEL RESULT REPOSITORY ==========

export const weeklyDuelResultRepo = {
  async getAll(): Promise<WeeklyDuelResult[]> {
    return getAll<WeeklyDuelResult>(STORES.WEEKLY_DUEL_RESULTS);
  },

  async getByWeekStart(weekStart: string): Promise<WeeklyDuelResult | undefined> {
    const all = await getAll<WeeklyDuelResult>(STORES.WEEKLY_DUEL_RESULTS);
    return all.find((r) => r.weekStart === weekStart);
  },

  async upsert(result: Omit<WeeklyDuelResult, 'id'> & { id?: string }): Promise<WeeklyDuelResult> {
    const existing = await this.getByWeekStart(result.weekStart);
    if (existing) {
      const updated: WeeklyDuelResult = { ...existing, ...result, id: existing.id };
      return put<WeeklyDuelResult>(STORES.WEEKLY_DUEL_RESULTS, updated);
    }
    const newResult: WeeklyDuelResult = { ...result, id: result.id ?? generateId() };
    return add<WeeklyDuelResult>(STORES.WEEKLY_DUEL_RESULTS, newResult);
  },

  async getWinsByProfile(profileId: ProfileId): Promise<number> {
    const all = await getAll<WeeklyDuelResult>(STORES.WEEKLY_DUEL_RESULTS);
    return all.filter((r) => r.winnerProfileId === profileId).length;
  },

  async deleteAll(): Promise<void> {
    const all = await getAll<WeeklyDuelResult>(STORES.WEEKLY_DUEL_RESULTS);
    for (const r of all) {
      await remove(STORES.WEEKLY_DUEL_RESULTS, r.id);
    }
  },
};

// ========== EXPORT / IMPORT ==========

export async function exportAllData(): Promise<ExportData> {
  const [workoutSessions, setLogs, nutritionLogs, bodyLogs, weeklyCheckins, leaderboardScores, weeklyDuelResults] = await Promise.all([
    workoutSessionRepo.getAll(),
    setLogRepo.getAll(),
    nutritionLogRepo.getAll(),
    bodyLogRepo.getAll(),
    weeklyCheckinRepo.getAll(),
    leaderboardScoreRepo.getAll(),
    weeklyDuelResultRepo.getAll(),
  ]);

  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    profiles,
    workoutSessions,
    setLogs,
    nutritionLogs,
    bodyLogs,
    weeklyCheckins,
    leaderboardScores,
    weeklyDuelResults,
    settings: getSettings(),
  };
}

export async function importData(data: ExportData): Promise<void> {
  // TODO: Implement with validation and merge/replace options
  console.log('Import data:', data);
  throw new Error('Import not yet implemented - needs validation and user confirmation');
}

export async function resetAllData(): Promise<void> {
  await clearAllData();
}

// ========== UTILITIES ==========

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

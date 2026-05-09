import type { LeaderboardScore, ProfileId } from '../types';
import { leaderboardScoreRepo } from './repositories';
import { openDB, clearAllData } from './indexedDb';

/**
 * Seed initial data for the application
 * Creates default leaderboard entries for both profiles
 */
export async function seedInitialData(): Promise<void> {
  // Ensure DB is open
  await openDB();

  // Check if we already have leaderboard scores
  const existingScores = await leaderboardScoreRepo.getAll();
  
  if (existingScores.length > 0) {
    console.log('Seed skipped: Data already exists');
    return;
  }

  const now = new Date().toISOString();
  const weekStart = getWeekStartDate();

  // Create initial leaderboard scores for both profiles
  const initialScores: Omit<LeaderboardScore, 'id'>[] = [
    {
      profileId: 'teoman' as ProfileId,
      weekStartDate: weekStart,
      weeklyPoints: 0,
      totalPoints: 0,
      workoutStreak: 0,
      nutritionStreak: 0,
      badges: [],
      updatedAt: now,
    },
    {
      profileId: 'denizhan' as ProfileId,
      weekStartDate: weekStart,
      weeklyPoints: 0,
      totalPoints: 0,
      workoutStreak: 0,
      nutritionStreak: 0,
      badges: [],
      updatedAt: now,
    },
  ];

  for (const score of initialScores) {
    await leaderboardScoreRepo.create(score);
  }

  console.log('Seed completed: Initial leaderboard scores created');
}

/**
 * Get the start date of the current week (Monday)
 */
function getWeekStartDate(): string {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

/**
 * Reset all data and re-seed
 */
export async function resetAndSeed(): Promise<void> {
  await clearAllData();
  await seedInitialData();
}

/**
 * Check if database has been seeded
 */
export async function isSeeded(): Promise<boolean> {
  try {
    const scores = await leaderboardScoreRepo.getAll();
    return scores.length > 0;
  } catch {
    return false;
  }
}

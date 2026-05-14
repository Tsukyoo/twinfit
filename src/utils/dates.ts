/**
 * Date utilities — real system date only.
 */

/**
 * Current Date object (real system time).
 */
export function getNow(): Date {
  return new Date();
}

/**
 * Local YYYY-MM-DD string for today (or a given date).
 * Use this instead of date.toISOString().split('T')[0] which is UTC-based.
 */
export function getLocalDateISO(date?: Date): string {
  const d = date ?? new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Alias for getLocalDateISO() — today's local YYYY-MM-DD.
 */
export function getToday(): string {
  return getLocalDateISO();
}

/**
 * Local YYYY-MM-DD string for N days ago relative to today.
 */
export function getDaysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return getLocalDateISO(d);
}

/**
 * Current day of week (0=Sunday … 6=Saturday).
 */
export function getDayOfWeek(date?: Date): number {
  return (date ?? new Date()).getDay();
}

/**
 * Monday of the ISO week containing `date` (defaults to today), as YYYY-MM-DD.
 */
export function getWeekStart(date?: Date): string {
  const d = new Date(date ?? new Date());
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // back to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return getLocalDateISO(d);
}

/**
 * Sunday of the ISO week containing `date` (defaults to today), as YYYY-MM-DD.
 */
export function getWeekEnd(date?: Date): string {
  const d = new Date(date ?? new Date());
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? 0 : 7 - day; // forward to Sunday
  d.setDate(d.getDate() + diff);
  d.setHours(23, 59, 59, 999);
  return getLocalDateISO(d);
}

// ─── Date Helpers ─────────────────────────────
// Shared date utility functions used across server controllers and services.

/**
 * Normalize a date to midnight UTC (strips time component).
 */
export const normalizeDate = (date: Date | string): Date => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/**
 * Get today's date at midnight UTC.
 */
export const getToday = (): Date => normalizeDate(new Date());

/**
 * Get start of week (Sunday = 0 by default).
 */
export const getStartOfWeek = (date: Date = new Date(), weekStartsOn: 0 | 1 = 0): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  d.setDate(d.getDate() - diff);
  return normalizeDate(d);
};

/**
 * Get start/end of a given month.
 */
export const getMonthRange = (year: number, month: number): { start: Date; end: Date } => {
  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
  return { start, end };
};

/**
 * Get the number of days between two dates.
 */
export const daysBetween = (a: Date | string, b: Date | string): number => {
  const msPerDay = 86400000;
  const d1 = normalizeDate(a).getTime();
  const d2 = normalizeDate(b).getTime();
  return Math.round(Math.abs(d2 - d1) / msPerDay);
};

/**
 * Generate an array of dates between start and end (inclusive).
 */
export const getDateRange = (start: Date, end: Date): Date[] => {
  const dates: Date[] = [];
  const current = normalizeDate(start);
  const last = normalizeDate(end);
  while (current <= last) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

/**
 * Format seconds into HH:MM:SS or MM:SS.
 */
export const formatDuration = (totalSeconds: number): string => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

/**
 * Check if a date is today.
 */
export const isToday = (date: Date | string): boolean => {
  const d = normalizeDate(date);
  const today = getToday();
  return d.getTime() === today.getTime();
};

/**
 * Get a date string in YYYY-MM-DD format.
 */
export const toDateString = (date: Date | string): string => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

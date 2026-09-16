// ─── Client-side Date & Time Utilities ─────────
// Reusable helpers for formatting, relative dates, and display logic.

/**
 * Format a date for display: "Mon, Sep 15" or "Today" / "Yesterday".
 */
export const formatDisplayDate = (dateStr: string | Date): string => {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

/**
 * Format seconds into MM:SS or HH:MM:SS.
 */
export const formatTimer = (totalSeconds: number): string => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

/**
 * Format seconds into a human-readable label: "1h 25m", "5m 30s".
 */
export const formatDurationLabel = (totalSeconds: number): string => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

/**
 * Format a date to YYYY-MM-DD for input fields.
 */
export const toInputDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Relative time: "2 hours ago", "3 days ago", etc.
 */
export const timeAgo = (dateStr: string | Date): string => {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Get the day name from a day index (0=Sun, 1=Mon, ...).
 */
export const getDayName = (index: number, short = true): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return short ? days[index].slice(0, 3) : days[index];
};

/**
 * Get the month name from a month index (0=Jan, ...).
 */
export const getMonthName = (index: number, short = true): string => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return short ? months[index].slice(0, 3) : months[index];
};

/**
 * Get an array of dates for a given month (for calendar rendering).
 */
export const getMonthDays = (year: number, month: number): Date[] => {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

/**
 * Get calendar grid (includes padding days from prev/next months for a full 6-row grid).
 */
export const getCalendarGrid = (year: number, month: number, weekStartsOn: 0 | 1 = 0): Date[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const grid: Date[] = [];

  // Pad start
  const startDow = (firstDay.getDay() - weekStartsOn + 7) % 7;
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    grid.push(d);
  }

  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    grid.push(new Date(year, month, d));
  }

  // Pad end to fill 6 rows (42 cells)
  while (grid.length < 42) {
    const nextDate = grid.length - lastDay.getDate() - startDow + 1;
    grid.push(new Date(year, month + 1, nextDate));
  }

  return grid;
};

/**
 * Check if two dates are the same day.
 */
export const isSameDay = (a: Date | string, b: Date | string): boolean => {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return d1.toDateString() === d2.toDateString();
};

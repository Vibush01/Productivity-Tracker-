// ─── App-wide Constants ─────────────────────────
// Centralized constants for consistent usage across all components.

// Pomodoro timer defaults (in seconds)
export const POMODORO_DEFAULTS = {
  WORK: 25 * 60,        // 25 minutes
  SHORT_BREAK: 5 * 60,  // 5 minutes
  LONG_BREAK: 15 * 60,  // 15 minutes
  SESSIONS_BEFORE_LONG: 4,
} as const;

// Countdown timer presets (in seconds)
export const COUNTDOWN_PRESETS = [
  { label: '5 min', value: 5 * 60 },
  { label: '10 min', value: 10 * 60 },
  { label: '15 min', value: 15 * 60 },
  { label: '30 min', value: 30 * 60 },
  { label: '45 min', value: 45 * 60 },
  { label: '1 hr', value: 60 * 60 },
  { label: '2 hr', value: 120 * 60 },
] as const;

// Priority config (reusable across Tasks, Calendar, etc.)
export const PRIORITY_CONFIG = {
  low: { color: '#39FF14', label: 'Low', emoji: '🟢' },
  medium: { color: '#FFB800', label: 'Medium', emoji: '🟡' },
  high: { color: '#FF8C00', label: 'High', emoji: '🟠' },
  urgent: { color: '#FF3B3B', label: 'Urgent', emoji: '🔴' },
} as const;

// Mood config (for Journal and Stats)
export const MOOD_CONFIG = {
  great: { emoji: '😄', label: 'Great', color: '#39FF14' },
  good: { emoji: '🙂', label: 'Good', color: '#00D1FF' },
  okay: { emoji: '😐', label: 'Okay', color: '#FFB800' },
  bad: { emoji: '😔', label: 'Bad', color: '#FF8C00' },
  terrible: { emoji: '😢', label: 'Terrible', color: '#FF3B3B' },
} as const;

// Day labels
export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const DAY_LABELS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

// Month labels
export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

// Time of day config
export const TIME_OF_DAY_CONFIG = {
  morning: { emoji: '🌅', label: 'Morning' },
  afternoon: { emoji: '☀️', label: 'Afternoon' },
  evening: { emoji: '🌆', label: 'Evening' },
  night: { emoji: '🌙', label: 'Night' },
} as const;

// Pomodoro phase labels
export const POMODORO_PHASES = {
  WORK: { label: 'FOCUS', color: '#39FF14' },
  SHORT_BREAK: { label: 'SHORT BREAK', color: '#00D1FF' },
  LONG_BREAK: { label: 'LONG BREAK', color: '#A855F7' },
} as const;

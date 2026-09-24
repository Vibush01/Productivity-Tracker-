/**
 * Design Tokens — Neon Theme
 *
 * Single source of truth for all colors used across the mobile app.
 * Mirrors the web app's CSS variables for visual consistency.
 */

// ─── Dark Mode (OLED Neon) ────────────────────
const darkColors = {
  // Backgrounds
  bgPrimary: '#000000',
  bgSecondary: '#0A0A0A',
  bgTertiary: '#141414',
  bgQuaternary: '#1F1F1F',

  // Neon Accent
  neon: '#39FF14',
  neonDim: '#2ECC0F',
  neonDark: '#1F8A0A',

  // Text
  textPrimary: '#EAEAEA',
  textSecondary: '#888888',
  textTertiary: '#555555',

  // Semantic
  danger: '#FF3B3B',
  dangerDim: '#CC2F2F',
  warning: '#FFB800',
  warningDim: '#CC9300',
  info: '#00D1FF',
  infoDim: '#00A8CC',
  success: '#39FF14',

  // Borders
  border: 'rgba(255, 255, 255, 0.06)',
  borderNeon: 'rgba(57, 255, 20, 0.15)',
  borderNeonStrong: 'rgba(57, 255, 20, 0.3)',

  // Glass
  glass: 'rgba(17, 17, 17, 0.75)',
  glassLight: 'rgba(26, 26, 26, 0.6)',

  // Rarity
  rarityEpic: '#A855F7',
  rarityLegendary: '#FFD700',

  // Priority
  priorityLow: '#888888',
  priorityMedium: '#FFB800',
  priorityHigh: '#FF6B00',
  priorityUrgent: '#FF3B3B',
} as const;

// ─── Light Mode ───────────────────────────────
const lightColors = {
  bgPrimary: '#FAFAFA',
  bgSecondary: '#FFFFFF',
  bgTertiary: '#F3F4F6',
  bgQuaternary: '#E5E7EB',

  neon: '#15803D',
  neonDim: '#166534',
  neonDark: '#14532D',

  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',

  danger: '#DC2626',
  dangerDim: '#B91C1C',
  warning: '#D97706',
  warningDim: '#B45309',
  info: '#0284C7',
  infoDim: '#0369A1',
  success: '#15803D',

  border: 'rgba(0, 0, 0, 0.08)',
  borderNeon: 'rgba(21, 128, 61, 0.15)',
  borderNeonStrong: 'rgba(21, 128, 61, 0.3)',

  glass: 'rgba(255, 255, 255, 0.85)',
  glassLight: 'rgba(245, 245, 247, 0.7)',

  rarityEpic: '#A855F7',
  rarityLegendary: '#FFD700',

  priorityLow: '#9CA3AF',
  priorityMedium: '#D97706',
  priorityHigh: '#EA580C',
  priorityUrgent: '#DC2626',
} as const;

export type ThemeColors = { [K in keyof typeof darkColors]: string };

export const Colors = {
  dark: darkColors as ThemeColors,
  light: lightColors as ThemeColors,
} as const;

export type ThemeMode = keyof typeof Colors;

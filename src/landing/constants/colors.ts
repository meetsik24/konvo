/**
 * Landing page color palette
 * Centralized theme colors for consistency across all pages
 */

export const colors = {
  // Primary dark theme
  dark: {
    bg: '#00333e',
    bgAlt: '#001f26',
    text: '#ffffff',
    textSecondary: '#a0aec0',
  },
  
  // Accent color
  accent: {
    yellow: '#fddf0d',
    yellowHover: '#fce96a',
    yellowDark: '#ffb813',
  },
  
  // Neutral
  neutral: {
    white: '#ffffff',
    black: '#000000',
    gray100: '#f9fafb',
    gray200: '#f3f4f6',
    gray300: '#e5e7eb',
    gray400: '#d1d5db',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
  },
  
  // Semantic
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export const gradients = {
  darkHero: 'from-[#00333e] via-[#001f26] to-[#00333e]',
  darkCard: 'from-[#00333e]/10 to-[#001f26]/5',
};

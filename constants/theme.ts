import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#F8F9FA',
    surface: '#F8F9FA',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    primary: '#3B82F6',
    primaryLight: '#EFF6FF',
    border: '#E5E7EB',
    divider: '#F3F4F6',
    tabBar: '#FFFFFF',
    tint: '#3B82F6',
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#3B82F6',
    tagBackground: '#DBEAFE',
    tagText: '#1D4ED8',
    chipActive: '#3B82F6',
    chipActiveText: '#FFFFFF',
    chipInactive: '#F3F4F6',
    chipInactiveText: '#6B7280',
    premiumBg: '#3B82F6',
    premiumText: '#FFFFFF',
    headerBackground: '#FFFFFF',
    searchBackground: '#F3F4F6',
    quoteBackground: '#EFF6FF',
    quoteBorder: '#3B82F6',
    categoryBadge: '#DBEAFE',
    categoryBadgeText: '#1D4ED8',
    shadow: 'rgba(0,0,0,0.05)',
    errorText: '#EF4444',
    successText: '#10B981',
  },
  dark: {
    background: '#0A0A0A',
    surface: '#0A0A0A',
    card: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textTertiary: '#71717A',
    primary: '#3B82F6',
    primaryLight: '#1E3A8A',
    border: '#27272A',
    divider: '#18181B',
    tabBar: '#1C1C1E',
    tint: '#3B82F6',
    icon: '#A1A1AA',
    tabIconDefault: '#71717A',
    tabIconSelected: '#3B82F6',
    tagBackground: '#1E3A8A',
    tagText: '#60A5FA',
    chipActive: '#3B82F6',
    chipActiveText: '#FFFFFF',
    chipInactive: '#27272A',
    chipInactiveText: '#A1A1AA',
    premiumBg: '#1E3A8A',
    premiumText: '#FFFFFF',
    headerBackground: '#1C1C1E',
    searchBackground: '#27272A',
    quoteBackground: '#1E3A8A',
    quoteBorder: '#3B82F6',
    categoryBadge: '#1E3A8A',
    categoryBadgeText: '#60A5FA',
    shadow: 'rgba(0,0,0,0.5)',
    errorText: '#F87171',
    successText: '#34D399',
  },
};

// Base font sizes (will be multiplied by accessibility scale)
const baseFontSizes = {
  xs: 11,
  sm: 12,
  md: 13,
  base: 14,
  lg: 15,
  xl: 16,
  '2xl': 18,
  '3xl': 20,
  '4xl': 22,
  '5xl': 26,
  '6xl': 32,
};

// Function to get scaled font sizes based on accessibility settings
export const getScaledFontSizes = (fontScale: number = 1) => {
  const scaledSizes: any = {};
  Object.keys(baseFontSizes).forEach((key) => {
    scaledSizes[key] = Math.round(baseFontSizes[key as keyof typeof baseFontSizes] * fontScale);
  });
  return scaledSizes;
};

// Default export for backward compatibility
export const FontSizes = baseFontSizes;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
};

export const BorderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 999,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    mono: 'Courier',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    mono: 'monospace',
  },
});

// Static colors - only for status and special cases
// For theme-aware colors, use useTheme() hook instead
export const COLORS = {
  // Primary colors (static - will be overridden by theme)
  primary: '#0099a8',
  primaryLight: '#E6F6F7',
  primaryDark: '#007A87',
  background: '#FFFFFF',
  
  // Text colors (static - will be overridden by theme)
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  
  // UI colors
  white: '#FFFFFF',
  black: '#000000',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  
  // Status colors (these stay the same regardless of theme)
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Card and surface colors (static - will be overridden by theme)
  card: '#FFFFFF',
  surface: '#F9FAFB',
  cardElevated: '#FFFFFF',
  
  // Border colors (static - will be overridden by theme)
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  // Button colors
  buttonPrimary: '#0099a8',
  buttonSecondary: '#FFFFFF',
  
  // Header colors
  header: '#0099a8',
  headerText: '#FFFFFF',
  
  // Tab bar colors
  tabBar: '#FFFFFF',
  tabBarActive: '#0099a8',
  tabBarInactive: '#6B7280',
};

// Design System Constants
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};
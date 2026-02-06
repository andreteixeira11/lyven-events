import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeColors {
  primary: string;
  primaryLight: string;
  background: string;
  card: string;
  cardElevated: string;
  surface: string;
  text: string;
  textSecondary: string;
  textLight: string;
  border: string;
  borderLight: string;
  notification: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  white: string;
  black: string;
}

const lightColors: ThemeColors = {
  primary: '#0099a8',
  primaryLight: '#E6F6F7',
  background: '#FFFFFF',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  surface: '#F9FAFB',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  notification: '#EF4444',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  white: '#FFFFFF',
  black: '#000000',
};

const darkColors: ThemeColors = {
  primary: '#00B4C6',
  primaryLight: '#1A3A3D',
  background: '#0F0F0F',
  card: '#1A1A1A',
  cardElevated: '#242424',
  surface: '#141414',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textLight: '#6B7280',
  border: '#2D2D2D',
  borderLight: '#1F1F1F',
  notification: '#F87171',
  success: '#34D399',
  error: '#F87171',
  warning: '#FBBF24',
  info: '#60A5FA',
  white: '#FFFFFF',
  black: '#000000',
};

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [theme, setTheme] = useState<Theme>('light');
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      loadTheme().catch(error => {
        console.error('Failed to initialize theme:', error);
      }).finally(() => {
        setInitialized(true);
      });
    }
  }, [initialized]);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const loadTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('theme');
      if (storedTheme) {
        setTheme(storedTheme as Theme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const changeTheme = useCallback(async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, []);

  const getActiveColorScheme = useCallback((): 'light' | 'dark' => {
    if (theme === 'system') {
      return colorScheme === 'dark' ? 'dark' : 'light';
    }
    return theme as 'light' | 'dark';
  }, [theme, colorScheme]);

  const activeColorScheme = getActiveColorScheme();
  const isDark = activeColorScheme === 'dark';
  const colors: ThemeColors = useMemo(() => isDark ? darkColors : lightColors, [isDark]);

  return useMemo(() => ({
    theme,
    colors,
    isDark,
    changeTheme,
    activeColorScheme,
  }), [theme, colors, isDark, changeTheme, activeColorScheme]);
});

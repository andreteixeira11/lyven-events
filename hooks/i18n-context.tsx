import { useState, useEffect, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import i18n, { initI18n, changeLanguage } from '@/lib/i18n';

const boundT = i18n.t.bind(i18n);

export const [I18nProvider, useI18n] = createContextHook(() => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>('pt');

  useEffect(() => {
    let mounted = true;
    const initialize = async () => {
      try {
        const savedLanguage = await initI18n();
        if (mounted) {
          setCurrentLanguage(savedLanguage);
          setIsReady(true);
        }
      } catch (error) {
        console.error('Error initializing i18n:', error);
        if (mounted) {
          setIsReady(true);
        }
      }
    };

    initialize();
    return () => { mounted = false; };
  }, []);

  const switchLanguage = useCallback(async (language: string) => {
    try {
      await changeLanguage(language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  }, []);

  const safeT = useCallback((key: string, options?: any): string => {
    try {
      const result = boundT(key, options);
      if (typeof result === 'string') return result || key;
      return key;
    } catch {
      return key;
    }
  }, []);

  return useMemo(() => ({
    isReady,
    currentLanguage,
    switchLanguage,
    t: safeT,
    i18n,
  }), [isReady, currentLanguage, switchLanguage, safeT]);
});

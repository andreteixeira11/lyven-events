import { useState, useEffect, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import i18n, { initI18n, changeLanguage } from '@/lib/i18n';

export const [I18nProvider, useI18n] = createContextHook(() => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>('pt');

  useEffect(() => {
    const initialize = async () => {
      try {
        const savedLanguage = await initI18n();
        setCurrentLanguage(savedLanguage);
        setIsReady(true);
      } catch (error) {
        console.error('Error initializing i18n:', error);
        setIsReady(true);
      }
    };

    initialize();
  }, []);

  const switchLanguage = useCallback(async (language: string) => {
    try {
      await changeLanguage(language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  }, []);

  return useMemo(() => ({
    isReady,
    currentLanguage,
    switchLanguage,
    t: i18n.t,
    i18n,
  }), [isReady, currentLanguage, switchLanguage]);
});

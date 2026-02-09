import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import pt from '@/locales/pt.json';
import en from '@/locales/en.json';

const LANGUAGE_STORAGE_KEY = '@app_language';

const resources = {
  pt: { translation: pt },
  en: { translation: en },
};

function getDeviceLanguage(): string {
  try {
    const Localization = require('expo-localization');
    const locales = Localization.getLocales();
    if (Array.isArray(locales) && locales.length > 0) {
      const lang = locales[0]?.languageCode;
      if (lang === 'pt' || lang === 'en') return lang;
    }
  } catch (error) {
    console.warn('Failed to get device language:', error);
  }
  return 'pt';
}

const initI18n = async () => {
  try {
    let savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    
    if (!savedLanguage) {
      savedLanguage = getDeviceLanguage();
    }

    if (!i18n.isInitialized) {
      await i18n
        .use(initReactI18next)
        .init({
          resources,
          lng: savedLanguage,
          fallbackLng: 'pt',
          interpolation: {
            escapeValue: false,
          },
        });
    }

    return savedLanguage;
  } catch (error) {
    console.error('Failed to initialize i18n:', error);
    if (!i18n.isInitialized) {
      await i18n
        .use(initReactI18next)
        .init({
          resources,
          lng: 'pt',
          fallbackLng: 'pt',
          interpolation: {
            escapeValue: false,
          },
        });
    }
    return 'pt';
  }
};

export const changeLanguage = async (language: string) => {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  await i18n.changeLanguage(language);
};

export { initI18n };
export default i18n;

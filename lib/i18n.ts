import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import pt from '@/locales/pt.json';
import en from '@/locales/en.json';

const LANGUAGE_STORAGE_KEY = '@app_language';

const resources = {
  pt: { translation: pt },
  en: { translation: en },
};

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  
  if (!savedLanguage) {
    const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'pt';
    savedLanguage = deviceLanguage === 'pt' || deviceLanguage === 'en' ? deviceLanguage : 'pt';
  }

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

  return savedLanguage;
};

export const changeLanguage = async (language: string) => {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  await i18n.changeLanguage(language);
};

export { initI18n };
export default i18n;

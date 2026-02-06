import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Check, Globe } from 'lucide-react-native';
import { useUser } from '@/hooks/user-context';
import { useTheme } from '@/hooks/theme-context';
import { useI18n } from '@/hooks/i18n-context';
import { useTranslation } from 'react-i18next';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
];

export default function LanguageScreen() {
  const { user, updateUser } = useUser();
  const { colors } = useTheme();
  const { currentLanguage, switchLanguage } = useI18n();
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const handleLanguageSelect = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    
    await switchLanguage(languageCode);
    
    if (languageCode === 'pt' || languageCode === 'en') {
      await updateUser({
        preferences: {
          notifications: user?.preferences?.notifications ?? true,
          language: languageCode,
          priceRange: user?.preferences?.priceRange ?? { min: 0, max: 1000 },
          eventTypes: user?.preferences?.eventTypes ?? [],
        },
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('language.title'),
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: 'bold' as const },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <Globe size={48} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('language.selectLanguage')}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {t('language.selectLanguage')}
          </Text>
        </View>

        <View style={[styles.languageList, { backgroundColor: colors.card }]}>
          {LANGUAGES.map((language, index) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageItem,
                index !== LANGUAGES.length - 1 && styles.languageItemBorder,
                { borderBottomColor: colors.border },
              ]}
              onPress={() => handleLanguageSelect(language.code)}
              activeOpacity={0.7}
            >
              <View style={styles.languageLeft}>
                <Text style={styles.flag}>{language.flag}</Text>
                <View style={styles.languageInfo}>
                  <Text style={[styles.languageName, { color: colors.text }]}>
                    {language.nativeName}
                  </Text>
                  <Text style={[styles.languageEnglishName, { color: colors.textSecondary }]}>
                    {language.name}
                  </Text>
                </View>
              </View>
              {selectedLanguage === language.code && (
                <View style={[styles.checkContainer, { backgroundColor: colors.primary }]}>
                  <Check size={16} color={colors.white} strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            {t('language.languageChanged')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  backButton: {
    padding: 8,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  languageList: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  languageItemBorder: {
    borderBottomWidth: 1,
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 32,
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  languageEnglishName: {
    fontSize: 13,
  },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  footer: {
    marginTop: 24,
    paddingHorizontal: 32,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

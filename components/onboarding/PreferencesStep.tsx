import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Bell, DollarSign } from 'lucide-react-native';
import { PRICE_RANGES } from '@/constants/onboarding';
import { COLORS } from '@/constants/colors';

interface PreferencesStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export default function PreferencesStep({ data, onUpdate }: PreferencesStepProps) {
  const [notifications, setNotifications] = useState(
    data.preferences?.notifications ?? true
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState(
    data.preferences?.priceRange || PRICE_RANGES[2]
  );
  const [language, setLanguage] = useState(
    data.preferences?.language || 'pt'
  );

  const handleNotificationToggle = (value: boolean) => {
    setNotifications(value);
    updatePreferences({ notifications: value });
  };

  const handlePriceRangeSelect = (range: typeof PRICE_RANGES[0]) => {
    setSelectedPriceRange(range);
    updatePreferences({ priceRange: range });
  };

  const handleLanguageSelect = (lang: 'pt' | 'en') => {
    setLanguage(lang);
    updatePreferences({ language: lang });
  };

  const updatePreferences = (updates: any) => {
    const currentPreferences = data.preferences || {};
    const updatedPreferences = {
      ...currentPreferences,
      ...updates,
    };
    onUpdate({ preferences: updatedPreferences });
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Bell size={24} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Notificações</Text>
        </View>
        
        <View style={styles.preferenceItem}>
          <View style={styles.preferenceContent}>
            <Text style={styles.preferenceTitle}>
              Receber notificações
            </Text>
            <Text style={styles.preferenceDescription}>
              Eventos recomendados, lembretes e atualizações
            </Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <DollarSign size={24} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Orçamento</Text>
        </View>
        
        <Text style={styles.sectionSubtitle}>
          Selecione a sua faixa de preço preferida para eventos
        </Text>
        
        <View style={styles.priceRanges}>
          {PRICE_RANGES.map((range, index) => (
            <TouchableOpacity
              key={`${range.min}-${range.max}`}
              style={[
                styles.priceRange,
                selectedPriceRange.min === range.min && 
                selectedPriceRange.max === range.max && 
                styles.priceRangeSelected,
              ]}
              onPress={() => handlePriceRangeSelect(range)}
            >
              <Text style={[
                styles.priceRangeText,
                selectedPriceRange.min === range.min && 
                selectedPriceRange.max === range.max && 
                styles.priceRangeTextSelected,
              ]}>
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Idioma</Text>
        
        <View style={styles.languageOptions}>
          <TouchableOpacity
            style={[
              styles.languageOption,
              language === 'pt' && styles.languageOptionSelected,
            ]}
            onPress={() => handleLanguageSelect('pt')}
          >
            <Text style={[
              styles.languageText,
              language === 'pt' && styles.languageTextSelected,
            ]}>
              🇵🇹 Português
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.languageOption,
              language === 'en' && styles.languageOptionSelected,
            ]}
            onPress={() => handleLanguageSelect('en')}
          >
            <Text style={[
              styles.languageText,
              language === 'en' && styles.languageTextSelected,
            ]}>
              🇬🇧 English
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 16,
    lineHeight: 20,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
  },
  preferenceContent: {
    flex: 1,
    marginRight: 16,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 18,
  },
  priceRanges: {
    gap: 12,
  },
  priceRange: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  priceRangeSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  priceRangeText: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  priceRangeTextSelected: {
    color: COLORS.primary,
    fontWeight: 'bold' as const,
  },
  languageOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  languageOption: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  languageOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  languageText: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: '500' as const,
  },
  languageTextSelected: {
    color: COLORS.primary,
    fontWeight: 'bold' as const,
  },
});
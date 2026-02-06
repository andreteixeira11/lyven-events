import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { Sun, Moon, Smartphone, Check } from 'lucide-react-native';
import { useTheme, Theme } from '@/hooks/theme-context';
import * as Haptics from 'expo-haptics';

export default function ThemeSettingsScreen() {
  const { theme, changeTheme, colors, isDark } = useTheme();

  const handleThemeChange = async (newTheme: Theme) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await changeTheme(newTheme);
  };

  const themes: { value: Theme; label: string; icon: typeof Sun; description: string }[] = [
    {
      value: 'light',
      label: 'Modo Claro',
      icon: Sun,
      description: 'Sempre usar tema claro',
    },
    {
      value: 'dark',
      label: 'Modo Escuro',
      icon: Moon,
      description: 'Sempre usar tema escuro',
    },
    {
      value: 'system',
      label: 'Automático',
      icon: Smartphone,
      description: 'Seguir as definições do sistema',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: 'Tema da Aplicação',
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Escolhe como queres que a aplicação apareça. A opção automática usa as definições do teu dispositivo.
          </Text>

          <View style={styles.optionsContainer}>
            {themes.map((item) => {
              const Icon = item.icon;
              const isSelected = theme === item.value;

              return (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.optionCard,
                    { 
                      backgroundColor: colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    }
                  ]}
                  onPress={() => handleThemeChange(item.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionHeader}>
                    <View
                      style={[
                        styles.iconContainer,
                        {
                          backgroundColor: isSelected
                            ? `${colors.primary}20`
                            : colors.background,
                        },
                      ]}
                    >
                      <Icon
                        size={24}
                        color={isSelected ? colors.primary : colors.textSecondary}
                      />
                    </View>

                    {isSelected && (
                      <View
                        style={[
                          styles.checkContainer,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <Check size={16} color={colors.white} />
                      </View>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.optionLabel,
                      {
                        color: isSelected ? colors.primary : colors.text,
                        fontWeight: isSelected ? 'bold' : '600',
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text
                    style={[styles.optionDescription, { color: colors.textSecondary }]}
                  >
                    {item.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.previewContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.previewTitle, { color: colors.text }]}>
              Pré-visualização
            </Text>
            <View
              style={[
                styles.previewBox,
                { backgroundColor: isDark ? '#000' : '#FFF' },
              ]}
            >
              <Text style={[styles.previewText, { color: isDark ? '#FFF' : '#000' }]}>
                {isDark ? 'Tema Escuro Ativo 🌙' : 'Tema Claro Ativo ☀️'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  optionCard: {
    borderRadius: 16,
    padding: 20,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 18,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  previewContainer: {
    borderRadius: 16,
    padding: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginBottom: 12,
  },
  previewBox: {
    borderRadius: 12,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});

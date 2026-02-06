import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import {
  ArrowLeft,
  User,
  Bell,
  Globe,
  Shield,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  Smartphone,
  Mail,
  Lock,
} from 'lucide-react-native';
import { useUser } from '@/hooks/user-context';
import { useTheme } from '@/hooks/theme-context';
import { RADIUS, SHADOWS, SPACING } from '@/constants/colors';

const getLanguageName = (code?: string) => {
  const languages: Record<string, string> = {
    pt: 'Português',
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    it: 'Italiano',
    nl: 'Nederlands',
    pl: 'Polski',
    ru: 'Русский',
    zh: '中文',
    ja: '日本語',
    ko: '한국어',
    ar: 'العربية',
    hi: 'हिन्दी',
  };
  return languages[code || 'pt'] || 'Português';
};

export default function Settings() {
  const { user, logout } = useUser();
  const { colors } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Terminar Sessão',
      'Tem certeza que deseja terminar a sessão?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Terminar Sessão',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true,
    rightComponent 
  }: any) => (
    <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: colors.primary + '15' }]}>
          <Icon size={20} color={colors.primary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent && rightComponent}
        {showArrow && <ChevronRight size={20} color={colors.textSecondary} />}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={[styles.sectionHeader, { color: colors.text }]}>{title}</Text>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Definições',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '600' as const },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={colors.white} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileSection, { backgroundColor: colors.card }, SHADOWS.sm]}>
          <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
            <User size={40} color={colors.white} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>{user?.name || 'Utilizador'}</Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
            <Text style={[styles.profileType, { color: colors.primary }]}>
              {user?.userType === 'promoter' ? 'Promotor' : 'Cliente'}
            </Text>
          </View>
        </View>

        <SectionHeader title="Conta" />
        <View style={[styles.section, { backgroundColor: colors.card }, SHADOWS.sm]}>
          <SettingItem
            icon={User}
            title="Editar Perfil"
            subtitle="Nome, email e foto de perfil"
            onPress={() => router.push('/edit-profile')}
          />
          <SettingItem
            icon={Lock}
            title="Segurança"
            subtitle="Alterar palavra-passe"
            onPress={() => router.push('/security')}
          />
          {user?.userType === 'promoter' && (
            <SettingItem
              icon={CreditCard}
              title="Métodos de Pagamento"
              subtitle="Gerir formas de recebimento"
              onPress={() => router.push('/payment-methods')}
            />
          )}
        </View>

        <SectionHeader title="Notificações" />
        <View style={[styles.section, { backgroundColor: colors.card }, SHADOWS.sm]}>
          <SettingItem
            icon={Bell}
            title="Notificações Push"
            subtitle="Receber alertas no dispositivo"
            showArrow={false}
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            }
          />
          <SettingItem
            icon={Mail}
            title="Email"
            subtitle="Preferências de email"
            onPress={() => router.push('/email-preferences')}
          />
        </View>

        <SectionHeader title="Aplicação" />
        <View style={[styles.section, { backgroundColor: colors.card }, SHADOWS.sm]}>
          <SettingItem
            icon={Globe}
            title="Idioma"
            subtitle={getLanguageName(user?.preferences?.language)}
            onPress={() => router.push('/language')}
          />
          <SettingItem
            icon={Smartphone}
            title="Localização"
            subtitle={locationEnabled ? 'Ativada' : 'Desativada'}
            showArrow={false}
            rightComponent={
              <Switch
                value={locationEnabled}
                onValueChange={setLocationEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            }
          />
        </View>

        <SectionHeader title="Privacidade e Segurança" />
        <View style={[styles.section, { backgroundColor: colors.card }, SHADOWS.sm]}>
          <SettingItem
            icon={Shield}
            title="Privacidade e Dados"
            subtitle="Gerir dados e privacidade"
            onPress={() => Alert.alert('Privacidade', 'Funcionalidade em desenvolvimento')}
          />
          <SettingItem
            icon={HelpCircle}
            title="Termos de Serviço"
            subtitle="Políticas e termos"
            onPress={() => Alert.alert('Termos', 'Funcionalidade em desenvolvimento')}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }, SHADOWS.sm]}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>Terminar Sessão</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Versão 1.0.0</Text>
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xl,
    margin: SPACING.lg,
    borderRadius: RADIUS.lg,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  profileType: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  section: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  footer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});
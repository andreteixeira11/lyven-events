import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { 
  Settings, 
  Bell,
  Shield,
  Database,
  Mail,
  Globe,
  DollarSign,
  Users,
  Calendar,
  Eye,
  Lock,
  Server,
  Smartphone,
  User,
  LogOut,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2
} from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { useUser } from '@/hooks/user-context';

interface SystemSettings {
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    adminAlerts: boolean;
  };
  platform: {
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    eventCreationEnabled: boolean;
    paymentProcessing: boolean;
  };
  security: {
    twoFactorRequired: boolean;
    passwordComplexity: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
  };
  business: {
    platformFee: number;
    promoterCommission: number;
    refundPolicy: number; // days
    eventApprovalRequired: boolean;
  };
  content: {
    autoModeration: boolean;
    profanityFilter: boolean;
    imageModeration: boolean;
    reportThreshold: number;
  };
}

export default function AdminSettings() {
  const { logout } = useUser();
  
  const [settings, setSettings] = useState<SystemSettings>({
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      adminAlerts: true,
    },
    platform: {
      maintenanceMode: false,
      registrationEnabled: true,
      eventCreationEnabled: true,
      paymentProcessing: true,
    },
    security: {
      twoFactorRequired: false,
      passwordComplexity: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
    },
    business: {
      platformFee: 5.0,
      promoterCommission: 85.0,
      refundPolicy: 7,
      eventApprovalRequired: true,
    },
    content: {
      autoModeration: true,
      profanityFilter: true,
      imageModeration: true,
      reportThreshold: 3,
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Terminar Sessão',
      'Tem certeza que deseja terminar a sessão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Terminar Sessão',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          }
        }
      ]
    );
  };

  const ProfileButton = () => (
    <TouchableOpacity
      style={styles.profileButton}
      onPress={handleLogout}
    >
      <User size={20} color={COLORS.white} />
      <LogOut size={16} color={COLORS.white} />
    </TouchableOpacity>
  );

  const updateSetting = (category: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = () => {
    Alert.alert(
      'Guardar Configurações',
      'Tem certeza que deseja guardar as alterações?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Guardar',
          onPress: () => {
            setHasChanges(false);
            Alert.alert('Sucesso', 'Configurações guardadas com sucesso!');
          }
        }
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Repor Configurações',
      'Tem certeza que deseja repor todas as configurações para os valores padrão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Repor',
          style: 'destructive',
          onPress: () => {
            // Reset to default values
            setHasChanges(true);
            Alert.alert('Sucesso', 'Configurações repostas para os valores padrão!');
          }
        }
      ]
    );
  };

  const handleBackupData = () => {
    Alert.alert(
      'Backup de Dados',
      'Iniciar backup completo da base de dados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Iniciar Backup',
          onPress: () => {
            Alert.alert('Backup Iniciado', 'O backup está a ser processado. Será notificado quando estiver concluído.');
          }
        }
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Limpar Cache',
      'Tem certeza que deseja limpar toda a cache do sistema?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Sucesso', 'Cache do sistema limpa com sucesso!');
          }
        }
      ]
    );
  };

  const SettingSection = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Icon size={20} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const SettingRow = ({ 
    title, 
    description, 
    value, 
    onValueChange, 
    type = 'switch',
    placeholder,
    suffix 
  }: { 
    title: string; 
    description?: string; 
    value: any; 
    onValueChange: (value: any) => void;
    type?: 'switch' | 'input' | 'number';
    placeholder?: string;
    suffix?: string;
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      <View style={styles.settingControl}>
        {type === 'switch' && (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '40' }}
            thumbColor={value ? COLORS.primary : COLORS.gray}
          />
        )}
        {type === 'input' && (
          <TextInput
            style={styles.textInput}
            value={value.toString()}
            onChangeText={onValueChange}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textSecondary}
          />
        )}
        {type === 'number' && (
          <View style={styles.numberInputContainer}>
            <TextInput
              style={styles.numberInput}
              value={value.toString()}
              onChangeText={(text) => onValueChange(parseFloat(text) || 0)}
              keyboardType="numeric"
              placeholder={placeholder}
              placeholderTextColor={COLORS.textSecondary}
            />
            {suffix && <Text style={styles.inputSuffix}>{suffix}</Text>}
          </View>
        )}
      </View>
    </View>
  );

  const ActionButton = ({ title, icon: Icon, onPress, color = COLORS.primary, variant = 'primary' }: {
    title: string;
    icon: any;
    onPress: () => void;
    color?: string;
    variant?: 'primary' | 'secondary' | 'danger';
  }) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        variant === 'secondary' && styles.actionButtonSecondary,
        variant === 'danger' && styles.actionButtonDanger,
      ]}
      onPress={onPress}
    >
      <Icon size={20} color={variant === 'primary' ? COLORS.white : color} />
      <Text style={[
        styles.actionButtonText,
        variant === 'primary' && styles.actionButtonTextPrimary,
        variant === 'secondary' && { color },
        variant === 'danger' && { color: COLORS.error },
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Configurações do Sistema',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' as const },
          headerRight: () => <ProfileButton />
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Save/Reset Actions */}
          {hasChanges && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
                <Save size={20} color={COLORS.white} />
                <Text style={styles.saveButtonText}>Guardar Alterações</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Notifications Settings */}
          <SettingSection title="Notificações" icon={Bell}>
            <SettingRow
              title="Notificações por Email"
              description="Enviar notificações importantes por email"
              value={settings.notifications.emailNotifications}
              onValueChange={(value) => updateSetting('notifications', 'emailNotifications', value)}
            />
            <SettingRow
              title="Notificações Push"
              description="Notificações push para dispositivos móveis"
              value={settings.notifications.pushNotifications}
              onValueChange={(value) => updateSetting('notifications', 'pushNotifications', value)}
            />
            <SettingRow
              title="Notificações SMS"
              description="Notificações por SMS para eventos críticos"
              value={settings.notifications.smsNotifications}
              onValueChange={(value) => updateSetting('notifications', 'smsNotifications', value)}
            />
            <SettingRow
              title="Alertas de Administração"
              description="Alertas para administradores sobre atividade suspeita"
              value={settings.notifications.adminAlerts}
              onValueChange={(value) => updateSetting('notifications', 'adminAlerts', value)}
            />
          </SettingSection>

          {/* Platform Settings */}
          <SettingSection title="Plataforma" icon={Globe}>
            <SettingRow
              title="Modo de Manutenção"
              description="Desativar acesso público à plataforma"
              value={settings.platform.maintenanceMode}
              onValueChange={(value) => updateSetting('platform', 'maintenanceMode', value)}
            />
            <SettingRow
              title="Registo Ativo"
              description="Permitir novos registos de utilizadores"
              value={settings.platform.registrationEnabled}
              onValueChange={(value) => updateSetting('platform', 'registrationEnabled', value)}
            />
            <SettingRow
              title="Criação de Eventos"
              description="Permitir criação de novos eventos"
              value={settings.platform.eventCreationEnabled}
              onValueChange={(value) => updateSetting('platform', 'eventCreationEnabled', value)}
            />
            <SettingRow
              title="Processamento de Pagamentos"
              description="Ativar sistema de pagamentos"
              value={settings.platform.paymentProcessing}
              onValueChange={(value) => updateSetting('platform', 'paymentProcessing', value)}
            />
          </SettingSection>

          {/* Security Settings */}
          <SettingSection title="Segurança" icon={Shield}>
            <SettingRow
              title="Autenticação de Dois Fatores"
              description="Obrigar 2FA para todos os utilizadores"
              value={settings.security.twoFactorRequired}
              onValueChange={(value) => updateSetting('security', 'twoFactorRequired', value)}
            />
            <SettingRow
              title="Complexidade de Password"
              description="Exigir passwords complexas"
              value={settings.security.passwordComplexity}
              onValueChange={(value) => updateSetting('security', 'passwordComplexity', value)}
            />
            <SettingRow
              title="Timeout de Sessão"
              description="Minutos até expirar sessão inativa"
              value={settings.security.sessionTimeout}
              onValueChange={(value) => updateSetting('security', 'sessionTimeout', value)}
              type="number"
              suffix="min"
            />
            <SettingRow
              title="Tentativas de Login"
              description="Máximo de tentativas antes de bloquear"
              value={settings.security.maxLoginAttempts}
              onValueChange={(value) => updateSetting('security', 'maxLoginAttempts', value)}
              type="number"
            />
          </SettingSection>

          {/* Business Settings */}
          <SettingSection title="Negócio" icon={DollarSign}>
            <SettingRow
              title="Taxa da Plataforma"
              description="Percentagem cobrada por transação"
              value={settings.business.platformFee}
              onValueChange={(value) => updateSetting('business', 'platformFee', value)}
              type="number"
              suffix="%"
            />
            <SettingRow
              title="Comissão do Promotor"
              description="Percentagem que fica com o promotor"
              value={settings.business.promoterCommission}
              onValueChange={(value) => updateSetting('business', 'promoterCommission', value)}
              type="number"
              suffix="%"
            />
            <SettingRow
              title="Política de Reembolso"
              description="Dias para solicitar reembolso"
              value={settings.business.refundPolicy}
              onValueChange={(value) => updateSetting('business', 'refundPolicy', value)}
              type="number"
              suffix="dias"
            />
            <SettingRow
              title="Aprovação de Eventos"
              description="Exigir aprovação manual de eventos"
              value={settings.business.eventApprovalRequired}
              onValueChange={(value) => updateSetting('business', 'eventApprovalRequired', value)}
            />
          </SettingSection>

          {/* Content Moderation */}
          <SettingSection title="Moderação de Conteúdo" icon={Eye}>
            <SettingRow
              title="Moderação Automática"
              description="Ativar moderação automática de conteúdo"
              value={settings.content.autoModeration}
              onValueChange={(value) => updateSetting('content', 'autoModeration', value)}
            />
            <SettingRow
              title="Filtro de Profanidade"
              description="Filtrar linguagem inadequada"
              value={settings.content.profanityFilter}
              onValueChange={(value) => updateSetting('content', 'profanityFilter', value)}
            />
            <SettingRow
              title="Moderação de Imagens"
              description="Verificar imagens automaticamente"
              value={settings.content.imageModeration}
              onValueChange={(value) => updateSetting('content', 'imageModeration', value)}
            />
            <SettingRow
              title="Limite de Denúncias"
              description="Número de denúncias para ação automática"
              value={settings.content.reportThreshold}
              onValueChange={(value) => updateSetting('content', 'reportThreshold', value)}
              type="number"
            />
          </SettingSection>

          {/* System Actions */}
          <SettingSection title="Ações do Sistema" icon={Server}>
            <View style={styles.systemActions}>
              <ActionButton
                title="Backup da Base de Dados"
                icon={Download}
                onPress={handleBackupData}
                variant="secondary"
                color={COLORS.info}
              />
              <ActionButton
                title="Limpar Cache"
                icon={RefreshCw}
                onPress={handleClearCache}
                variant="secondary"
                color={COLORS.warning}
              />
              <ActionButton
                title="Repor Configurações"
                icon={Trash2}
                onPress={handleResetSettings}
                variant="danger"
              />
            </View>
          </SettingSection>

          {/* System Information */}
          <View style={styles.systemInfo}>
            <Text style={styles.systemInfoTitle}>Informação do Sistema</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Versão da Plataforma:</Text>
              <Text style={styles.infoValue}>v2.1.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Base de Dados:</Text>
              <Text style={styles.infoValue}>PostgreSQL 14.2</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Última Atualização:</Text>
              <Text style={styles.infoValue}>15 Jan 2024, 14:30</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Utilizadores Ativos:</Text>
              <Text style={styles.infoValue}>1,247</Text>
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
    backgroundColor: COLORS.background,
    paddingTop: 20,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  sectionContent: {
    padding: 20,
    gap: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: COLORS.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  settingControl: {
    alignItems: 'flex-end',
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: COLORS.text,
    minWidth: 120,
    textAlign: 'right',
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: COLORS.text,
    minWidth: 80,
    textAlign: 'right',
  },
  inputSuffix: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  systemActions: {
    gap: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 10,
    backgroundColor: COLORS.primary,
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtonDanger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  actionButtonTextPrimary: {
    color: COLORS.white,
  },
  systemInfo: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  systemInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '30',
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: COLORS.text,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 15,
    gap: 6,
  },
});
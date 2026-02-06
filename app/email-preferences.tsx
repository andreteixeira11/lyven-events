import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Mail, Bell, Calendar, TrendingUp, Users, Ticket, Heart } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { useUser } from '@/hooks/user-context';

type NotificationType = {
  id: string;
  title: string;
  description: string;
  icon: any;
  enabled: boolean;
};

export default function EmailPreferences() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([
    {
      id: 'new_events',
      title: 'Novos Eventos',
      description: 'Notificações sobre eventos próximos de si',
      icon: Calendar,
      enabled: true,
    },
    {
      id: 'favorites',
      title: 'Favoritos',
      description: 'Atualizações sobre eventos nos seus favoritos',
      icon: Heart,
      enabled: true,
    },
    {
      id: 'ticket_updates',
      title: 'Bilhetes',
      description: 'Confirmações e atualizações dos seus bilhetes',
      icon: Ticket,
      enabled: true,
    },
    {
      id: 'promoter_updates',
      title: 'Promotores que Segue',
      description: 'Notificações de promotores que segue',
      icon: Users,
      enabled: true,
    },
    {
      id: 'recommendations',
      title: 'Recomendações',
      description: 'Eventos recomendados com base nos seus interesses',
      icon: TrendingUp,
      enabled: false,
    },
    {
      id: 'newsletter',
      title: 'Newsletter',
      description: 'Novidades e promoções semanais',
      icon: Mail,
      enabled: false,
    },
    {
      id: 'marketing',
      title: 'Marketing e Promoções',
      description: 'Ofertas especiais e descontos',
      icon: Bell,
      enabled: false,
    },
  ]);

  const handleToggle = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
      )
    );
  };

  const handleEnableAll = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, enabled: true })));
  };

  const handleDisableAll = () => {
    Alert.alert(
      'Desativar Todas',
      'Tem certeza que deseja desativar todas as notificações por email? Pode perder informações importantes.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Desativar',
          style: 'destructive',
          onPress: () => {
            setNotifications(prev => prev.map(notif => ({ ...notif, enabled: false })));
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert('Sucesso', 'Preferências de email guardadas com sucesso!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch {
      Alert.alert('Erro', 'Não foi possível guardar as preferências');
    } finally {
      setIsLoading(false);
    }
  };

  const NotificationItem = ({ item }: { item: NotificationType }) => {
    const Icon = item.icon;
    return (
      <View style={styles.notificationItem}>
        <View style={styles.notificationLeft}>
          <View style={styles.notificationIcon}>
            <Icon size={20} color={COLORS.primary} />
          </View>
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationDescription}>{item.description}</Text>
          </View>
        </View>
        <Switch
          value={item.enabled}
          onValueChange={() => handleToggle(item.id)}
          trackColor={{ false: COLORS.border, true: COLORS.primary }}
          thumbColor={COLORS.white}
        />
      </View>
    );
  };

  const essentialNotifications = notifications.slice(0, 4);
  const optionalNotifications = notifications.slice(4);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Preferências de Email',
          headerStyle: { backgroundColor: COLORS.header },
          headerTintColor: COLORS.headerText,
          headerTitleStyle: { fontWeight: 'bold' as const },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={COLORS.headerText} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.emailSection}>
          <Mail size={24} color={COLORS.primary} />
          <View style={styles.emailInfo}>
            <Text style={styles.emailLabel}>Email configurado</Text>
            <Text style={styles.emailText}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickButton} onPress={handleEnableAll}>
            <Text style={styles.quickButtonText}>Ativar Todas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickButton, styles.quickButtonOutline]}
            onPress={handleDisableAll}
          >
            <Text style={styles.quickButtonTextOutline}>Desativar Todas</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Notificações Essenciais</Text>
        <View style={styles.section}>
          {essentialNotifications.map((item, index) => (
            <View key={item.id}>
              <NotificationItem item={item} />
              {index < essentialNotifications.length - 1 && (
                <View style={styles.separator} />
              )}
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Notificações Opcionais</Text>
        <View style={styles.section}>
          {optionalNotifications.map((item, index) => (
            <View key={item.id}>
              <NotificationItem item={item} />
              {index < optionalNotifications.length - 1 && (
                <View style={styles.separator} />
              )}
            </View>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Bell size={16} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Algumas notificações importantes, como confirmações de bilhetes e
            atualizações de eventos, não podem ser desativadas.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.saveButtonText}>Guardar Preferências</Text>
          )}
        </TouchableOpacity>

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  emailSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 20,
    marginBottom: 12,
    gap: 16,
  },
  emailInfo: {
    flex: 1,
  },
  emailLabel: {
    fontSize: 12,
    color: COLORS.black,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.black,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  quickButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  quickButtonTextOutline: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.headerText,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.header,
  },
  section: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: COLORS.black,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 13,
    color: COLORS.black,
    lineHeight: 18,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  infoBox: {
    backgroundColor: `${COLORS.primary}15`,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 12,
    flexDirection: 'row',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primary,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  spacer: {
    height: 40,
  },
});
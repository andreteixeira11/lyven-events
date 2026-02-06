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
  Bell,
  Calendar,
  Users,
  TrendingUp,
  MessageSquare,
  Settings,
  Trash2,
  Check,
  X,
} from 'lucide-react-native';
import { useUser } from '@/hooks/user-context';
import { useTheme } from '@/hooks/theme-context';
import { RADIUS, SHADOWS, SPACING } from '@/constants/colors';

interface Notification {
  id: string;
  type: 'event' | 'follower' | 'ticket' | 'promotion' | 'system' | 'new_promoter_event';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionable?: boolean;
  data?: any;
}

export default function Notifications() {
  const { user } = useUser();
  const { colors } = useTheme();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [followerUpdates, setFollowerUpdates] = useState(true);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'event',
      title: 'Novo evento próximo',
      message: 'Arctic Monkeys - Concerto em Lisboa amanhã às 21:00',
      timestamp: new Date('2025-01-18T10:30:00'),
      read: false,
      actionable: true,
    },
    {
      id: '2',
      type: 'follower',
      title: 'Novo seguidor',
      message: 'Maria Santos começou a seguir você',
      timestamp: new Date('2025-01-17T15:45:00'),
      read: false,
    },
    {
      id: '3',
      type: 'ticket',
      title: 'Bilhete validado',
      message: 'Seu bilhete para Festival NOS Alive foi validado com sucesso',
      timestamp: new Date('2025-01-16T20:15:00'),
      read: true,
    },
    {
      id: '4',
      type: 'promotion',
      title: 'Promoção especial',
      message: 'Desconto de 20% em todos os eventos de música eletrônica',
      timestamp: new Date('2025-01-15T12:00:00'),
      read: true,
    },
    {
      id: '5',
      type: 'system',
      title: 'Atualização da app',
      message: 'Nova versão disponível com melhorias de performance',
      timestamp: new Date('2025-01-14T09:00:00'),
      read: true,
    },
  ]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'event':
        return <Calendar size={20} color={colors.primary} />;
      case 'new_promoter_event':
        return <Calendar size={20} color={colors.primary} />;
      case 'follower':
        return <Users size={20} color={colors.info} />;
      case 'ticket':
        return <Check size={20} color={colors.success} />;
      case 'promotion':
        return <TrendingUp size={20} color={colors.warning} />;
      case 'system':
        return <Settings size={20} color={colors.textSecondary} />;
      default:
        return <Bell size={20} color={colors.textSecondary} />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes}m atrás`;
    } else if (hours < 24) {
      return `${hours}h atrás`;
    } else if (days < 7) {
      return `${days}d atrás`;
    } else {
      return date.toLocaleDateString('pt-PT');
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearAll = () => {
    Alert.alert(
      'Limpar Notificações',
      'Tem certeza que deseja remover todas as notificações?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: () => setNotifications([]),
        },
      ]
    );
  };

  const sendMessageToFollowers = () => {
    Alert.alert(
      'Enviar Mensagem',
      'Enviar notificação para todos os seus seguidores?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: () => {
            Alert.alert('Sucesso', 'Mensagem enviada para todos os seguidores!');
          },
        },
      ]
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: `Notificações ${unreadCount > 0 ? `(${unreadCount})` : ''}`,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '600' as const },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={colors.white} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={markAllAsRead}>
                  <Check size={24} color={colors.white} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={clearAll}>
                <Trash2 size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.settingsSection, { backgroundColor: colors.card }, SHADOWS.sm]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Configurações</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Bell size={20} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.text }]}>Notificações Push</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <MessageSquare size={20} color={colors.info} />
              <Text style={[styles.settingText, { color: colors.text }]}>Notificações por Email</Text>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Calendar size={20} color={colors.success} />
              <Text style={[styles.settingText, { color: colors.text }]}>Lembretes de Eventos</Text>
            </View>
            <Switch
              value={eventReminders}
              onValueChange={setEventReminders}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Users size={20} color={colors.warning} />
              <Text style={[styles.settingText, { color: colors.text }]}>Atualizações de Seguidores</Text>
            </View>
            <Switch
              value={followerUpdates}
              onValueChange={setFollowerUpdates}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {user?.userType === 'promoter' && (
          <View style={[styles.promoterSection, { backgroundColor: colors.card }, SHADOWS.sm]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ações do Promotor</Text>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={sendMessageToFollowers}
            >
              <MessageSquare size={20} color={colors.white} />
              <Text style={[styles.actionButtonText, { color: colors.white }]}>Enviar Mensagem aos Seguidores</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.notificationsSection, { backgroundColor: colors.card }, SHADOWS.sm]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Notificações Recentes {unreadCount > 0 && `(${unreadCount} não lidas)`}
          </Text>
          
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Bell size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.text }]}>Nenhuma notificação</Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Você receberá notificações sobre eventos, seguidores e atualizações aqui
              </Text>
            </View>
          ) : (
            notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  { borderBottomColor: colors.border },
                  !notification.read && { backgroundColor: colors.surface }
                ]}
                onPress={() => {
                  markAsRead(notification.id);
                  if (notification.type === 'new_promoter_event' && notification.data?.eventId) {
                    router.push(`/event/${notification.data.eventId}`);
                  }
                }}
              >
                <View style={styles.notificationLeft}>
                  <View style={[styles.notificationIcon, { backgroundColor: colors.surface }]}>
                    {getNotificationIcon(notification.type)}
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={[
                      styles.notificationTitle,
                      { color: colors.text },
                      !notification.read && styles.unreadText
                    ]}>
                      {notification.title}
                    </Text>
                    <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
                      {notification.message}
                    </Text>
                    <Text style={[styles.notificationTime, { color: colors.textLight }]}>
                      {formatTimestamp(notification.timestamp)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.notificationActions}>
                  {!notification.read && (
                    <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                  )}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteNotification(notification.id)}
                  >
                    <X size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  settingsSection: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
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
    gap: SPACING.md,
  },
  settingText: {
    fontSize: 16,
  },
  promoterSection: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    gap: SPACING.md,
    ...SHADOWS.md,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  notificationsSection: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
  },
  notificationLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: SPACING.md,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: '600' as const,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.xs,
  },
  deleteButton: {
    padding: SPACING.xs,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xxxl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  headerRight: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
});
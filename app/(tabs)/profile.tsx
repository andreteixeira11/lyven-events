import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User,
  Settings,
  LogOut,
  Heart,
  Shield,
  HelpCircle,
  Calendar,
  MapPin,
  Users,
  Eye,
  Euro,
  Moon,
  Sun,
  UserPlus,
} from 'lucide-react-native';
import { useUser } from '@/hooks/user-context';
import { useTheme } from '@/hooks/theme-context';
import { useI18n } from '@/hooks/i18n-context';
import { router } from 'expo-router';
import { trpc } from '@/lib/trpc';

export default function ProfileScreen() {
  const { user, logout } = useUser();
  const { theme, isDark, changeTheme, colors } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = useRef<number | null>(null);

  const isAdmin = user?.email === 'geral@lyven.pt';
  const isPromoter = user?.userType === 'promoter';

  const handleLogoTap = () => {
    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    if (newTapCount >= 5) {
      setTapCount(0);
      router.push('/admin-dashboard');
    } else {
      tapTimeoutRef.current = setTimeout(() => {
        setTapCount(0);
      }, 2000) as any;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      t('profile.logout') + '?',
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('auth.logout'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const handleMenuItemPress = (route: string) => {
    router.push(route as any);
  };

  if (isAdmin) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} bounces={false}>
          <View style={[styles.userInfo, { backgroundColor: colors.primary }]}>
            <View style={[styles.avatar, { backgroundColor: colors.white }]}>
              <User size={32} color={colors.primary} />
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: colors.white }]}>{t('auth.admin')}</Text>
              <Text style={[styles.userEmail, { color: colors.white }]}>{user?.email}</Text>
              <View style={styles.promoterBadge}>
                <Shield size={12} color="#FFD700" />
                <Text style={styles.promoterText}>{t('auth.admin')}</Text>
              </View>
            </View>
          </View>
          
          <View style={[styles.menuItems, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin-settings')}>
              <Settings size={20} color={colors.text} />
              <Text style={[styles.menuText, { color: colors.text }]}>{t('admin.systemSettings')}</Text>
            </TouchableOpacity>
            
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            
            <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
              <LogOut size={20} color={colors.error} />
              <Text style={[styles.logoutText, { color: colors.error }]}>{t('auth.logout')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (isPromoter) {
    const { data: profileByUser } = trpc.promoters.getByUserId.useQuery(
      { userId: user?.id ?? '' },
      { enabled: !!user?.id }
    );
    const resolvedPromoterId = profileByUser?.id ?? null;
    const { data: promoterEvents = [] } = trpc.events.list.useQuery(
      resolvedPromoterId ? { promoterId: resolvedPromoterId } : undefined,
      { enabled: !!resolvedPromoterId }
    );
    const now = new Date();
    const nextEventRaw = promoterEvents.find((e: { date: string }) => new Date(e.date) >= now);
    const nextEventId = nextEventRaw?.id;
    const { data: nextEventStats } = trpc.events.statistics.useQuery(
      { id: nextEventId ?? '' },
      { enabled: !!nextEventId }
    );
    const nextEvent = nextEventRaw
      ? {
          id: nextEventRaw.id,
          title: nextEventRaw.title,
          date: nextEventRaw.date,
          image: nextEventRaw.image,
          venue: typeof nextEventRaw.venue === 'object' && nextEventRaw.venue && 'name' in nextEventRaw.venue
            ? (nextEventRaw.venue as { name: string }).name
            : '—',
          ticketsSold: nextEventStats?.totalTicketsSold ?? 0,
          totalTickets: Array.isArray((nextEventRaw as any).ticketTypes)
            ? (nextEventRaw as any).ticketTypes.reduce((s: number, tt: { available?: number }) => s + (tt?.available ?? 0), 0)
            : 0,
          revenue: nextEventStats?.totalRevenue ?? 0,
          views: 0,
        }
      : null;
    const progress =
      nextEvent && nextEvent.totalTickets > 0
        ? (nextEvent.ticketsSold / nextEvent.totalTickets) * 100
        : 0;

    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} bounces={false}>
          <View style={[styles.userInfo, { backgroundColor: colors.primary }]}>
            <View style={[styles.avatar, { backgroundColor: colors.white }]}>
              <User size={32} color={colors.primary} />
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: colors.white }]}>{user?.name || t('auth.promoter')}</Text>
              <Text style={[styles.userEmail, { color: colors.white }]}>{user?.email}</Text>
              <View style={styles.promoterBadge}>
                <Shield size={12} color="#FFD700" />
                <Text style={styles.promoterText}>{t('auth.promoter')}</Text>
              </View>
            </View>
          </View>

          {nextEvent ? (
            <View style={styles.nextEventSection}>
              <TouchableOpacity
                style={styles.nextEventCard}
                onPress={() => router.push(`/promoter-event/${nextEvent.id}` as any)}
              >
                <Image source={{ uri: nextEvent.image }} style={styles.nextEventImage} />
                <View style={styles.nextEventOverlay}>
                  <View style={styles.nextEventHeader}>
                    <Text style={styles.nextEventName}>{nextEvent.title}</Text>
                    <View style={[styles.nextEventDate, { backgroundColor: colors.primary }]}>
                      <Calendar size={14} color="#fff" />
                      <Text style={styles.nextEventDateText}>
                        {new Date(nextEvent.date).toLocaleDateString('pt-PT', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.nextEventVenue}>
                    <MapPin size={12} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.nextEventVenueText}>{nextEvent.venue}</Text>
                  </View>
                  <View style={styles.nextEventStats}>
                    <View style={styles.nextEventStat}>
                      <Users size={14} color="#4CAF50" />
                      <Text style={styles.nextEventStatText}>
                        {nextEvent.ticketsSold}/{nextEvent.totalTickets || '—'}
                      </Text>
                    </View>
                    <View style={styles.nextEventStat}>
                      <Euro size={14} color="#FFD700" />
                      <Text style={styles.nextEventStatText}>
                        €{nextEvent.revenue.toLocaleString('pt-PT')}
                      </Text>
                    </View>
                    <View style={styles.nextEventStat}>
                      <Eye size={14} color="#2196F3" />
                      <Text style={styles.nextEventStatText}>{nextEvent.views > 0 ? nextEvent.views.toLocaleString('pt-PT') : '—'}</Text>
                    </View>
                  </View>
                  <View style={styles.nextEventProgress}>
                    <View style={styles.nextEventProgressBar}>
                      <View
                        style={[styles.nextEventProgressFill, { width: `${Math.min(progress, 100)}%` }]}
                      />
                    </View>
                    <Text style={styles.nextEventProgressText}>
                      {nextEvent.totalTickets > 0 ? `${progress.toFixed(0)}% vendidos` : '—'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              <Text style={[styles.nextEventHint, { color: colors.primary }]}>
                👆 {t('promoter.eventBuyers')}, {t('promoter.scanner')}, {t('promoter.statistics')}
              </Text>
            </View>
          ) : (
            <View style={styles.nextEventSection}>
              <Text style={[styles.nextEventHint, { color: colors.primary }]}>
                Nenhum próximo evento. Crie um na aba Eventos.
              </Text>
            </View>
          )}

          <View style={[styles.menuItems, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('/settings')}>
              <Settings size={20} color={colors.text} />
              <Text style={[styles.menuText, { color: colors.text }]}>{t('profile.settings')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('/help')}>
              <HelpCircle size={20} color={colors.text} />
              <Text style={[styles.menuText, { color: colors.text }]}>{t('profile.help')}</Text>
            </TouchableOpacity>
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
              <LogOut size={20} color={colors.error} />
              <Text style={[styles.logoutText, { color: colors.error }]}>{t('auth.logout')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  const renderUserInfo = () => (
    <View style={[styles.userInfo, { backgroundColor: colors.primary }]}>
      <TouchableOpacity style={[styles.avatar, { backgroundColor: colors.white }]} onPress={handleLogoTap} activeOpacity={0.7}>
        <User size={32} color={colors.primary} />
      </TouchableOpacity>
      <View style={styles.userDetails}>
        <Text style={[styles.userName, { color: colors.white }]}>{user?.name || t('auth.attendee')}</Text>
        <Text style={[styles.userEmail, { color: colors.white }]}>{user?.email}</Text>
      </View>
    </View>
  );

  const MenuItem = ({ icon: Icon, title, onPress }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Icon size={20} color={colors.text} />
      <Text style={[styles.menuText, { color: colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );

  const renderUserMenuItems = () => (
    <>
      <MenuItem
        icon={Heart}
        title={t('favorites.favorites')}
        onPress={() => handleMenuItemPress('/(tabs)/favorites')}
      />

      <MenuItem
        icon={UserPlus}
        title={t('social.following')}
        onPress={() => handleMenuItemPress('/following')}
      />

      <View style={styles.themeMenuItem}>
        <View style={styles.themeLeft}>
          {isDark ? (
            <Moon size={20} color={colors.text} />
          ) : (
            <Sun size={20} color={colors.text} />
          )}
          <Text style={[styles.menuText, { color: colors.text }]}>{t('settings.darkMode')}</Text>
        </View>
        <Switch
          value={theme === 'dark' || (theme === 'system' && isDark)}
          onValueChange={(value) => changeTheme(value ? 'dark' : 'light')}
          trackColor={{ false: '#767577', true: colors.primary }}
          thumbColor={isDark ? '#fff' : '#f4f3f4'}
        />
      </View>
      
      <View style={[styles.separator, { backgroundColor: colors.border }]} />
    </>
  );

  const renderCommonMenuItems = () => (
    <>
      <MenuItem
        icon={Settings}
        title={t('profile.settings')}
        onPress={() => handleMenuItemPress('/settings')}
      />
      
      <MenuItem
        icon={HelpCircle}
        title={t('profile.help')}
        onPress={() => handleMenuItemPress('/help')}
      />
      
      <View style={[styles.separator, { backgroundColor: colors.border }]} />
      
      <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
        <LogOut size={20} color={colors.error} />
        <Text style={[styles.logoutText, { color: colors.error }]}>{t('auth.logout')}</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} bounces={false}>
        {renderUserInfo()}
        
        <View style={[styles.menuItems, { backgroundColor: colors.card }]}>
          {renderUserMenuItems()}
          {renderCommonMenuItems()}
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.9,
  },
  promoterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoterText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold' as const,
    marginLeft: 4,
  },
  approvedIcon: {
    marginLeft: 4,
  },
  menuItems: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '500' as const,
  },
  themeMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  themeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  separator: {
    height: 1,
    marginHorizontal: 20,
    marginVertical: 8,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 16,
    marginLeft: 16,
    fontWeight: 'bold' as const,
  },
  nextEventSection: {
    padding: 20,
  },
  nextEventTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginBottom: 12,
  },
  nextEventCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextEventImage: {
    width: '100%',
    height: 200,
  },
  nextEventOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  nextEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nextEventName: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#fff',
    flex: 1,
  },
  nextEventDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  nextEventDateText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  nextEventVenue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  nextEventVenueText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  nextEventStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  nextEventStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nextEventStatText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600' as const,
  },
  nextEventProgress: {
    marginTop: 8,
  },
  nextEventProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginBottom: 4,
  },
  nextEventProgressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  nextEventProgressText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    textAlign: 'center',
  },
  nextEventHint: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 13,
    fontStyle: 'italic' as const,
  },
});

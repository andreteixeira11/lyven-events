import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthGuard from "@/components/AuthGuard";
import PromoterDashboard from "@/components/PromoterDashboard";
import { useUser } from "@/hooks/user-context";
import { useTheme } from "@/hooks/theme-context";
import { useI18n } from "@/hooks/i18n-context";
import { router } from 'expo-router';
import { Event } from '@/types/event';
import { trpc } from '@/lib/trpc';
import { handleError, isRetryableError } from '@/lib/error-handler';
import { LoadingSpinner, ErrorState, EventListSkeleton } from '@/components/LoadingStates';
import { RefreshControl } from 'react-native';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  UserCheck,
  AlertCircle,
  MapPin
} from 'lucide-react-native';

interface AdminStats {
  totalUsers: number;
  totalPromoters: number;
  totalEvents: number;
  totalRevenue: number;
  pendingApprovals: number;
  activeEvents: number;
  newUsersToday: number;
  newEventsToday: number;
}

function NormalUserExploreContent() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useI18n();
  const [refreshing, setRefreshing] = React.useState(false);

  // Fetch featured events
  const { 
    data: featuredEventsData, 
    isLoading: isLoadingFeatured,
    error: featuredError,
    refetch: refetchFeatured 
  } = trpc.events.list.useQuery({ featured: true });

  // Fetch all upcoming events
  const { 
    data: allEventsData, 
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch: refetchEvents 
  } = trpc.events.list.useQuery({});

  // Transform backend data to Event format
  const featuredEvents: Event[] = React.useMemo(() => {
    if (!featuredEventsData) return [];
    return featuredEventsData.map((e: any) => ({
      ...e,
      date: new Date(e.date),
      endDate: e.endDate ? new Date(e.endDate) : undefined,
    })) as Event[];
  }, [featuredEventsData]);

  const upcomingEvents: Event[] = React.useMemo(() => {
    if (!allEventsData) return [];
    const now = new Date();
    return allEventsData
      .map((e: any) => ({
        ...e,
        date: new Date(e.date),
        endDate: e.endDate ? new Date(e.endDate) : undefined,
      }))
      .filter((e: Event) => e.date > now)
      .sort((a: Event, b: Event) => a.date.getTime() - b.date.getTime())
      .slice(0, 10) as Event[];
  }, [allEventsData]);

  const isLoading = isLoadingFeatured || isLoadingEvents;
  const error = featuredError || eventsError;

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchFeatured(), refetchEvents()]);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchFeatured, refetchEvents]);

  const EventCard = ({ event }: { event: Event }) => (
      <TouchableOpacity
        style={[styles.eventCard, { backgroundColor: colors.card }]}
        onPress={() => router.push(`/event/${event.id}` as any)}
      >
        <Image source={{ uri: event.image }} style={styles.eventCardImage} />
        <View style={styles.eventCardContent}>
          <Text style={[styles.eventCardTitle, { color: colors.text }]} numberOfLines={1}>
            {event.title}
          </Text>
          <View style={styles.eventCardInfo}>
            <Calendar size={14} color={colors.textSecondary} />
            <Text style={[styles.eventCardDate, { color: colors.textSecondary }]}>
              {new Date(event.date).toLocaleDateString('pt-PT', {
                day: 'numeric',
                month: 'short',
              })}
            </Text>
          </View>
          <View style={styles.eventCardInfo}>
            <MapPin size={14} color={colors.textSecondary} />
            <Text style={[styles.eventCardLocation, { color: colors.textSecondary }]} numberOfLines={1}>
              {event.venue.name}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.exploreContent}>
            <View style={styles.exploreHeader}>
              <Text style={[styles.exploreTitle, { color: colors.text }]}>{t('events.title')}</Text>
              <Text style={[styles.exploreSubtitle, { color: colors.textSecondary }]}>{t('search.popularEvents')}</Text>
            </View>
            <EventListSkeleton count={5} />
          </View>
        </ScrollView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <ErrorState
          message={handleError(error)}
          onRetry={isRetryableError(error) ? () => {
            refetchFeatured();
            refetchEvents();
          } : undefined}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.exploreContent}>
          <View style={styles.exploreHeader}>
            <Text style={[styles.exploreTitle, { color: colors.text }]}>{t('events.title')}</Text>
            <Text style={[styles.exploreSubtitle, { color: colors.textSecondary }]}>{t('search.popularEvents')}</Text>
          </View>

          {featuredEvents.length > 0 && (
            <View style={styles.exploreSection}>
              <Text style={[styles.exploreSectionTitle, { color: colors.text }]}>{t('events.featured')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {featuredEvents.map((event: Event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.exploreSection}>
            <Text style={[styles.exploreSectionTitle, { color: colors.text }]}>{t('events.upcoming')}</Text>
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event: Event) => (
                <TouchableOpacity
                  key={event.id}
                  style={[styles.eventListItem, { backgroundColor: colors.card }]}
                  onPress={() => router.push(`/event/${event.id}` as any)}
                >
                  <Image source={{ uri: event.image }} style={styles.eventListImage} />
                  <View style={styles.eventListContent}>
                    <Text style={[styles.eventListTitle, { color: colors.text }]} numberOfLines={1}>
                      {event.title}
                    </Text>
                    <View style={styles.eventListInfo}>
                      <Calendar size={12} color={colors.textSecondary} />
                      <Text style={[styles.eventListText, { color: colors.textSecondary }]}>
                        {event.date.toLocaleDateString('pt-PT', {
                          day: 'numeric',
                          month: 'long',
                        })}
                      </Text>
                    </View>
                    <View style={styles.eventListInfo}>
                      <MapPin size={12} color={colors.textSecondary} />
                      <Text style={[styles.eventListText, { color: colors.textSecondary }]} numberOfLines={1}>
                        {event.venue?.name || ''}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  Nenhum evento próximo disponível
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function IndexContent() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { colors } = useTheme();
  const { t } = useI18n();
  const [stats] = useState<AdminStats>({
    totalUsers: 1247,
    totalPromoters: 89,
    totalEvents: 342,
    totalRevenue: 45670,
    pendingApprovals: 12,
    activeEvents: 156,
    newUsersToday: 23,
    newEventsToday: 8,
  });

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = colors.primary,
    onPress 
  }: {
    title: string;
    value: string | number;
    icon: any;
    color?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={[styles.statCard, { borderLeftColor: color, backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.statCardContent}>
        <View style={styles.statCardLeft}>
          <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
          <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
        </View>
        <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
          <Icon size={24} color={color} />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (user?.email === 'geral@lyven.pt') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={[styles.welcomeText, { color: colors.text }]}>{t('common.welcome')}, {t('auth.admin')}</Text>
              <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>{t('admin.adminDashboard')}</Text>
            </View>

            {stats.pendingApprovals > 0 && (
              <TouchableOpacity 
                style={[styles.alertCard, { backgroundColor: colors.warning + '10', borderColor: colors.warning + '30' }]}
                onPress={() => router.push('/(tabs)/tickets')}
              >
                <AlertCircle size={24} color={colors.warning} />
                <View style={styles.alertContent}>
                  <Text style={[styles.alertTitle, { color: colors.warning }]}>{t('admin.pendingApprovals')}</Text>
                  <Text style={[styles.alertText, { color: colors.textSecondary }]}>
                    {stats.pendingApprovals} {t('admin.pendingAds')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('admin.systemAnalytics')}</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statsRow}>
                  <View style={styles.statsRowItem}>
                    <StatCard
                      title={t('admin.totalUsers')}
                      value={stats.totalUsers.toLocaleString()}
                      icon={Users}
                      onPress={() => router.push('/admin-users')}
                    />
                  </View>
                  <View style={styles.statsRowItem}>
                    <StatCard
                      title={t('admin.promoters')}
                      value={stats.totalPromoters}
                      icon={UserCheck}
                      color={colors.success}
                      onPress={() => router.push('/admin-promoters')}
                    />
                  </View>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.statsRowItem}>
                    <StatCard
                      title={t('admin.totalEvents')}
                      value={stats.totalEvents}
                      icon={Calendar}
                      color={colors.warning}
                      onPress={() => router.push('/admin-events')}
                    />
                  </View>
                  <View style={styles.statsRowItem}>
                    <StatCard
                      title={t('admin.totalRevenue')}
                      value={`€${stats.totalRevenue.toLocaleString()}`}
                      icon={DollarSign}
                      color={colors.success}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('events.today')}</Text>
              <View style={[styles.todayStats, { backgroundColor: colors.card }]}>
                <View style={styles.todayStatItem}>
                  <Text style={[styles.todayStatValue, { color: colors.primary }]}>{stats.newUsersToday}</Text>
                  <Text style={[styles.todayStatLabel, { color: colors.textSecondary }]}>{t('admin.users')}</Text>
                </View>
                <View style={styles.todayStatItem}>
                  <Text style={[styles.todayStatValue, { color: colors.primary }]}>{stats.newEventsToday}</Text>
                  <Text style={[styles.todayStatLabel, { color: colors.textSecondary }]}>{t('admin.events')}</Text>
                </View>
                <View style={styles.todayStatItem}>
                  <Text style={[styles.todayStatValue, { color: colors.primary }]}>{stats.activeEvents}</Text>
                  <Text style={[styles.todayStatLabel, { color: colors.textSecondary }]}>{t('events.upcoming')}</Text>
                </View>
              </View>
            </View>

            <View style={{ paddingBottom: 20 }} />
          </View>
        </ScrollView>
      </View>
    );
  }

  if (user?.userType === 'promoter') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <PromoterDashboard promoterId={user.id} />
      </View>
    );
  }

  return <NormalUserExploreContent />;
}

export default function IndexScreen() {
  return (
    <AuthGuard>
      <IndexContent />
    </AuthGuard>
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
  header: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 16,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginBottom: 15,
  },
  statsGrid: {
    gap: 15,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 15,
  },
  statsRowItem: {
    flex: 1,
  },
  statCard: {
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCardLeft: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 14,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayStats: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todayStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  todayStatValue: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginBottom: 5,
  },
  todayStatLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  alertCard: {
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },
  alertContent: {
    marginLeft: 15,
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginBottom: 2,
  },
  alertText: {
    fontSize: 14,
  },
  exploreContent: {
    padding: 20,
  },
  exploreHeader: {
    marginBottom: 24,
  },
  exploreTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  exploreSubtitle: {
    fontSize: 16,
  },
  exploreSection: {
    marginBottom: 30,
  },
  exploreSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginBottom: 15,
  },
  eventCard: {
    width: 240,
    marginRight: 15,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventCardImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  eventCardContent: {
    padding: 12,
  },
  eventCardTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginBottom: 8,
  },
  eventCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  eventCardDate: {
    fontSize: 13,
  },
  eventCardLocation: {
    fontSize: 13,
    flex: 1,
  },
  eventListItem: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventListImage: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  eventListContent: {
    flex: 1,
    padding: 12,
  },
  eventListTitle: {
    fontSize: 15,
    fontWeight: 'bold' as const,
    marginBottom: 6,
  },
  eventListInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    gap: 4,
  },
  eventListText: {
    fontSize: 12,
    flex: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
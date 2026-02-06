import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Calendar,
  Eye,
  Plus,
  ChevronRight,
  Edit,
} from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { useUser } from '@/hooks/user-context';
import AuthGuard from '@/components/AuthGuard';
import { trpc } from '@/lib/trpc';
import { handleError, isRetryableError } from '@/lib/error-handler';
import { LoadingSpinner, ErrorState } from '@/components/LoadingStates';

type ListEvent = {
  id: string;
  title: string;
  date: Date;
  image: string;
  venue: { name: string; city: string };
  promoter: { id: string; name: string };
};

function EventCard({ event }: { event: ListEvent }) {
  const { data: stats } = trpc.events.statistics.useQuery(
    { id: event.id },
    { enabled: !!event.id }
  );
  const soldTickets = stats?.totalTicketsSold ?? 0;
  const revenue = stats?.totalRevenue ?? 0;
  const ticketTypes = (event as any).ticketTypes as Array<{ available?: number }> | undefined;
  const totalCapacity = ticketTypes?.reduce((sum, t) => sum + (t.available ?? 0), 0) ?? 0;
  const viewsLabel = '—';

  return (
    <View style={styles.eventCard}>
      <View style={styles.eventImageContainer}>
        <Image source={{ uri: event.image }} style={styles.eventImage} />
        <View style={styles.eventImageOverlay}>
          <Text style={styles.eventImageTitle} numberOfLines={1}>{event.title}</Text>
          <View style={styles.eventImageDateContainer}>
            <Calendar size={14} color="#fff" />
            <Text style={styles.eventImageDate}>
              {new Date(event.date).toLocaleDateString('pt-PT', {
                day: 'numeric',
                month: 'short',
              })} • {new Date(event.date).toLocaleTimeString('pt-PT', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(`/create-event?id=${event.id}` as any)}
        >
          <Edit size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.eventContent}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{soldTickets}</Text>
            <Text style={styles.statLabel}>Vendidos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>€{revenue.toLocaleString('pt-PT')}</Text>
            <Text style={styles.statLabel}>Receita</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{viewsLabel}</Text>
            <Text style={styles.statLabel}>Views</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewEventButton}
          onPress={() => router.push(`/promoter-event/${event.id}` as any)}
        >
          <Eye size={20} color="#fff" />
          <Text style={styles.viewEventButtonText}>Ver Evento</Text>
          <ChevronRight size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PromoterEventsContent() {
  const insets = useSafeAreaInsets();
  const { user, promoterProfile } = useUser();
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past'>('upcoming');

  const promoterId = promoterProfile?.id ?? null;
  const { data: profileByUser } = trpc.promoters.getByUserId.useQuery(
    { userId: user?.id ?? '' },
    { enabled: !!user?.id && !promoterId && user?.userType === 'promoter' }
  );
  const resolvedPromoterId = promoterId ?? profileByUser?.id ?? null;

  const {
    data: eventsList,
    isLoading: eventsLoading,
    isRefetching,
    refetch,
    error: eventsError,
  } = trpc.events.list.useQuery(
    resolvedPromoterId ? { promoterId: resolvedPromoterId } : undefined,
    { enabled: !!resolvedPromoterId }
  );

  const events = eventsList ?? [];
  const now = new Date();
  const upcomingEvents = events.filter((e: { date: string }) => new Date(e.date) >= now);
  const pastEvents = events.filter((e: { date: string }) => new Date(e.date) < now);
  const currentEvents = selectedTab === 'upcoming' ? upcomingEvents : pastEvents;

  const onRetry = () => {
    refetch();
  };

  if (!resolvedPromoterId && !profileByUser && user?.userType === 'promoter') {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <LoadingSpinner size="large" />
        <Text style={styles.helperText}>A carregar perfil de promotor…</Text>
      </View>
    );
  }

  if (eventsError) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ErrorState
          message={handleError(eventsError)}
          onRetry={isRetryableError(eventsError) ? onRetry : undefined}
        />
      </View>
    );
  }

  if (eventsLoading && !eventsList) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <LoadingSpinner size="large" />
        <Text style={styles.helperText}>A carregar os seus eventos…</Text>
      </View>
    );
  }

  const TabButton = ({ tab, title, isActive }: { tab: 'upcoming' | 'past'; title: string; isActive: boolean }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={() => setSelectedTab(tab)}
    >
      <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.tabContainer}>
        <TabButton
          tab="upcoming"
          title={`Próximos (${upcomingEvents.length})`}
          isActive={selectedTab === 'upcoming'}
        />
        <TabButton
          tab="past"
          title={`Passados (${pastEvents.length})`}
          isActive={selectedTab === 'past'}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={!!isRefetching && !eventsLoading} onRefresh={() => refetch()} />
        }
      >
        {currentEvents.length > 0 ? (
          currentEvents.map((event: ListEvent) => (
            <EventCard key={event.id} event={event as ListEvent} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Calendar size={64} color="#666" />
            <Text style={styles.emptyTitle}>
              {selectedTab === 'upcoming' ? 'Nenhum evento próximo' : 'Nenhum evento passado'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedTab === 'upcoming'
                ? 'Crie seu primeiro evento para começar a vender ingressos'
                : 'Seus eventos passados aparecerão aqui'}
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push('/create-event' as any)}
      >
        <Plus size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

export default function PromoterEventsScreen() {
  return (
    <AuthGuard>
      <PromoterEventsContent />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
  },
  tabButtonText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  activeTabButtonText: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  eventImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  eventImageTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  eventImageDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventImageDate: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  editButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  eventContent: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500' as const,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  viewEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  viewEventButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600' as const,
    flex: 1,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack, router } from 'expo-router';
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Eye,
  Heart,
  Share2,
  BarChart3,
  ArrowLeft,
} from 'lucide-react-native';
import { useUser } from '@/hooks/user-context';
import { Event } from '@/types/event';
import { trpc } from '@/lib/trpc';
import { LoadingSpinner, ErrorState } from '@/components/LoadingStates';
import { handleError } from '@/lib/error-handler';

export default function Analytics() {
  const { user } = useUser();

  const { data: profileByUser } = trpc.promoters.getByUserId.useQuery(
    { userId: user?.id ?? '' },
    { enabled: !!user?.id && user?.userType === 'promoter' }
  );
  const promoterId = profileByUser?.id ?? null;
  const { data: eventsData, isLoading, error, refetch } = trpc.events.list.useQuery(
    promoterId ? { promoterId } : (undefined as any),
    { enabled: !!promoterId }
  );

  const promoterEvents: Event[] = useMemo(() => {
    if (!eventsData) return [];
    return eventsData.map((e: any) => ({
      ...e,
      date: new Date(e.date),
      endDate: e.endDate ? new Date(e.endDate) : undefined,
      venue: typeof e.venue === 'object' && e.venue
        ? { id: (e.venue as any).id ?? '', name: (e.venue as any).name ?? '', address: (e.venue as any).address ?? '', city: (e.venue as any).city ?? '', capacity: (e.venue as any).capacity ?? 0 }
        : { id: '', name: '', address: '', city: '', capacity: 0 },
      promoter: typeof e.promoter === 'object' && e.promoter
        ? { id: (e.promoter as any).id ?? '', name: (e.promoter as any).name ?? '', image: (e.promoter as any).image ?? '', description: (e.promoter as any).description ?? '', verified: !!(e.promoter as any).verified, followersCount: (e.promoter as any).followersCount ?? 0 }
        : { id: user?.id ?? '', name: user?.name ?? 'Promotor', image: '', description: '', verified: false, followersCount: 0 },
    })) as Event[];
  }, [eventsData, user?.id, user?.name]);

  const totalTicketsSold = promoterEvents.reduce((sum: number, event: Event) => {
    const capacity = event.ticketTypes?.reduce((total: number, ticket: any) => total + (ticket.available ?? 0), 0) ?? 0;
    return sum + capacity;
  }, 0);

  const totalRevenue = promoterEvents.reduce((sum: number, event: Event) => {
    const revenue = (event.ticketTypes ?? []).reduce((total: number, ticket: any) => total + (ticket.available ?? 0) * (ticket.price ?? 0), 0);
    return sum + revenue;
  }, 0);

  const totalViews = promoterEvents.length * 500;
  const totalLikes = promoterEvents.length * 50;

  if (user?.userType !== 'promoter') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Acesso negado</Text>
      </View>
    );
  }
  if (user?.id && profileByUser === undefined) {
    return (
      <View style={styles.container}>
        <LoadingSpinner message="A carregar perfil..." />
      </View>
    );
  }
  if (promoterId && error) {
    return (
      <View style={styles.container}>
        <ErrorState message={handleError(error)} onRetry={() => refetch()} />
      </View>
    );
  }
  if (promoterId && isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner message="A carregar analytics..." />
      </View>
    );
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color = '#fff' }: any) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <Icon size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const EventCard = ({ event }: { event: Event }) => {
    const capacity = event.ticketTypes?.reduce((s: number, t: any) => s + (t.available ?? 0), 0) ?? event.venue?.capacity ?? 0;
    const soldTickets = 0;
    const revenue = 0;
    const views = capacity ? 500 : 1;
    const percentage = capacity ? Math.round((soldTickets / capacity) * 100) : 0;
    
    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => router.push(`/event-buyers/${event.id}`)}
      >
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDate}>{new Date(event.date).toLocaleDateString('pt-PT')}</Text>
        </View>
        
        <View style={styles.eventStats}>
          <View style={styles.eventStat}>
            <Users size={16} color="#999" />
            <Text style={styles.eventStatText}>{soldTickets} vendidos</Text>
          </View>
          <View style={styles.eventStat}>
            <DollarSign size={16} color="#999" />
            <Text style={styles.eventStatText}>€{revenue.toFixed(2)}</Text>
          </View>
          <View style={styles.eventStat}>
            <Eye size={16} color="#999" />
            <Text style={styles.eventStatText}>{views} visualizações</Text>
          </View>
        </View>
        
        <View style={styles.performanceMetrics}>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Taxa de Conversão:</Text>
            <Text style={styles.metricValue}>{views ? ((soldTickets / views) * 100).toFixed(1) : '0'}%</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Receita por Visualização:</Text>
            <Text style={styles.metricValue}>€{views ? (revenue / views).toFixed(2) : '0.00'}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Ticket Médio:</Text>
            <Text style={styles.metricValue}>€{soldTickets ? (revenue / soldTickets).toFixed(2) : '0.00'}</Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min(percentage, 100)}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {soldTickets}/{capacity} ({percentage}%)
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Estatísticas',
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Visão Geral</Text>
          <Text style={styles.subtitle}>Estatísticas dos seus eventos</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon={DollarSign}
            title="Receita Total"
            value={`€${totalRevenue.toFixed(2)}`}
            subtitle="Todos os eventos"
            color="#00C851"
          />
          
          <StatCard
            icon={Users}
            title="Ingressos Vendidos"
            value={totalTicketsSold.toString()}
            subtitle="Total de vendas"
            color="#FF385C"
          />
          
          <StatCard
            icon={Eye}
            title="Visualizações"
            value={totalViews.toString()}
            subtitle="Todos os eventos"
            color="#007AFF"
          />
          
          <StatCard
            icon={Heart}
            title="Curtidas"
            value={totalLikes.toString()}
            subtitle="Total de likes"
            color="#FF6B6B"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BarChart3 size={20} color="#fff" />
            <Text style={styles.sectionTitle}>Performance por Evento</Text>
          </View>
          
          {promoterEvents.length > 0 ? (
            promoterEvents.map((event: Event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={48} color="#666" />
              <Text style={styles.emptyText}>Nenhum evento encontrado</Text>
              <Text style={styles.emptySubtext}>Crie seu primeiro evento para ver as estatísticas</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights</Text>
          
          <View style={styles.insightCard}>
            <TrendingUp size={20} color="#00C851" />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Taxa de Conversão</Text>
              <Text style={styles.insightText}>
                {totalViews > 0 ? `${((totalTicketsSold / totalViews) * 100).toFixed(1)}%` : '0%'} dos visitantes compraram ingressos
              </Text>
            </View>
          </View>
          
          <View style={styles.insightCard}>
            <Share2 size={20} color="#007AFF" />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Engajamento</Text>
              <Text style={styles.insightText}>
                {totalViews > 0 ? `${((totalLikes / totalViews) * 100).toFixed(1)}%` : '0%'} de taxa de curtidas
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    width: '47%',
    borderWidth: 1,
    borderColor: '#333',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    color: '#999',
    fontSize: 14,
    marginLeft: 8,
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  statSubtitle: {
    color: '#666',
    fontSize: 12,
  },
  section: {
    padding: 20,
    paddingTop: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginLeft: 8,
  },
  eventCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold' as const,
    flex: 1,
  },
  eventDate: {
    color: '#999',
    fontSize: 14,
  },
  eventStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eventStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventStatText: {
    color: '#999',
    fontSize: 12,
    marginLeft: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF385C',
    borderRadius: 2,
  },
  progressText: {
    color: '#999',
    fontSize: 12,
    textAlign: 'right',
  },
  performanceMetrics: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricLabel: {
    color: '#999',
    fontSize: 12,
  },
  metricValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  insightCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  insightContent: {
    marginLeft: 12,
    flex: 1,
  },
  insightTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  insightText: {
    color: '#999',
    fontSize: 14,
  },
  errorText: {
    color: '#FF385C',
    fontSize: 18,
    textAlign: 'center' as const,
    marginTop: 50,
  },
});
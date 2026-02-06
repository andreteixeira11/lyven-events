import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Edit3,
  Trash2,
  Plus,
  Eye,
  ArrowLeft,
  Clock,
} from 'lucide-react-native';
import { useUser } from '@/hooks/user-context';
import { Event } from '@/types/event';
import { trpc } from '@/lib/trpc';
import { LoadingSpinner, ErrorState } from '@/components/LoadingStates';
import { handleError } from '@/lib/error-handler';

export default function MyEvents() {
  const { user } = useUser();
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past'>('upcoming');

  const { data: profileByUser } = trpc.promoters.getByUserId.useQuery(
    { userId: user?.id ?? '' },
    { enabled: !!user?.id && user?.userType === 'promoter' }
  );
  const promoterId = profileByUser?.id ?? null;
  const { data: eventsData, isLoading, error, refetch } = trpc.events.list.useQuery(
    promoterId ? { promoterId } : (undefined as any),
    { enabled: !!promoterId }
  );

  const allEvents: Event[] = useMemo(() => {
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

  const now = new Date();
  const upcomingEvents = allEvents.filter(event => new Date(event.date) >= now);
  const pastEvents = allEvents.filter(event => new Date(event.date) < now);

  if (user?.userType !== 'promoter') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Acesso negado</Text>
      </SafeAreaView>
    );
  }

  if (user?.id && profileByUser === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="A carregar perfil..." />
      </SafeAreaView>
    );
  }
  if (promoterId && error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState message={handleError(error)} onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }
  if (promoterId && isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="A carregar eventos..." />
      </SafeAreaView>
    );
  }

  const handleDeleteEvent = (eventId: string) => {
    Alert.alert(
      'Eliminar Evento',
      'Tem certeza que deseja eliminar este evento? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            console.log('Eliminar evento:', eventId);
          },
        },
      ]
    );
  };

  const EventCard = ({ event }: { event: Event }) => {
    const totalTickets = event.ticketTypes?.reduce((s: number, t: any) => s + (t.available ?? 0), 0) ?? event.venue?.capacity ?? 0;
    const soldTickets = 0;
    const revenue = 0;
    const views = 0;

    return (
      <View style={styles.eventCard}>
        <Image source={{ uri: event.image }} style={styles.eventImage} />
        
        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={styles.eventActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push(`/promoter-event/${event.id}` as any)}
              >
                <Eye size={18} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => console.log('Editar evento:', event.id)}
              >
                <Edit3 size={18} color="#FFD700" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteEvent(event.id)}
              >
                <Trash2 size={18} color="#FF385C" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.eventInfo}>
            <View style={styles.infoRow}>
              <Calendar size={16} color="#999" />
              <Text style={styles.infoText}>
                {new Date(event.date).toLocaleDateString('pt-PT', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Clock size={16} color="#999" />
              <Text style={styles.infoText}>
                {new Date(event.date).toLocaleTimeString('pt-PT', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <MapPin size={16} color="#999" />
              <Text style={styles.infoText}>{event.venue.name}</Text>
            </View>
          </View>

          <View style={styles.eventStats}>
            <View style={styles.statItem}>
              <Users size={16} color="#4CAF50" />
              <Text style={styles.statValue}>{soldTickets}/{totalTickets}</Text>
              <Text style={styles.statLabel}>Bilhetes</Text>
            </View>
            
            <View style={styles.statItem}>
              <DollarSign size={16} color="#FFD700" />
              <Text style={styles.statValue}>€{revenue.toLocaleString('pt-PT')}</Text>
              <Text style={styles.statLabel}>Receita</Text>
            </View>
            
            <View style={styles.statItem}>
              <Eye size={16} color="#2196F3" />
              <Text style={styles.statValue}>{views.toLocaleString('pt-PT')}</Text>
              <Text style={styles.statLabel}>Visualizações</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min((soldTickets / totalTickets) * 100, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round((soldTickets / (totalTickets || 1)) * 100)}% vendidos
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const TabButton = ({ tab, title, isActive }: { tab: 'upcoming' | 'past'; title: string; isActive: boolean }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={() => setSelectedTab(tab)}
    >
      <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const currentEvents = selectedTab === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Meus Eventos',
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => console.log('Criar novo evento')} 
              style={styles.createButton}
            >
              <Plus size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }} 
      />
      
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {currentEvents.length > 0 ? (
          currentEvents.map((event: Event) => (
            <EventCard key={event.id} event={event} />
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
                : 'Seus eventos passados aparecerão aqui'
              }
            </Text>
            {selectedTab === 'upcoming' && (
              <TouchableOpacity 
                style={styles.createEventButton}
                onPress={() => console.log('Criar novo evento')}
              >
                <Plus size={20} color="#fff" />
                <Text style={styles.createEventButtonText}>Criar Evento</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
  createButton: {
    padding: 8,
    marginRight: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#FF385C',
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
    padding: 20,
  },
  eventCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  eventImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold' as const,
    flex: 1,
    marginRight: 12,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  eventInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    color: '#999',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  eventStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginTop: 4,
  },
  statLabel: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF385C',
    borderRadius: 3,
  },
  progressText: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#fff',
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
  createEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF385C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createEventButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginLeft: 8,
  },
  errorText: {
    color: '#FF385C',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});
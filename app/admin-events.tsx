import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { 
  Calendar, 
  Search, 
  Filter,
  MapPin,
  DollarSign,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  LogOut,
  Clock,
  Star
} from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { useUser } from '@/hooks/user-context';

interface AdminEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  category: string;
  promoterId: string;
  promoterName: string;
  imageUrl: string;
  price: number;
  totalTickets: number;
  soldTickets: number;
  views: number;
  status: 'active' | 'pending' | 'cancelled' | 'completed';
  isVerified: boolean;
  createdAt: string;
  revenue: number;
}

export default function AdminEvents() {
  const { logout } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'cancelled' | 'completed'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const [events] = useState<AdminEvent[]>([
    {
      id: '1',
      title: 'Festival de Verão 2024',
      description: 'Grande festival de música com artistas nacionais e internacionais',
      date: '2024-07-15',
      time: '20:00',
      location: 'Lisboa',
      venue: 'Altice Arena',
      category: 'Festival',
      promoterId: 'p1',
      promoterName: 'João Silva',
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      price: 25,
      totalTickets: 1500,
      soldTickets: 1250,
      views: 5420,
      status: 'active',
      isVerified: true,
      createdAt: '2024-01-10T10:30:00Z',
      revenue: 31250
    },
    {
      id: '2',
      title: 'Concerto de Jazz',
      description: 'Noite especial de jazz com músicos locais',
      date: '2024-06-20',
      time: '21:30',
      location: 'Porto',
      venue: 'Coliseu do Porto',
      category: 'Música',
      promoterId: 'p2',
      promoterName: 'Maria Santos',
      imageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400',
      price: 15,
      totalTickets: 1000,
      soldTickets: 890,
      views: 3210,
      status: 'active',
      isVerified: true,
      createdAt: '2024-01-08T15:45:00Z',
      revenue: 13350
    },
    {
      id: '3',
      title: 'Teatro Clássico',
      description: 'Peça clássica interpretada por companhia local',
      date: '2024-08-10',
      time: '19:00',
      location: 'Coimbra',
      venue: 'Teatro Académico Gil Vicente',
      category: 'Teatro',
      promoterId: 'p3',
      promoterName: 'Carlos Oliveira',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      price: 12,
      totalTickets: 800,
      soldTickets: 650,
      views: 2180,
      status: 'pending',
      isVerified: false,
      createdAt: '2024-01-05T09:15:00Z',
      revenue: 7800
    },
    {
      id: '4',
      title: 'Stand-up Comedy Night',
      description: 'Noite de comédia com humoristas portugueses',
      date: '2024-05-25',
      time: '22:00',
      location: 'Braga',
      venue: 'Teatro Circo',
      category: 'Comédia',
      promoterId: 'p4',
      promoterName: 'Ana Costa',
      imageUrl: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400',
      price: 18,
      totalTickets: 500,
      soldTickets: 420,
      views: 1890,
      status: 'completed',
      isVerified: true,
      createdAt: '2024-01-03T14:20:00Z',
      revenue: 7560
    },
    {
      id: '5',
      title: 'Evento Cancelado',
      description: 'Este evento foi cancelado devido a circunstâncias imprevistas',
      date: '2024-04-15',
      time: '20:00',
      location: 'Aveiro',
      venue: 'Centro de Congressos',
      category: 'Música',
      promoterId: 'p5',
      promoterName: 'Pedro Martins',
      imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400',
      price: 20,
      totalTickets: 600,
      soldTickets: 150,
      views: 980,
      status: 'cancelled',
      isVerified: false,
      createdAt: '2024-01-01T11:00:00Z',
      revenue: 0
    }
  ]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      case 'completed': return 'Concluído';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'cancelled': return COLORS.error;
      case 'completed': return COLORS.info;
      default: return COLORS.gray;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'pending': return Clock;
      case 'cancelled': return XCircle;
      case 'completed': return Star;
      default: return AlertTriangle;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

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

  const handleEventAction = (eventId: string, action: 'approve' | 'reject' | 'verify' | 'cancel') => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    let title = '';
    let message = '';

    switch (action) {
      case 'approve':
        title = 'Aprovar Evento';
        message = `Tem certeza que deseja aprovar "${event.title}"?`;
        break;
      case 'reject':
        title = 'Rejeitar Evento';
        message = `Tem certeza que deseja rejeitar "${event.title}"?`;
        break;
      case 'verify':
        title = 'Verificar Evento';
        message = `Tem certeza que deseja verificar "${event.title}"?`;
        break;
      case 'cancel':
        title = 'Cancelar Evento';
        message = `Tem certeza que deseja cancelar "${event.title}"?`;
        break;
    }

    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: () => {
          Alert.alert('Sucesso', `Ação realizada com sucesso!`);
        }
      }
    ]);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.promoterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const EventCard = ({ event }: { event: AdminEvent }) => {
    const StatusIcon = getStatusIcon(event.status);
    const soldPercentage = (event.soldTickets / event.totalTickets) * 100;
    
    return (
      <View style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />
          <View style={styles.eventInfo}>
            <View style={styles.eventTitleRow}>
              <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
              {event.isVerified && (
                <CheckCircle size={16} color={COLORS.success} />
              )}
            </View>
            <Text style={styles.eventPromoter}>por {event.promoterName}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) + '20' }]}>
              <StatusIcon size={12} color={getStatusColor(event.status)} />
              <Text style={[styles.statusText, { color: getStatusColor(event.status) }]}>
                {getStatusLabel(event.status)}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <MoreVertical size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Calendar size={14} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{formatDate(event.date)} às {event.time}</Text>
          </View>
          <View style={styles.detailRow}>
            <MapPin size={14} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{event.venue}, {event.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <DollarSign size={14} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>€{event.price} • Categoria: {event.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <Eye size={14} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{event.views} visualizações</Text>
          </View>
        </View>

        <View style={styles.eventStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{event.soldTickets}</Text>
            <Text style={styles.statLabel}>Vendidos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{event.totalTickets}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{soldPercentage.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Taxa</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.success }]}>€{event.revenue.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Receita</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${soldPercentage}%`,
                  backgroundColor: soldPercentage > 80 ? COLORS.success : 
                                 soldPercentage > 50 ? COLORS.warning : COLORS.primary
                }
              ]} 
            />
          </View>
        </View>

        <View style={styles.eventActions}>
          {event.status === 'pending' && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleEventAction(event.id, 'reject')}
              >
                <XCircle size={16} color={COLORS.white} />
                <Text style={styles.actionButtonText}>Rejeitar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleEventAction(event.id, 'approve')}
              >
                <CheckCircle size={16} color={COLORS.white} />
                <Text style={styles.actionButtonText}>Aprovar</Text>
              </TouchableOpacity>
            </>
          )}
          
          {event.status === 'active' && !event.isVerified && (
            <TouchableOpacity
              style={[styles.actionButton, styles.verifyButton]}
              onPress={() => handleEventAction(event.id, 'verify')}
            >
              <CheckCircle size={16} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Verificar</Text>
            </TouchableOpacity>
          )}

          {event.status === 'active' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleEventAction(event.id, 'cancel')}
            >
              <XCircle size={16} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.status === 'active').length;
  const pendingEvents = events.filter(e => e.status === 'pending').length;
  const completedEvents = events.filter(e => e.status === 'completed').length;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Gerir Eventos',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' as const },
          headerRight: () => <ProfileButton />
        }} 
      />
      
      <View style={styles.content}>
        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Procurar eventos..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Filter Options */}
        {showFilters && (
          <View style={styles.filterOptions}>
            {['all', 'active', 'pending', 'completed', 'cancelled'].map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterOption,
                  filterStatus === status && styles.filterOptionActive
                ]}
                onPress={() => setFilterStatus(status as any)}
              >
                <Text style={[
                  styles.filterOptionText,
                  filterStatus === status && styles.filterOptionTextActive
                ]}>
                  {status === 'all' ? 'Todos' : getStatusLabel(status)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalEvents}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.success }]}>{activeEvents}</Text>
            <Text style={styles.statLabel}>Ativos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.warning }]}>{pendingEvents}</Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.info }]}>{completedEvents}</Text>
            <Text style={styles.statLabel}>Concluídos</Text>
          </View>
        </View>

        {/* Events List */}
        <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
          {filteredEvents.length === 0 && (
            <View style={styles.emptyState}>
              <Calendar size={48} color={COLORS.lightGray} />
              <Text style={styles.emptyStateText}>Nenhum evento encontrado</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  filterButton: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterOptions: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
  },
  filterOptionActive: {
    backgroundColor: COLORS.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  filterOptionTextActive: {
    color: COLORS.white,
    fontWeight: 'bold' as const,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  eventsList: {
    flex: 1,
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 12,
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    flex: 1,
  },
  eventPromoter: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  moreButton: {
    padding: 5,
  },
  eventDetails: {
    marginBottom: 15,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  eventStats: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
    marginBottom: 2,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  verifyButton: {
    backgroundColor: COLORS.info,
  },
  cancelButton: {
    backgroundColor: COLORS.warning,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold' as const,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 10,
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
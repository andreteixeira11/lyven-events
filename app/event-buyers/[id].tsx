import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert
} from 'react-native';
import {
  ArrowLeft,
  Search,
  Download,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  QrCode,
  Users,
  DollarSign,
} from 'lucide-react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { LoadingSpinner, ErrorState } from '@/components/LoadingStates';
import { handleError } from '@/lib/error-handler';


interface TicketBuyer {
  id: string;
  name: string;
  email: string;
  phone: string;
  ticketType: string;
  quantity: number;
  purchaseDate: Date;
  totalPaid: number;
  qrCode: string;
  isValidated: boolean;
  validatedAt?: Date;
}

export default function EventBuyersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValidated, setFilterValidated] = useState<'all' | 'validated' | 'pending'>('all');

  const { data: eventData, isLoading, error, refetch } = trpc.events.get.useQuery(
    { id: id ?? '' },
    { enabled: !!id }
  );
  const event = eventData
    ? {
        id: eventData.id,
        title: eventData.title,
        image: eventData.image,
        date: new Date(eventData.date),
        endDate: eventData.endDate ? new Date(eventData.endDate) : undefined,
        venue: typeof eventData.venue === 'object' && eventData.venue
          ? { id: (eventData.venue as any).id ?? '', name: (eventData.venue as any).name ?? '', address: (eventData.venue as any).address ?? '', city: (eventData.venue as any).city ?? '', capacity: (eventData.venue as any).capacity ?? 0 }
          : { id: '', name: '', address: '', city: '', capacity: 0 },
        promoter: typeof eventData.promoter === 'object' && eventData.promoter
          ? { id: (eventData.promoter as any).id ?? '', name: (eventData.promoter as any).name ?? '', image: (eventData.promoter as any).image ?? '', description: (eventData.promoter as any).description ?? '', verified: !!(eventData.promoter as any).verified, followersCount: (eventData.promoter as any).followersCount ?? 0 }
          : { id: '', name: '', image: '', description: '', verified: false, followersCount: 0 },
      }
    : null;

  const mockBuyers: TicketBuyer[] = useMemo(() => [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '+351 912 345 678',
      ticketType: 'VIP',
      quantity: 2,
      purchaseDate: new Date('2025-01-15T14:30:00'),
      totalPaid: 120,
      qrCode: 'QR_1_VIP_1737123456',
      isValidated: true,
      validatedAt: new Date('2025-02-15T19:30:00')
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '+351 923 456 789',
      ticketType: 'Geral',
      quantity: 1,
      purchaseDate: new Date('2025-01-20T10:15:00'),
      totalPaid: 35,
      qrCode: 'QR_1_GERAL_1737456789',
      isValidated: false
    },
    {
      id: '3',
      name: 'Pedro Costa',
      email: 'pedro.costa@email.com',
      phone: '+351 934 567 890',
      ticketType: 'Geral',
      quantity: 4,
      purchaseDate: new Date('2025-01-25T16:45:00'),
      totalPaid: 140,
      qrCode: 'QR_1_GERAL_1737789012',
      isValidated: false
    },
    {
      id: '4',
      name: 'Ana Ferreira',
      email: 'ana.ferreira@email.com',
      phone: '+351 945 678 901',
      ticketType: 'VIP',
      quantity: 1,
      purchaseDate: new Date('2025-02-01T12:20:00'),
      totalPaid: 60,
      qrCode: 'QR_1_VIP_1738012345',
      isValidated: true,
      validatedAt: new Date('2025-02-15T20:15:00')
    }
  ], []);

  const filteredBuyers = useMemo(() => {
    let buyers = mockBuyers;
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      buyers = buyers.filter(buyer => 
        buyer.name.toLowerCase().includes(query) ||
        buyer.email.toLowerCase().includes(query) ||
        buyer.phone.includes(query) ||
        buyer.ticketType.toLowerCase().includes(query)
      );
    }
    
    // Validation filter
    if (filterValidated !== 'all') {
      buyers = buyers.filter(buyer => 
        filterValidated === 'validated' ? buyer.isValidated : !buyer.isValidated
      );
    }
    
    return buyers;
  }, [searchQuery, filterValidated, mockBuyers]);
  
  const totalBuyers = mockBuyers.length;
  const totalTickets = mockBuyers.reduce((sum, buyer) => sum + buyer.quantity, 0);
  const totalRevenue = mockBuyers.reduce((sum, buyer) => sum + buyer.totalPaid, 0);
  const validatedTickets = mockBuyers.filter(buyer => buyer.isValidated).reduce((sum, buyer) => sum + buyer.quantity, 0);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const handleExportData = () => {
    const csvData = [
      ['Nome', 'Email', 'Telefone', 'Tipo de Bilhete', 'Quantidade', 'Total Pago', 'Data de Compra', 'Status', 'QR Code'],
      ...filteredBuyers.map(buyer => [
        buyer.name,
        buyer.email,
        buyer.phone,
        buyer.ticketType,
        buyer.quantity.toString(),
        buyer.totalPaid.toString(),
        formatDate(buyer.purchaseDate),
        buyer.isValidated ? 'Validado' : 'Pendente',
        buyer.qrCode
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    Alert.alert(
      'Dados Exportados',
      `Dados de ${filteredBuyers.length} compradores exportados com sucesso!\n\nConteúdo CSV:\n${csvContent.substring(0, 200)}...`,
      [{ text: 'OK' }]
    );
  };
  
  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner message="A carregar evento..." />
      </View>
    );
  }
  if (error || !event) {
    return (
      <View style={styles.container}>
        <ErrorState message={error ? handleError(error) : 'Evento não encontrado'} onRetry={error ? () => refetch() : undefined} />
      </View>
    );
  }
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Compradores',
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' as const },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={() => router.push(`/qr-scanner/${id}`)}>
                <QrCode size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleExportData}>
                <Download size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )
        }} 
      />
      
      <View style={styles.container}>
        {/* Event Header */}
        <View style={styles.eventHeader}>
          <Image source={{ uri: event.image }} style={styles.eventImage} />
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={styles.eventDetails}>
              <View style={styles.eventDetail}>
                <MapPin size={14} color="#999" />
                <Text style={styles.eventDetailText}>{event.venue.name}</Text>
              </View>
              <View style={styles.eventDetail}>
                <Calendar size={14} color="#999" />
                <Text style={styles.eventDetailText}>{formatDate(event.date)}</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Users size={20} color="#FF385C" />
            <Text style={styles.statValue}>{totalBuyers}</Text>
            <Text style={styles.statLabel}>Compradores</Text>
          </View>
          <View style={styles.statCard}>
            <QrCode size={20} color="#007AFF" />
            <Text style={styles.statValue}>{totalTickets}</Text>
            <Text style={styles.statLabel}>Bilhetes</Text>
          </View>
          <View style={styles.statCard}>
            <DollarSign size={20} color="#00C851" />
            <Text style={styles.statValue}>{formatCurrency(totalRevenue)}</Text>
            <Text style={styles.statLabel}>Receita</Text>
          </View>
          <View style={styles.statCard}>
            <CheckCircle size={20} color="#28A745" />
            <Text style={styles.statValue}>{validatedTickets}</Text>
            <Text style={styles.statLabel}>Validados</Text>
          </View>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progresso de Validação</Text>
            <Text style={styles.progressPercentage}>
              {Math.round((validatedTickets / totalTickets) * 100)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(validatedTickets / totalTickets) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {validatedTickets} de {totalTickets} bilhetes validados
          </Text>
        </View>
        
        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInput}>
            <Search size={20} color="#666" />
            <TextInput
              style={styles.searchText}
              placeholder="Buscar compradores..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
        
        <View style={styles.filtersContainer}>
          {(['all', 'validated', 'pending'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                filterValidated === filter && styles.filterChipActive
              ]}
              onPress={() => setFilterValidated(filter)}
            >
              <Text style={[
                styles.filterText,
                filterValidated === filter && styles.filterTextActive
              ]}>
                {filter === 'all' ? 'Todos' : filter === 'validated' ? 'Validados' : 'Pendentes'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Buyers List */}
        <ScrollView style={styles.buyersList} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultsCount}>
            {filteredBuyers.length} {filteredBuyers.length === 1 ? 'comprador' : 'compradores'}
          </Text>
          
          {filteredBuyers.map((buyer) => (
            <TouchableOpacity 
              key={buyer.id} 
              style={styles.buyerCard}
              onPress={() => router.push(`/buyer-details/${buyer.id}?eventId=${id}`)}
            >
              <View style={styles.buyerHeader}>
                <View style={styles.buyerInfo}>
                  <Text style={styles.buyerName}>{buyer.name}</Text>
                  <Text style={styles.buyerEmail}>{buyer.email}</Text>
                  <Text style={styles.buyerPhone}>{buyer.phone}</Text>
                </View>
                <View style={styles.validationStatus}>
                  {buyer.isValidated ? (
                    <View style={styles.validatedBadge}>
                      <CheckCircle size={16} color="#28A745" />
                      <Text style={styles.validatedText}>Validado</Text>
                    </View>
                  ) : (
                    <View style={styles.pendingBadge}>
                      <XCircle size={16} color="#FFA500" />
                      <Text style={styles.pendingText}>Pendente</Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.ticketInfo}>
                <View style={styles.ticketDetail}>
                  <Text style={styles.ticketLabel}>Tipo de Bilhete</Text>
                  <Text style={styles.ticketValue}>{buyer.ticketType}</Text>
                </View>
                <View style={styles.ticketDetail}>
                  <Text style={styles.ticketLabel}>Quantidade</Text>
                  <Text style={styles.ticketValue}>{buyer.quantity}</Text>
                </View>
                <View style={styles.ticketDetail}>
                  <Text style={styles.ticketLabel}>Total Pago</Text>
                  <Text style={styles.ticketValue}>{formatCurrency(buyer.totalPaid)}</Text>
                </View>
              </View>
              
              <View style={styles.purchaseInfo}>
                <Text style={styles.purchaseDate}>
                  Comprado em {formatDate(buyer.purchaseDate)}
                </Text>
                {buyer.isValidated && buyer.validatedAt && (
                  <Text style={styles.validatedDate}>
                    Validado em {formatDate(buyer.validatedAt)}
                  </Text>
                )}
              </View>
              
              <TouchableOpacity 
                style={styles.detailsButton}
                onPress={() => router.push(`/buyer-details/${buyer.id}?eventId=${id}`)}
              >
                <Text style={styles.detailsButtonText}>Ver Detalhes</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  eventHeader: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  eventInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 8,
  },
  eventDetails: {
    gap: 4,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#999',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterChipActive: {
    backgroundColor: '#FF385C',
    borderColor: '#FF385C',
  },
  filterText: {
    fontSize: 14,
    color: '#999',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: 'bold' as const,
  },
  buyersList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  buyerCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  buyerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  buyerInfo: {
    flex: 1,
  },
  buyerName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 4,
  },
  buyerEmail: {
    fontSize: 14,
    color: '#999',
    marginBottom: 2,
  },
  buyerPhone: {
    fontSize: 14,
    color: '#999',
  },
  validationStatus: {
    marginLeft: 12,
  },
  validatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28A74520',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  validatedText: {
    fontSize: 12,
    color: '#28A745',
    fontWeight: 'bold' as const,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA50020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  pendingText: {
    fontSize: 12,
    color: '#FFA500',
    fontWeight: 'bold' as const,
  },
  ticketInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ticketDetail: {
    flex: 1,
  },
  ticketLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  ticketValue: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  purchaseInfo: {
    marginBottom: 12,
  },
  purchaseDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  validatedDate: {
    fontSize: 12,
    color: '#28A745',
  },
  buyerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
    flex: 1,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500' as const,
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#28A745',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28A745',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  detailsButton: {
    backgroundColor: '#FF385C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
});
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  QrCode,
  DollarSign,
  User,
  MessageCircle,

  Ban,
  Tag,
  Gift,
  Clock,
  CreditCard,
  ShoppingBag,
} from 'lucide-react-native';
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
  previousPurchases: number;
  totalSpent: number;
  memberSince: Date;
  tags: string[];
}

const mockBuyersData: { [key: string]: TicketBuyer } = {
  '1': {
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
    validatedAt: new Date('2025-02-15T19:30:00'),
    previousPurchases: 8,
    totalSpent: 680,
    memberSince: new Date('2023-03-10'),
    tags: ['VIP', 'Cliente Fiel', 'Comprador Frequente']
  },
  '2': {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '+351 923 456 789',
    ticketType: 'Geral',
    quantity: 1,
    purchaseDate: new Date('2025-01-20T10:15:00'),
    totalPaid: 35,
    qrCode: 'QR_1_GERAL_1737456789',
    isValidated: false,
    previousPurchases: 2,
    totalSpent: 85,
    memberSince: new Date('2024-06-15'),
    tags: ['Novo Cliente']
  },
  '3': {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro.costa@email.com',
    phone: '+351 934 567 890',
    ticketType: 'Geral',
    quantity: 4,
    purchaseDate: new Date('2025-01-25T16:45:00'),
    totalPaid: 140,
    qrCode: 'QR_1_GERAL_1737789012',
    isValidated: false,
    previousPurchases: 5,
    totalSpent: 390,
    memberSince: new Date('2023-11-20'),
    tags: ['Grupos', 'Comprador Regular']
  },
  '4': {
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
    validatedAt: new Date('2025-02-15T20:15:00'),
    previousPurchases: 12,
    totalSpent: 850,
    memberSince: new Date('2022-09-05'),
    tags: ['VIP', 'Cliente Premium', 'Early Bird']
  }
};

export default function BuyerDetailsScreen() {
  const { id, eventId } = useLocalSearchParams<{ id: string; eventId: string }>();
  const [note, setNote] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);

  const { data: eventData, isLoading, error, refetch } = trpc.events.get.useQuery(
    { id: eventId ?? '' },
    { enabled: !!eventId }
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

  const buyer = mockBuyersData[id || '1'];

  if (!buyer) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Comprador não encontrado</Text>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="A carregar evento..." />
      </SafeAreaView>
    );
  }
  if (error || !event) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState message={error ? handleError(error) : 'Evento não encontrado'} onRetry={error ? () => refetch() : undefined} />
      </SafeAreaView>
    );
  }

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

  const formatShortDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const handleContactEmail = () => {
    Alert.alert(
      'Enviar Email',
      `Enviar email para ${buyer.email}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Enviar', onPress: () => console.log('Email sent to:', buyer.email) }
      ]
    );
  };

  const handleContactPhone = () => {
    Alert.alert(
      'Ligar',
      `Ligar para ${buyer.phone}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ligar', onPress: () => console.log('Calling:', buyer.phone) }
      ]
    );
  };

  const handleRefund = () => {
    Alert.alert(
      'Reembolsar',
      `Confirma o reembolso de ${formatCurrency(buyer.totalPaid)} para ${buyer.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', style: 'destructive', onPress: () => console.log('Refund processed') }
      ]
    );
  };

  const handleScanQR = () => {
    router.push(`/qr-scanner/${eventId}`);
  };

  const handleManualValidation = () => {
    Alert.alert(
      'Validação Manual',
      `Confirma a validação manual do bilhete de ${buyer.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Validar', 
          onPress: () => {
            Alert.alert('Sucesso', 'Bilhete validado com sucesso!');
            console.log('Manual validation processed');
          }
        }
      ]
    );
  };

  const handleSendMessage = () => {
    Alert.alert(
      'Enviar Mensagem',
      'Escreva sua mensagem:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Enviar', onPress: () => console.log('Message sent') }
      ]
    );
  };

  const handleAddNote = () => {
    if (note.trim()) {
      Alert.alert('Nota Adicionada', `Nota guardada: ${note}`);
      setNote('');
    }
  };

  const handleBlockUser = () => {
    Alert.alert(
      isBlocked ? 'Desbloquear Utilizador' : 'Bloquear Utilizador',
      isBlocked 
        ? `Desbloquear ${buyer.name}?`
        : `Bloquear ${buyer.name}? Este utilizador não poderá comprar mais bilhetes.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: isBlocked ? 'Desbloquear' : 'Bloquear', style: 'destructive', onPress: () => setIsBlocked(!isBlocked) }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Detalhes do Comprador',
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#000',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <User size={48} color="#fff" />
          </View>
          
          <Text style={styles.buyerName}>{buyer.name}</Text>
          
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Mail size={16} color="#999" />
              <Text style={styles.contactText}>{buyer.email}</Text>
            </View>
            <View style={styles.contactItem}>
              <Phone size={16} color="#999" />
              <Text style={styles.contactText}>{buyer.phone}</Text>
            </View>
          </View>

          <View style={styles.tagsContainer}>
            {buyer.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Tag size={12} color="#0099a8" />
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {isBlocked && (
            <View style={styles.blockedBanner}>
              <Ban size={16} color="#FF3B30" />
              <Text style={styles.blockedText}>Utilizador Bloqueado</Text>
            </View>
          )}
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <ShoppingBag size={24} color="#0099a8" />
            <Text style={styles.statValue}>{buyer.previousPurchases}</Text>
            <Text style={styles.statLabel}>Compras</Text>
          </View>
          <View style={styles.statBox}>
            <DollarSign size={24} color="#00C851" />
            <Text style={styles.statValue}>{formatCurrency(buyer.totalSpent)}</Text>
            <Text style={styles.statLabel}>Total Gasto</Text>
          </View>
          <View style={styles.statBox}>
            <Clock size={24} color="#FF9500" />
            <Text style={styles.statValue}>{formatShortDate(buyer.memberSince)}</Text>
            <Text style={styles.statLabel}>Membro desde</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compra Atual</Text>
          
          <View style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <View>
                <Text style={styles.eventName}>{event?.title || 'Evento'}</Text>
                <View style={styles.ticketMeta}>
                  <MapPin size={14} color="#999" />
                  <Text style={styles.ticketMetaText}>{event?.venue.name}</Text>
                </View>
                <View style={styles.ticketMeta}>
                  <Calendar size={14} color="#999" />
                  <Text style={styles.ticketMetaText}>{event ? formatDate(event.date) : ''}</Text>
                </View>
              </View>
              
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

            <View style={styles.divider} />

            <View style={styles.ticketDetails}>
              <View style={styles.ticketDetailRow}>
                <Text style={styles.ticketDetailLabel}>Tipo de Bilhete</Text>
                <Text style={styles.ticketDetailValue}>{buyer.ticketType}</Text>
              </View>
              <View style={styles.ticketDetailRow}>
                <Text style={styles.ticketDetailLabel}>Quantidade</Text>
                <Text style={styles.ticketDetailValue}>{buyer.quantity}</Text>
              </View>
              <View style={styles.ticketDetailRow}>
                <Text style={styles.ticketDetailLabel}>Total Pago</Text>
                <Text style={styles.ticketDetailValue}>{formatCurrency(buyer.totalPaid)}</Text>
              </View>
              <View style={styles.ticketDetailRow}>
                <Text style={styles.ticketDetailLabel}>Data da Compra</Text>
                <Text style={styles.ticketDetailValue}>{formatDate(buyer.purchaseDate)}</Text>
              </View>
              {buyer.isValidated && buyer.validatedAt && (
                <View style={styles.ticketDetailRow}>
                  <Text style={styles.ticketDetailLabel}>Data de Validação</Text>
                  <Text style={[styles.ticketDetailValue, { color: '#28A745' }]}>
                    {formatDate(buyer.validatedAt)}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.qrSection}>
              <Text style={styles.qrLabel}>Código QR</Text>
              <View style={styles.qrCodeBox}>
                <QrCode size={32} color="#0099a8" />
                <Text style={styles.qrCode}>{buyer.qrCode}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={handleContactEmail}>
              <Mail size={24} color="#0099a8" />
              <Text style={styles.actionCardText}>Enviar Email</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={handleContactPhone}>
              <Phone size={24} color="#0099a8" />
              <Text style={styles.actionCardText}>Ligar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={handleSendMessage}>
              <MessageCircle size={24} color="#0099a8" />
              <Text style={styles.actionCardText}>Mensagem</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={handleScanQR}>
              <QrCode size={24} color="#0099a8" />
              <Text style={styles.actionCardText}>Scan QR</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionCard, buyer.isValidated && styles.actionCardDisabled]} 
              onPress={handleManualValidation}
              disabled={buyer.isValidated}
            >
              <CheckCircle size={24} color={buyer.isValidated ? "#999" : "#0099a8"} />
              <Text style={styles.actionCardText}>Validação Manual</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notas Internas</Text>
          
          <TextInput
            style={styles.noteInput}
            placeholder="Adicionar nota sobre este comprador..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={note}
            onChangeText={setNote}
          />
          
          <TouchableOpacity 
            style={[styles.addNoteButton, !note.trim() && styles.addNoteButtonDisabled]}
            onPress={handleAddNote}
            disabled={!note.trim()}
          >
            <Text style={styles.addNoteButtonText}>Guardar Nota</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestão de Conta</Text>
          
          <View style={styles.managementCard}>
            <View style={styles.managementRow}>
              <View style={styles.managementInfo}>
                <Ban size={20} color="#FF3B30" />
                <Text style={styles.managementText}>
                  {isBlocked ? 'Utilizador Bloqueado' : 'Bloquear Utilizador'}
                </Text>
              </View>
              <Switch
                value={isBlocked}
                onValueChange={handleBlockUser}
                trackColor={{ false: '#ccc', true: '#FF3B30' }}
                thumbColor={isBlocked ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.managementRow} onPress={handleRefund}>
              <View style={styles.managementInfo}>
                <CreditCard size={20} color="#FF9500" />
                <Text style={styles.managementText}>Processar Reembolso</Text>
              </View>
              <ArrowLeft size={20} color="#999" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico de Compras</Text>
          
          <View style={styles.historyCard}>
            <View style={styles.historyItem}>
              <View style={styles.historyIcon}>
                <Gift size={20} color="#0099a8" />
              </View>
              <View style={styles.historyContent}>
                <Text style={styles.historyTitle}>Festival de Verão 2024</Text>
                <Text style={styles.historyDate}>15 Jul 2024</Text>
              </View>
              <Text style={styles.historyAmount}>{formatCurrency(85)}</Text>
            </View>

            <View style={styles.historyItem}>
              <View style={styles.historyIcon}>
                <Gift size={20} color="#0099a8" />
              </View>
              <View style={styles.historyContent}>
                <Text style={styles.historyTitle}>Concerto Rock Nacional</Text>
                <Text style={styles.historyDate}>03 Mai 2024</Text>
              </View>
              <Text style={styles.historyAmount}>{formatCurrency(120)}</Text>
            </View>

            <View style={styles.historyItem}>
              <View style={styles.historyIcon}>
                <Gift size={20} color="#0099a8" />
              </View>
              <View style={styles.historyContent}>
                <Text style={styles.historyTitle}>Festival Eletrônico</Text>
                <Text style={styles.historyDate}>20 Fev 2024</Text>
              </View>
              <Text style={styles.historyAmount}>{formatCurrency(95)}</Text>
            </View>

            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>Ver Todas as Compras</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  errorText: {
    color: '#000',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#0099a8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buyerName: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#000',
    marginBottom: 12,
  },
  contactInfo: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0099a820',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#0099a8',
    fontWeight: '600' as const,
  },
  blockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B3020',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  blockedText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: 'bold' as const,
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#000',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#000',
    marginBottom: 16,
  },
  ticketCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#000',
    marginBottom: 8,
  },
  ticketMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  ticketMetaText: {
    fontSize: 13,
    color: '#666',
  },
  validatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28A74520',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  pendingText: {
    fontSize: 12,
    color: '#FFA500',
    fontWeight: 'bold' as const,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  ticketDetails: {
    gap: 12,
  },
  ticketDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketDetailLabel: {
    fontSize: 14,
    color: '#666',
  },
  ticketDetailValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#000',
  },
  qrSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  qrLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  qrCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  qrCode: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#000',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionCardDisabled: {
    opacity: 0.5,
  },
  actionCardText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  noteInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  addNoteButton: {
    backgroundColor: '#0099a8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addNoteButtonDisabled: {
    opacity: 0.5,
  },
  addNoteButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  managementCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  managementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  managementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  managementText: {
    fontSize: 16,
    color: '#000',
  },
  historyCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0099a820',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#000',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: '#666',
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#0099a8',
  },
  viewAllButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#0099a8',
    fontWeight: '600' as const,
  },
});

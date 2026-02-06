import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { 
  Check, 
  X, 
  Calendar,
  MapPin,
  User,
  LogOut,
  Megaphone,
  Users,
  Image as ImageIcon
} from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { useUser } from '@/hooks/user-context';

interface PendingEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  price: number;
  imageUrl: string;
  description: string;
  promoterName: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  category: string;
}

interface PendingPromoter {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  description: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  documentUrl?: string;
}

interface PendingAdvertisement {
  id: string;
  title: string;
  promoterName: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  targetUrl: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  price: number;
}

type TabType = 'promoters' | 'events' | 'ads';

export default function AdminApprovals() {
  const { logout } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>('promoters');
  
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([
    {
      id: 'e1',
      title: 'Festival de Verão 2024',
      date: '2024-07-15',
      location: 'Lisboa',
      price: 25,
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      description: 'Grande festival de música com artistas nacionais e internacionais',
      promoterName: 'João Silva',
      submittedAt: '2024-01-15T10:30:00Z',
      status: 'pending',
      category: 'Música'
    },
    {
      id: 'e2',
      title: 'Concerto de Jazz',
      date: '2024-06-20',
      location: 'Porto',
      price: 15,
      imageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400',
      description: 'Noite especial de jazz com músicos locais',
      promoterName: 'Maria Santos',
      submittedAt: '2024-01-14T15:45:00Z',
      status: 'pending',
      category: 'Música'
    },
  ]);

  const [pendingPromoters, setPendingPromoters] = useState<PendingPromoter[]>([
    {
      id: 'p1',
      name: 'Carlos Oliveira',
      email: 'carlos@eventos.pt',
      phone: '+351 912 345 678',
      company: 'Eventos Carlos Lda',
      description: 'Empresa especializada em organização de eventos corporativos e culturais com 10 anos de experiência',
      submittedAt: '2024-01-16T14:20:00Z',
      status: 'pending'
    },
    {
      id: 'p2',
      name: 'Ana Costa',
      email: 'ana@festas.pt',
      phone: '+351 913 456 789',
      company: 'Festas & CIA',
      description: 'Organização de festas e eventos sociais de pequena e média dimensão',
      submittedAt: '2024-01-15T09:10:00Z',
      status: 'pending'
    },
  ]);

  const [pendingAdvertisements, setPendingAdvertisements] = useState<PendingAdvertisement[]>([
    {
      id: 'a1',
      title: 'Banner Verão 2024',
      promoterName: 'João Silva',
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
      targetUrl: 'https://example.com/verao2024',
      submittedAt: '2024-01-17T11:30:00Z',
      status: 'pending',
      price: 299
    },
    {
      id: 'a2',
      title: 'Promoção Black Friday',
      promoterName: 'Maria Santos',
      startDate: '2024-11-20',
      endDate: '2024-11-30',
      imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',
      targetUrl: 'https://example.com/blackfriday',
      submittedAt: '2024-01-16T16:45:00Z',
      status: 'pending',
      price: 199
    },
  ]);

  const handleApproveEvent = (eventId: string) => {
    Alert.alert(
      'Aprovar Evento',
      'Tem certeza que deseja aprovar este evento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprovar',
          style: 'default',
          onPress: () => {
            setPendingEvents(prev => 
              prev.map(event => 
                event.id === eventId ? { ...event, status: 'approved' as const } : event
              )
            );
            Alert.alert('Sucesso', 'Evento aprovado com sucesso!');
          }
        }
      ]
    );
  };

  const handleRejectEvent = (eventId: string) => {
    Alert.alert(
      'Rejeitar Evento',
      'Tem certeza que deseja rejeitar este evento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rejeitar',
          style: 'destructive',
          onPress: () => {
            setPendingEvents(prev => 
              prev.map(event => 
                event.id === eventId ? { ...event, status: 'rejected' as const } : event
              )
            );
            Alert.alert('Rejeitado', 'Evento rejeitado.');
          }
        }
      ]
    );
  };

  const handleApprovePromoter = (promoterId: string) => {
    Alert.alert(
      'Aprovar Promotor',
      'Tem certeza que deseja aprovar este promotor?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprovar',
          style: 'default',
          onPress: () => {
            setPendingPromoters(prev => 
              prev.map(promoter => 
                promoter.id === promoterId ? { ...promoter, status: 'approved' as const } : promoter
              )
            );
            Alert.alert('Sucesso', 'Promotor aprovado com sucesso!');
          }
        }
      ]
    );
  };

  const handleRejectPromoter = (promoterId: string) => {
    Alert.alert(
      'Rejeitar Promotor',
      'Tem certeza que deseja rejeitar este promotor?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rejeitar',
          style: 'destructive',
          onPress: () => {
            setPendingPromoters(prev => 
              prev.map(promoter => 
                promoter.id === promoterId ? { ...promoter, status: 'rejected' as const } : promoter
              )
            );
            Alert.alert('Rejeitado', 'Promotor rejeitado.');
          }
        }
      ]
    );
  };

  const handleApproveAdvertisement = (adId: string) => {
    Alert.alert(
      'Aprovar Anúncio',
      'Tem certeza que deseja aprovar este anúncio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprovar',
          style: 'default',
          onPress: () => {
            setPendingAdvertisements(prev => 
              prev.map(ad => 
                ad.id === adId ? { ...ad, status: 'approved' as const } : ad
              )
            );
            Alert.alert('Sucesso', 'Anúncio aprovado com sucesso!');
          }
        }
      ]
    );
  };

  const handleRejectAdvertisement = (adId: string) => {
    Alert.alert(
      'Rejeitar Anúncio',
      'Tem certeza que deseja rejeitar este anúncio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rejeitar',
          style: 'destructive',
          onPress: () => {
            setPendingAdvertisements(prev => 
              prev.map(ad => 
                ad.id === adId ? { ...ad, status: 'rejected' as const } : ad
              )
            );
            Alert.alert('Rejeitado', 'Anúncio rejeitado.');
          }
        }
      ]
    );
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const EventCard = ({ event }: { event: PendingEvent }) => (
    <View style={styles.card}>
      <View style={styles.cardTypeHeader}>
        <Megaphone size={20} color={COLORS.primary} />
        <Text style={styles.cardTypeText}>EVENTO</Text>
      </View>
      
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardTitle}>{event.title}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
        </View>
        <Text style={styles.priceText}>€{event.price}</Text>
      </View>

      <Image source={{ uri: event.imageUrl }} style={styles.cardImage} />

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <User size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{event.promoterName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Calendar size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{formatDate(event.date)}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{event.location}</Text>
        </View>
      </View>

      <Text style={styles.description}>{event.description}</Text>

      <View style={styles.submissionInfo}>
        <Text style={styles.submissionText}>
          Submetido em {formatDate(event.submittedAt)}
        </Text>
      </View>

      {event.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRejectEvent(event.id)}
          >
            <X size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Rejeitar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApproveEvent(event.id)}
          >
            <Check size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Aprovar</Text>
          </TouchableOpacity>
        </View>
      )}

      {event.status !== 'pending' && (
        <View style={[
          styles.statusBadge,
          { backgroundColor: event.status === 'approved' ? COLORS.success + '20' : COLORS.error + '20' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: event.status === 'approved' ? COLORS.success : COLORS.error }
          ]}>
            {event.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
          </Text>
        </View>
      )}
    </View>
  );

  const AdvertisementCard = ({ ad }: { ad: PendingAdvertisement }) => (
    <View style={styles.card}>
      <View style={[styles.cardTypeHeader, styles.adTypeHeader]}>
        <ImageIcon size={20} color={COLORS.info} />
        <Text style={[styles.cardTypeText, styles.adTypeText]}>ANÚNCIO</Text>
      </View>
      
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardTitle}>{ad.title}</Text>
          <Text style={styles.companyText}>{ad.promoterName}</Text>
        </View>
        <Text style={styles.priceText}>€{ad.price}</Text>
      </View>

      <Image source={{ uri: ad.imageUrl }} style={styles.cardImage} />

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Período:</Text>
          <Text style={styles.detailText}>
            {formatDate(ad.startDate)} - {formatDate(ad.endDate)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>URL:</Text>
          <Text style={styles.detailText} numberOfLines={1}>{ad.targetUrl}</Text>
        </View>
      </View>

      <View style={styles.submissionInfo}>
        <Text style={styles.submissionText}>
          Submetido em {formatDate(ad.submittedAt)}
        </Text>
      </View>

      {ad.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRejectAdvertisement(ad.id)}
          >
            <X size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Rejeitar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApproveAdvertisement(ad.id)}
          >
            <Check size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Aprovar</Text>
          </TouchableOpacity>
        </View>
      )}

      {ad.status !== 'pending' && (
        <View style={[
          styles.statusBadge,
          { backgroundColor: ad.status === 'approved' ? COLORS.success + '20' : COLORS.error + '20' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: ad.status === 'approved' ? COLORS.success : COLORS.error }
          ]}>
            {ad.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
          </Text>
        </View>
      )}
    </View>
  );

  const PromoterCard = ({ promoter }: { promoter: PendingPromoter }) => (
    <View style={styles.card}>
      <View style={[styles.cardTypeHeader, styles.promoterTypeHeader]}>
        <Users size={20} color={COLORS.warning} />
        <Text style={[styles.cardTypeText, styles.promoterTypeText]}>PROMOTOR</Text>
      </View>
      
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardTitle}>{promoter.name}</Text>
          <Text style={styles.companyText}>{promoter.company}</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email:</Text>
          <Text style={styles.detailText}>{promoter.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Telefone:</Text>
          <Text style={styles.detailText}>{promoter.phone}</Text>
        </View>
      </View>

      <Text style={styles.description}>{promoter.description}</Text>

      <View style={styles.submissionInfo}>
        <Text style={styles.submissionText}>
          Submetido em {formatDate(promoter.submittedAt)}
        </Text>
      </View>

      {promoter.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRejectPromoter(promoter.id)}
          >
            <X size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Rejeitar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprovePromoter(promoter.id)}
          >
            <Check size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Aprovar</Text>
          </TouchableOpacity>
        </View>
      )}

      {promoter.status !== 'pending' && (
        <View style={[
          styles.statusBadge,
          { backgroundColor: promoter.status === 'approved' ? COLORS.success + '20' : COLORS.error + '20' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: promoter.status === 'approved' ? COLORS.success : COLORS.error }
          ]}>
            {promoter.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
          </Text>
        </View>
      )}
    </View>
  );

  const pendingEventsCount = pendingEvents.filter(e => e.status === 'pending').length;
  const pendingPromotersCount = pendingPromoters.filter(p => p.status === 'pending').length;
  const pendingAdsCount = pendingAdvertisements.filter(a => a.status === 'pending').length;
  const totalPending = pendingEventsCount + pendingPromotersCount + pendingAdsCount;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Aprovações',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' as const },
          headerRight: () => <ProfileButton />
        }} 
      />
      
      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalPending}</Text>
            <Text style={styles.statLabel}>Total Pendente</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.warning }]}>{pendingPromotersCount}</Text>
            <Text style={styles.statLabel}>Promotores</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>{pendingEventsCount}</Text>
            <Text style={styles.statLabel}>Eventos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.info }]}>{pendingAdsCount}</Text>
            <Text style={styles.statLabel}>Anúncios</Text>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'promoters' && styles.activeTab]}
            onPress={() => setActiveTab('promoters')}
          >
            <Users size={20} color={activeTab === 'promoters' ? COLORS.white : COLORS.warning} />
            <Text style={[styles.tabText, activeTab === 'promoters' && styles.activeTabText]}>
              Promotores
            </Text>
            {pendingPromotersCount > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{pendingPromotersCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'events' && styles.activeTab]}
            onPress={() => setActiveTab('events')}
          >
            <Megaphone size={20} color={activeTab === 'events' ? COLORS.white : COLORS.primary} />
            <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
              Eventos
            </Text>
            {pendingEventsCount > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{pendingEventsCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'ads' && styles.activeTab]}
            onPress={() => setActiveTab('ads')}
          >
            <ImageIcon size={20} color={activeTab === 'ads' ? COLORS.white : COLORS.info} />
            <Text style={[styles.tabText, activeTab === 'ads' && styles.activeTabText]}>
              Anúncios
            </Text>
            {pendingAdsCount > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{pendingAdsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {activeTab === 'promoters' && (
            <View style={styles.section}>
              {pendingPromoters.filter(p => p.status === 'pending').map(promoter => (
                <PromoterCard key={promoter.id} promoter={promoter} />
              ))}
              {pendingPromotersCount === 0 && (
                <View style={styles.emptyState}>
                  <Users size={48} color={COLORS.lightGray} />
                  <Text style={styles.emptyStateText}>Nenhum promotor pendente</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'events' && (
            <View style={styles.section}>
              {pendingEvents.filter(e => e.status === 'pending').map(event => (
                <EventCard key={event.id} event={event} />
              ))}
              {pendingEventsCount === 0 && (
                <View style={styles.emptyState}>
                  <Megaphone size={48} color={COLORS.lightGray} />
                  <Text style={styles.emptyStateText}>Nenhum evento pendente</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'ads' && (
            <View style={styles.section}>
              {pendingAdvertisements.filter(a => a.status === 'pending').map(ad => (
                <AdvertisementCard key={ad.id} ad={ad} />
              ))}
              {pendingAdsCount === 0 && (
                <View style={styles.emptyState}>
                  <ImageIcon size={48} color={COLORS.lightGray} />
                  <Text style={styles.emptyStateText}>Nenhum anúncio pendente</Text>
                </View>
              )}
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
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center' as const,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.white,
  },
  tabBadge: {
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold' as const,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  card: {
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
  cardTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  promoterTypeHeader: {
    backgroundColor: COLORS.warning + '15',
  },
  adTypeHeader: {
    backgroundColor: COLORS.info + '15',
  },
  cardTypeText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  promoterTypeText: {
    color: COLORS.warning,
  },
  adTypeText: {
    color: COLORS.info,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 5,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.info + '20',
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: COLORS.info,
  },
  companyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic' as const,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.success,
  },
  cardImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600' as const,
    marginRight: 6,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 10,
  },
  submissionInfo: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    marginBottom: 15,
  },
  submissionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic' as const,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold' as const,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.white,
    borderRadius: 12,
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

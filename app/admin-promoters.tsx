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
} from 'react-native';
import { Stack, router } from 'expo-router';
import { 
  Users, 
  Search, 
  Filter,
  UserCheck,
  UserX,
  Calendar,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  User,
  LogOut,
  Star,
  Eye,
  TrendingUp
} from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { useUser } from '@/hooks/user-context';

interface AdminPromoter {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  joinDate: string;
  lastActive: string;
  isActive: boolean;
  isVerified: boolean;
  eventsCreated: number;
  totalRevenue: number;
  averageRating: number;
  totalViews: number;
  successfulEvents: number;
  pendingEvents: number;
  followers: number;
  status: 'active' | 'suspended' | 'pending_verification';
}

export default function AdminPromoters() {
  const { logout } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'pending_verification'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const [promoters] = useState<AdminPromoter[]>([
    {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '+351 912 345 678',
      location: 'Lisboa',
      joinDate: '2023-05-15',
      lastActive: '2024-01-15T10:30:00Z',
      isActive: true,
      isVerified: true,
      eventsCreated: 12,
      totalRevenue: 45670,
      averageRating: 4.8,
      totalViews: 25430,
      successfulEvents: 11,
      pendingEvents: 1,
      followers: 1250,
      status: 'active'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '+351 923 456 789',
      location: 'Porto',
      joinDate: '2023-08-20',
      lastActive: '2024-01-14T15:45:00Z',
      isActive: true,
      isVerified: true,
      eventsCreated: 8,
      totalRevenue: 32100,
      averageRating: 4.6,
      totalViews: 18920,
      successfulEvents: 7,
      pendingEvents: 1,
      followers: 890,
      status: 'active'
    },
    {
      id: '3',
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@email.com',
      location: 'Coimbra',
      joinDate: '2023-12-01',
      lastActive: '2024-01-10T09:15:00Z',
      isActive: false,
      isVerified: false,
      eventsCreated: 3,
      totalRevenue: 8750,
      averageRating: 4.2,
      totalViews: 5680,
      successfulEvents: 2,
      pendingEvents: 1,
      followers: 320,
      status: 'pending_verification'
    },
    {
      id: '4',
      name: 'Ana Costa',
      email: 'ana.costa@email.com',
      phone: '+351 934 567 890',
      location: 'Braga',
      joinDate: '2023-03-10',
      lastActive: '2024-01-13T14:20:00Z',
      isActive: true,
      isVerified: true,
      eventsCreated: 15,
      totalRevenue: 67890,
      averageRating: 4.9,
      totalViews: 34210,
      successfulEvents: 14,
      pendingEvents: 1,
      followers: 1680,
      status: 'active'
    },
    {
      id: '5',
      name: 'Pedro Martins',
      email: 'pedro.martins@email.com',
      location: 'Aveiro',
      joinDate: '2023-09-15',
      lastActive: '2023-12-20T11:30:00Z',
      isActive: false,
      isVerified: true,
      eventsCreated: 5,
      totalRevenue: 12340,
      averageRating: 3.8,
      totalViews: 8920,
      successfulEvents: 3,
      pendingEvents: 0,
      followers: 450,
      status: 'suspended'
    }
  ]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'suspended': return 'Suspenso';
      case 'pending_verification': return 'Pendente Verificação';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'suspended': return COLORS.error;
      case 'pending_verification': return COLORS.warning;
      default: return COLORS.gray;
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

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `Há ${diffInHours}h`;
    if (diffInHours < 48) return 'Ontem';
    return formatDate(dateString);
  };

  const handlePromoterAction = (promoterId: string, action: 'suspend' | 'activate' | 'verify' | 'reject') => {
    const promoter = promoters.find(p => p.id === promoterId);
    if (!promoter) return;

    let title = '';
    let message = '';

    switch (action) {
      case 'suspend':
        title = 'Suspender Promotor';
        message = `Tem certeza que deseja suspender ${promoter.name}?`;
        break;
      case 'activate':
        title = 'Ativar Promotor';
        message = `Tem certeza que deseja ativar ${promoter.name}?`;
        break;
      case 'verify':
        title = 'Verificar Promotor';
        message = `Tem certeza que deseja verificar ${promoter.name}?`;
        break;
      case 'reject':
        title = 'Rejeitar Promotor';
        message = `Tem certeza que deseja rejeitar a verificação de ${promoter.name}?`;
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

  const filteredPromoters = promoters.filter(promoter => {
    const matchesSearch = promoter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         promoter.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (promoter.location && promoter.location.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || promoter.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const PromoterCard = ({ promoter }: { promoter: AdminPromoter }) => (
    <View style={styles.promoterCard}>
      <View style={styles.promoterHeader}>
        <View style={styles.promoterInfo}>
          <View style={styles.promoterNameRow}>
            <Text style={styles.promoterName}>{promoter.name}</Text>
            {promoter.isVerified && (
              <UserCheck size={16} color={COLORS.success} />
            )}
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(promoter.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(promoter.status) }]}>
                {getStatusLabel(promoter.status)}
              </Text>
            </View>
          </View>
          <View style={styles.ratingRow}>
            <Star size={14} color={COLORS.warning} />
            <Text style={styles.ratingText}>{promoter.averageRating.toFixed(1)}</Text>
            <Text style={styles.followersText}>• {promoter.followers} seguidores</Text>
          </View>
        </View>
        <View style={styles.promoterActions}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: promoter.isActive ? COLORS.success : COLORS.error }
          ]} />
          <TouchableOpacity style={styles.moreButton}>
            <MoreVertical size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.promoterDetails}>
        <View style={styles.detailRow}>
          <Mail size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{promoter.email}</Text>
        </View>
        {promoter.phone && (
          <View style={styles.detailRow}>
            <Phone size={14} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{promoter.phone}</Text>
          </View>
        )}
        {promoter.location && (
          <View style={styles.detailRow}>
            <MapPin size={14} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{promoter.location}</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Calendar size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>Membro desde {formatDate(promoter.joinDate)}</Text>
        </View>
      </View>

      <View style={styles.promoterStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{promoter.eventsCreated}</Text>
          <Text style={styles.statLabel}>Eventos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.success }]}>€{(promoter.totalRevenue / 1000).toFixed(0)}k</Text>
          <Text style={styles.statLabel}>Receita</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{(promoter.totalViews / 1000).toFixed(0)}k</Text>
          <Text style={styles.statLabel}>Visualizações</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{promoter.successfulEvents}</Text>
          <Text style={styles.statLabel}>Sucessos</Text>
        </View>
      </View>

      <View style={styles.performanceIndicators}>
        <View style={styles.performanceItem}>
          <TrendingUp size={16} color={COLORS.success} />
          <Text style={styles.performanceText}>
            Taxa de Sucesso: {((promoter.successfulEvents / promoter.eventsCreated) * 100).toFixed(1)}%
          </Text>
        </View>
        <View style={styles.performanceItem}>
          <Eye size={16} color={COLORS.info} />
          <Text style={styles.performanceText}>
            Média de Visualizações: {Math.round(promoter.totalViews / promoter.eventsCreated)}
          </Text>
        </View>
      </View>

      <View style={styles.lastActiveContainer}>
        <Text style={styles.lastActiveText}>
          Última atividade: {formatLastActive(promoter.lastActive)}
        </Text>
      </View>

      <View style={styles.promoterActionButtons}>
        {promoter.status === 'pending_verification' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handlePromoterAction(promoter.id, 'reject')}
            >
              <UserX size={16} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Rejeitar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.verifyButton]}
              onPress={() => handlePromoterAction(promoter.id, 'verify')}
            >
              <UserCheck size={16} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Verificar</Text>
            </TouchableOpacity>
          </>
        )}
        
        {promoter.status === 'active' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.suspendButton]}
            onPress={() => handlePromoterAction(promoter.id, 'suspend')}
          >
            <UserX size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Suspender</Text>
          </TouchableOpacity>
        )}

        {promoter.status === 'suspended' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.activateButton]}
            onPress={() => handlePromoterAction(promoter.id, 'activate')}
          >
            <UserCheck size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Ativar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const totalPromoters = promoters.length;
  const activePromoters = promoters.filter(p => p.status === 'active').length;
  const pendingPromoters = promoters.filter(p => p.status === 'pending_verification').length;
  const suspendedPromoters = promoters.filter(p => p.status === 'suspended').length;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Gerir Promotores',
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
              placeholder="Procurar promotores..."
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
            {['all', 'active', 'pending_verification', 'suspended'].map(status => (
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
            <Text style={styles.statNumber}>{totalPromoters}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.success }]}>{activePromoters}</Text>
            <Text style={styles.statLabel}>Ativos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.warning }]}>{pendingPromoters}</Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.error }]}>{suspendedPromoters}</Text>
            <Text style={styles.statLabel}>Suspensos</Text>
          </View>
        </View>

        {/* Promoters List */}
        <ScrollView style={styles.promotersList} showsVerticalScrollIndicator={false}>
          {filteredPromoters.map(promoter => (
            <PromoterCard key={promoter.id} promoter={promoter} />
          ))}
          {filteredPromoters.length === 0 && (
            <View style={styles.emptyState}>
              <Users size={48} color={COLORS.lightGray} />
              <Text style={styles.emptyStateText}>Nenhum promotor encontrado</Text>
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
  promotersList: {
    flex: 1,
  },
  promoterCard: {
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
  promoterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  promoterInfo: {
    flex: 1,
  },
  promoterNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
    flexWrap: 'wrap',
  },
  promoterName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  followersText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  promoterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  moreButton: {
    padding: 5,
  },
  promoterDetails: {
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
  promoterStats: {
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
  performanceIndicators: {
    marginBottom: 15,
    gap: 8,
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  performanceText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  lastActiveContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    marginBottom: 15,
  },
  lastActiveText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic' as const,
  },
  promoterActionButtons: {
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
  suspendButton: {
    backgroundColor: COLORS.error,
  },
  activateButton: {
    backgroundColor: COLORS.success,
  },
  verifyButton: {
    backgroundColor: COLORS.info,
  },
  rejectButton: {
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
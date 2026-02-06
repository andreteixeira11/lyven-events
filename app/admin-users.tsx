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
  Crown,
  Calendar,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  User,
  LogOut
} from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { useUser } from '@/hooks/user-context';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  userType: 'normal' | 'promoter' | 'admin';
  location?: string;
  joinDate: string;
  lastActive: string;
  isActive: boolean;
  eventsAttended?: number;
  eventsCreated?: number;
  totalSpent?: number;
  isVerified: boolean;
}

export default function AdminUsers() {
  const { logout } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'normal' | 'promoter' | 'admin'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const [users] = useState<AdminUser[]>([
    {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '+351 912 345 678',
      userType: 'promoter',
      location: 'Lisboa',
      joinDate: '2023-05-15',
      lastActive: '2024-01-15T10:30:00Z',
      isActive: true,
      eventsCreated: 12,
      totalSpent: 0,
      isVerified: true,
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '+351 923 456 789',
      userType: 'normal',
      location: 'Porto',
      joinDate: '2023-08-20',
      lastActive: '2024-01-14T15:45:00Z',
      isActive: true,
      eventsAttended: 25,
      totalSpent: 450,
      isVerified: true,
    },
    {
      id: '3',
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@email.com',
      userType: 'normal',
      location: 'Coimbra',
      joinDate: '2023-12-01',
      lastActive: '2024-01-10T09:15:00Z',
      isActive: false,
      eventsAttended: 8,
      totalSpent: 120,
      isVerified: false,
    },
    {
      id: '4',
      name: 'Ana Costa',
      email: 'ana.costa@email.com',
      phone: '+351 934 567 890',
      userType: 'promoter',
      location: 'Braga',
      joinDate: '2023-03-10',
      lastActive: '2024-01-13T14:20:00Z',
      isActive: true,
      eventsCreated: 8,
      totalSpent: 0,
      isVerified: true,
    },
    {
      id: '5',
      name: 'Admin User',
      email: 'admin@lyven.com',
      userType: 'admin',
      joinDate: '2023-01-01',
      lastActive: '2024-01-15T16:00:00Z',
      isActive: true,
      isVerified: true,
    }
  ]);

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'normal': return 'Utilizador';
      case 'promoter': return 'Promotor';
      case 'admin': return 'Admin';
      default: return type;
    }
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'normal': return COLORS.info;
      case 'promoter': return COLORS.warning;
      case 'admin': return COLORS.error;
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

  const handleUserAction = (userId: string, action: 'suspend' | 'activate' | 'verify' | 'promote') => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    let title = '';
    let message = '';

    switch (action) {
      case 'suspend':
        title = 'Suspender Utilizador';
        message = `Tem certeza que deseja suspender ${user.name}?`;
        break;
      case 'activate':
        title = 'Ativar Utilizador';
        message = `Tem certeza que deseja ativar ${user.name}?`;
        break;
      case 'verify':
        title = 'Verificar Utilizador';
        message = `Tem certeza que deseja verificar ${user.name}?`;
        break;
      case 'promote':
        title = 'Promover a Promotor';
        message = `Tem certeza que deseja promover ${user.name} a promotor?`;
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || user.userType === filterType;
    return matchesSearch && matchesFilter;
  });

  const UserCard = ({ user }: { user: AdminUser }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>{user.name}</Text>
            {user.isVerified && (
              <UserCheck size={16} color={COLORS.success} />
            )}
          </View>
          <View style={[styles.userTypeBadge, { backgroundColor: getUserTypeColor(user.userType) + '20' }]}>
            <Text style={[styles.userTypeText, { color: getUserTypeColor(user.userType) }]}>
              {getUserTypeLabel(user.userType)}
            </Text>
          </View>
        </View>
        <View style={styles.userActions}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: user.isActive ? COLORS.success : COLORS.error }
          ]} />
          <TouchableOpacity style={styles.moreButton}>
            <MoreVertical size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.userDetails}>
        <View style={styles.detailRow}>
          <Mail size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{user.email}</Text>
        </View>
        {user.phone && (
          <View style={styles.detailRow}>
            <Phone size={14} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{user.phone}</Text>
          </View>
        )}
        {user.location && (
          <View style={styles.detailRow}>
            <MapPin size={14} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{user.location}</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Calendar size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>Membro desde {formatDate(user.joinDate)}</Text>
        </View>
      </View>

      <View style={styles.userStats}>
        {user.userType === 'promoter' && (
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.eventsCreated || 0}</Text>
            <Text style={styles.statLabel}>Eventos Criados</Text>
          </View>
        )}
        {user.userType === 'normal' && (
          <>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.eventsAttended || 0}</Text>
              <Text style={styles.statLabel}>Eventos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>€{user.totalSpent || 0}</Text>
              <Text style={styles.statLabel}>Gasto Total</Text>
            </View>
          </>
        )}
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatLastActive(user.lastActive)}</Text>
          <Text style={styles.statLabel}>Última Atividade</Text>
        </View>
      </View>

      <View style={styles.userActionButtons}>
        {!user.isActive ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.activateButton]}
            onPress={() => handleUserAction(user.id, 'activate')}
          >
            <UserCheck size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Ativar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.suspendButton]}
            onPress={() => handleUserAction(user.id, 'suspend')}
          >
            <UserX size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Suspender</Text>
          </TouchableOpacity>
        )}
        
        {!user.isVerified && (
          <TouchableOpacity
            style={[styles.actionButton, styles.verifyButton]}
            onPress={() => handleUserAction(user.id, 'verify')}
          >
            <UserCheck size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Verificar</Text>
          </TouchableOpacity>
        )}

        {user.userType === 'normal' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.promoteButton]}
            onPress={() => handleUserAction(user.id, 'promote')}
          >
            <Crown size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Promover</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const promoters = users.filter(u => u.userType === 'promoter').length;
  const normalUsers = users.filter(u => u.userType === 'normal').length;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Gerir Utilizadores',
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
              placeholder="Procurar utilizadores..."
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
            {['all', 'normal', 'promoter', 'admin'].map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterOption,
                  filterType === type && styles.filterOptionActive
                ]}
                onPress={() => setFilterType(type as any)}
              >
                <Text style={[
                  styles.filterOptionText,
                  filterType === type && styles.filterOptionTextActive
                ]}>
                  {type === 'all' ? 'Todos' : getUserTypeLabel(type)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalUsers}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.success }]}>{activeUsers}</Text>
            <Text style={styles.statLabel}>Ativos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.warning }]}>{promoters}</Text>
            <Text style={styles.statLabel}>Promotores</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.info }]}>{normalUsers}</Text>
            <Text style={styles.statLabel}>Utilizadores</Text>
          </View>
        </View>

        {/* Users List */}
        <ScrollView style={styles.usersList} showsVerticalScrollIndicator={false}>
          {filteredUsers.map(user => (
            <UserCard key={user.id} user={user} />
          ))}
          {filteredUsers.length === 0 && (
            <View style={styles.emptyState}>
              <Users size={48} color={COLORS.lightGray} />
              <Text style={styles.emptyStateText}>Nenhum utilizador encontrado</Text>
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
  usersList: {
    flex: 1,
  },
  userCard: {
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
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  userTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  userTypeText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  userActions: {
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
  userDetails: {
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
  },
  userStats: {
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
  userActionButtons: {
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
  promoteButton: {
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
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  AlertCircle,
  User,
  LogOut,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Target,
  MapPin,

  ChevronDown,
  Database,
} from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { useUser } from '@/hooks/user-context';

type TabType = 'users' | 'events' | 'approvals' | 'analytics' | 'registered-users';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  userType: 'normal' | 'promoter' | 'admin';
  totalSpent: number;
  lastAccess: string;
  isActive: boolean;
}

interface AdminEvent {
  id: string;
  title: string;
  imageUrl: string;
  ticketsSold: number;
  revenue: number;
  date: string;
  status: 'active' | 'pending' | 'completed';
  promoterName: string;
}

interface PendingApproval {
  id: string;
  type: 'promoter' | 'event' | 'ad';
  title: string;
  description: string;
  submittedBy: string;
  submittedAt: string;
  imageUrl?: string;
}

export default function AdminDashboard() {
  const { logout } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const [users] = useState<AdminUser[]>([
    {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@email.com',
      userType: 'normal',
      totalSpent: 450,
      lastAccess: '2024-01-15T10:30:00Z',
      isActive: true,
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      userType: 'normal',
      totalSpent: 320,
      lastAccess: '2024-01-14T15:45:00Z',
      isActive: true,
    },
    {
      id: '3',
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@email.com',
      userType: 'promoter',
      totalSpent: 0,
      lastAccess: '2024-01-13T09:15:00Z',
      isActive: true,
    },
    {
      id: '4',
      name: 'Ana Costa',
      email: 'ana.costa@email.com',
      userType: 'normal',
      totalSpent: 180,
      lastAccess: '2024-01-12T14:20:00Z',
      isActive: false,
    },
  ]);

  const [events] = useState<AdminEvent[]>([
    {
      id: '1',
      title: 'Festival de Verão 2024',
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      ticketsSold: 1250,
      revenue: 31250,
      date: '2024-07-15',
      status: 'active',
      promoterName: 'João Silva',
    },
    {
      id: '2',
      title: 'Concerto de Jazz',
      imageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400',
      ticketsSold: 890,
      revenue: 13350,
      date: '2024-06-20',
      status: 'active',
      promoterName: 'Maria Santos',
    },
    {
      id: '3',
      title: 'Teatro Clássico',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      ticketsSold: 650,
      revenue: 9750,
      date: '2024-08-10',
      status: 'pending',
      promoterName: 'Carlos Oliveira',
    },
  ]);

  const [approvals] = useState<PendingApproval[]>([
    {
      id: '1',
      type: 'promoter',
      title: 'Pedro Martins',
      description: 'Pedido de conta de promotor',
      submittedBy: 'Pedro Martins',
      submittedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      type: 'event',
      title: 'Stand-up Comedy Night',
      description: 'Novo evento aguardando aprovação',
      submittedBy: 'Ana Costa',
      submittedAt: '2024-01-14T15:45:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400',
    },
    {
      id: '3',
      type: 'ad',
      title: 'Publicidade Festival Verão',
      description: 'Banner publicitário para homepage',
      submittedBy: 'João Silva',
      submittedAt: '2024-01-13T09:15:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    },
  ]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `Há ${diffInHours}h`;
    if (diffInHours < 48) return 'Ontem';
    return date.toLocaleDateString('pt-PT');
  };

  const handleApprove = (id: string, type: string) => {
    Alert.alert(
      'Aprovar',
      `Tem certeza que deseja aprovar este ${type === 'promoter' ? 'promotor' : type === 'event' ? 'evento' : 'anúncio'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprovar',
          onPress: () => {
            Alert.alert('Sucesso', 'Aprovado com sucesso!');
          }
        }
      ]
    );
  };

  const handleReject = (id: string, type: string) => {
    Alert.alert(
      'Rejeitar',
      `Tem certeza que deseja rejeitar este ${type === 'promoter' ? 'promotor' : type === 'event' ? 'evento' : 'anúncio'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rejeitar',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Rejeitado', 'Item rejeitado.');
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

  const renderUsersTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.searchContainer}>
        <Search size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Procurar utilizadores..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, { flex: 2 }]}>Nome</Text>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>Total Gasto</Text>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>Último Acesso</Text>
      </View>

      {users
        .filter(user => 
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map(user => (
          <View key={user.id} style={styles.tableRow}>
            <View style={{ flex: 2 }}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={[styles.userTypeBadge, { 
                backgroundColor: user.userType === 'promoter' ? COLORS.warning + '20' : COLORS.info + '20' 
              }]}>
                <Text style={[styles.userTypeText, { 
                  color: user.userType === 'promoter' ? COLORS.warning : COLORS.info 
                }]}>
                  {user.userType === 'promoter' ? 'Promotor' : 'Utilizador'}
                </Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.spentValue}>€{user.totalSpent}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.lastAccessText}>{formatDate(user.lastAccess)}</Text>
              <View style={[
                styles.statusDot,
                { backgroundColor: user.isActive ? COLORS.success : COLORS.error }
              ]} />
            </View>
          </View>
        ))}
    </ScrollView>
  );

  const renderEventsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.searchContainer}>
        <Search size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Procurar eventos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, { flex: 2 }]}>Nome</Text>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>Bilhetes Vendidos</Text>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>Valor das Vendas</Text>
      </View>

      {events
        .filter(event => 
          event.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map(event => (
          <View key={event.id} style={styles.tableRow}>
            <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventPromoter}>por {event.promoterName}</Text>
                <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
              </View>
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.ticketsValue}>{event.ticketsSold}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.revenueValue}>€{event.revenue.toLocaleString()}</Text>
            </View>
          </View>
        ))}
    </ScrollView>
  );

  const getApprovalTypeLabel = (type: string) => {
    switch (type) {
      case 'promoter': return 'Promotor';
      case 'event': return 'Evento';
      case 'ad': return 'Anúncio';
      default: return type;
    }
  };

  const getApprovalTypeColor = (type: string) => {
    switch (type) {
      case 'promoter': return COLORS.warning;
      case 'event': return COLORS.primary;
      case 'ad': return COLORS.info;
      default: return COLORS.gray;
    }
  };

  const renderApprovalsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.approvalsHeader}>
        <Text style={styles.sectionTitle}>Pendentes de Aprovação</Text>
        <View style={styles.approvalCount}>
          <Text style={styles.approvalCountText}>{approvals.length}</Text>
        </View>
      </View>

      {approvals.map(approval => (
        <View key={approval.id} style={styles.approvalCard}>
          <View style={styles.approvalHeader}>
            <View style={styles.approvalInfo}>
              <View style={[styles.approvalTypeBadge, { backgroundColor: getApprovalTypeColor(approval.type) + '20' }]}>
                <Text style={[styles.approvalTypeText, { color: getApprovalTypeColor(approval.type) }]}>
                  {getApprovalTypeLabel(approval.type)}
                </Text>
              </View>
              <Text style={styles.approvalTitle}>{approval.title}</Text>
              <Text style={styles.approvalDescription}>{approval.description}</Text>
              <View style={styles.approvalMeta}>
                <User size={12} color={COLORS.textSecondary} />
                <Text style={styles.approvalMetaText}>por {approval.submittedBy}</Text>
                <Clock size={12} color={COLORS.textSecondary} />
                <Text style={styles.approvalMetaText}>{formatDate(approval.submittedAt)}</Text>
              </View>
            </View>
            {approval.imageUrl && (
              <Image source={{ uri: approval.imageUrl }} style={styles.approvalImage} />
            )}
          </View>

          <View style={styles.approvalActions}>
            <TouchableOpacity
              style={[styles.approvalButton, styles.rejectButton]}
              onPress={() => handleReject(approval.id, approval.type)}
            >
              <XCircle size={18} color={COLORS.white} />
              <Text style={styles.approvalButtonText}>Rejeitar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.approvalButton, styles.approveButton]}
              onPress={() => handleApprove(approval.id, approval.type)}
            >
              <CheckCircle size={18} color={COLORS.white} />
              <Text style={styles.approvalButtonText}>Aprovar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {approvals.length === 0 && (
        <View style={styles.emptyState}>
          <CheckCircle size={48} color={COLORS.lightGray} />
          <Text style={styles.emptyStateText}>Nenhuma aprovação pendente</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderAnalyticsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.analyticsGrid}>
        <View style={styles.analyticsCard}>
          <View style={[styles.analyticsIcon, { backgroundColor: COLORS.success + '20' }]}>
            <DollarSign size={24} color={COLORS.success} />
          </View>
          <Text style={styles.analyticsValue}>€125.670</Text>
          <Text style={styles.analyticsLabel}>Receita Total</Text>
          <View style={styles.analyticsTrend}>
            <TrendingUp size={14} color={COLORS.success} />
            <Text style={[styles.analyticsTrendText, { color: COLORS.success }]}>+12.5%</Text>
          </View>
        </View>

        <View style={styles.analyticsCard}>
          <View style={[styles.analyticsIcon, { backgroundColor: COLORS.primary + '20' }]}>
            <Target size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.analyticsValue}>8.945</Text>
          <Text style={styles.analyticsLabel}>Bilhetes Vendidos</Text>
          <View style={styles.analyticsTrend}>
            <TrendingUp size={14} color={COLORS.success} />
            <Text style={[styles.analyticsTrendText, { color: COLORS.success }]}>+8.3%</Text>
          </View>
        </View>

        <View style={styles.analyticsCard}>
          <View style={[styles.analyticsIcon, { backgroundColor: COLORS.warning + '20' }]}>
            <Calendar size={24} color={COLORS.warning} />
          </View>
          <Text style={styles.analyticsValue}>342</Text>
          <Text style={styles.analyticsLabel}>Total de Eventos</Text>
          <View style={styles.analyticsTrend}>
            <TrendingUp size={14} color={COLORS.success} />
            <Text style={[styles.analyticsTrendText, { color: COLORS.success }]}>+15.2%</Text>
          </View>
        </View>

        <View style={styles.analyticsCard}>
          <View style={[styles.analyticsIcon, { backgroundColor: COLORS.info + '20' }]}>
            <Users size={24} color={COLORS.info} />
          </View>
          <Text style={styles.analyticsValue}>1.247</Text>
          <Text style={styles.analyticsLabel}>Utilizadores Ativos</Text>
          <View style={styles.analyticsTrend}>
            <TrendingUp size={14} color={COLORS.success} />
            <Text style={[styles.analyticsTrendText, { color: COLORS.success }]}>+6.7%</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Categorias</Text>
        <View style={styles.categoryList}>
          {[
            { name: 'Música', value: 45, color: COLORS.primary },
            { name: 'Festival', value: 30, color: COLORS.warning },
            { name: 'Teatro', value: 15, color: COLORS.success },
            { name: 'Comédia', value: 10, color: COLORS.info },
          ].map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                <Text style={styles.categoryName}>{category.name}</Text>
              </View>
              <Text style={styles.categoryValue}>{category.value}%</Text>
              <View style={styles.categoryBar}>
                <View style={[styles.categoryBarFill, { width: `${category.value}%`, backgroundColor: category.color }]} />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Localizações Mais Populares</Text>
        <View style={styles.locationList}>
          {[
            { name: 'Lisboa', events: 145, revenue: 58000 },
            { name: 'Porto', events: 98, revenue: 42000 },
            { name: 'Coimbra', events: 52, revenue: 18000 },
            { name: 'Braga', events: 47, revenue: 15000 },
          ].map((location, index) => (
            <View key={index} style={styles.locationItem}>
              <MapPin size={16} color={COLORS.primary} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{location.name}</Text>
                <View style={styles.locationStats}>
                  <Text style={styles.locationStatText}>{location.events} eventos</Text>
                  <Text style={styles.locationDivider}>•</Text>
                  <Text style={[styles.locationStatText, { color: COLORS.success }]}>€{location.revenue.toLocaleString()}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Painel de Controlo - Administração',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' as const },
          headerRight: () => <ProfileButton />
        }} 
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.compactDropdownButton}
              onPress={() => setMenuOpen(!menuOpen)}
            >
              <View style={styles.compactDropdownIcon}>
                {activeTab === 'users' && <Users size={16} color={COLORS.white} />}
                {activeTab === 'events' && <Calendar size={16} color={COLORS.white} />}
                {activeTab === 'approvals' && <CheckCircle size={16} color={COLORS.white} />}
                {activeTab === 'analytics' && <BarChart3 size={16} color={COLORS.white} />}
                {activeTab === 'registered-users' && <Database size={16} color={COLORS.white} />}
              </View>
              <Text style={styles.compactDropdownText}>
                {activeTab === 'users' && 'Utilizadores'}
                {activeTab === 'events' && 'Eventos'}
                {activeTab === 'approvals' && 'Aprovações'}
                {activeTab === 'analytics' && 'Analytics'}
                {activeTab === 'registered-users' && 'Utilizadores Registados'}
              </Text>
              <ChevronDown 
                size={16} 
                color={COLORS.primary} 
                style={{ transform: [{ rotate: menuOpen ? '180deg' : '0deg' }] }} 
              />
            </TouchableOpacity>
          </View>

          {approvals.length > 0 && (
            <View style={styles.alertBanner}>
              <AlertCircle size={18} color={COLORS.warning} />
              <Text style={styles.alertBannerText}>
                {approvals.length} {approvals.length === 1 ? 'aprovação pendente' : 'aprovações pendentes'}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.hiddenDropdownButton}
            onPress={() => setMenuOpen(!menuOpen)}
          >
            <View style={styles.dropdownButtonLeft}>
              <View style={styles.dropdownIcon}>
                {activeTab === 'users' && <Users size={20} color={COLORS.white} />}
                {activeTab === 'events' && <Calendar size={20} color={COLORS.white} />}
                {activeTab === 'approvals' && <CheckCircle size={20} color={COLORS.white} />}
                {activeTab === 'analytics' && <BarChart3 size={20} color={COLORS.white} />}
                {activeTab === 'registered-users' && <Database size={20} color={COLORS.white} />}
              </View>
              <View>
                <Text style={styles.dropdownLabel}>Secção Ativa</Text>
                <Text style={styles.dropdownValue}>
                  {activeTab === 'users' && 'Utilizadores'}
                  {activeTab === 'events' && 'Eventos'}
                  {activeTab === 'approvals' && 'Aprovações'}
                  {activeTab === 'analytics' && 'Analytics'}
                  {activeTab === 'registered-users' && 'Utilizadores Registados'}
                </Text>
              </View>
            </View>
            <ChevronDown 
              size={20} 
              color={COLORS.primary} 
              style={{ transform: [{ rotate: menuOpen ? '180deg' : '0deg' }] }} 
            />
          </TouchableOpacity>

          {menuOpen && (
            <View style={styles.dropdownMenu}>
              <View style={styles.dropdownMenuHeader}>
                <Text style={styles.dropdownMenuTitle}>Selecionar Secção</Text>
              </View>
              <TouchableOpacity
                style={[styles.dropdownMenuItem, activeTab === 'users' && styles.dropdownMenuItemActive]}
                onPress={() => {
                  setActiveTab('users');
                  setMenuOpen(false);
                }}
              >
                <Users size={20} color={activeTab === 'users' ? COLORS.primary : COLORS.textSecondary} />
                <Text style={[styles.dropdownMenuText, activeTab === 'users' && styles.dropdownMenuTextActive]}>
                  Utilizadores
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dropdownMenuItem, activeTab === 'events' && styles.dropdownMenuItemActive]}
                onPress={() => {
                  setActiveTab('events');
                  setMenuOpen(false);
                }}
              >
                <Calendar size={20} color={activeTab === 'events' ? COLORS.primary : COLORS.textSecondary} />
                <Text style={[styles.dropdownMenuText, activeTab === 'events' && styles.dropdownMenuTextActive]}>
                  Eventos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dropdownMenuItem, activeTab === 'approvals' && styles.dropdownMenuItemActive]}
                onPress={() => {
                  setActiveTab('approvals');
                  setMenuOpen(false);
                }}
              >
                <CheckCircle size={20} color={activeTab === 'approvals' ? COLORS.primary : COLORS.textSecondary} />
                <View style={styles.dropdownMenuTextContainer}>
                  <Text style={[styles.dropdownMenuText, activeTab === 'approvals' && styles.dropdownMenuTextActive]}>
                    Aprovações
                  </Text>
                  {approvals.length > 0 && (
                    <View style={styles.dropdownMenuBadge}>
                      <Text style={styles.dropdownMenuBadgeText}>{approvals.length}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dropdownMenuItem, activeTab === 'analytics' && styles.dropdownMenuItemActive]}
                onPress={() => {
                  setActiveTab('analytics');
                  setMenuOpen(false);
                }}
              >
                <BarChart3 size={20} color={activeTab === 'analytics' ? COLORS.primary : COLORS.textSecondary} />
                <Text style={[styles.dropdownMenuText, activeTab === 'analytics' && styles.dropdownMenuTextActive]}>
                  Analytics
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dropdownMenuItem, activeTab === 'registered-users' && styles.dropdownMenuItemActive]}
                onPress={() => {
                  setMenuOpen(false);
                  router.push('/users-list');
                }}
              >
                <Database size={20} color={activeTab === 'registered-users' ? COLORS.primary : COLORS.textSecondary} />
                <Text style={[styles.dropdownMenuText, activeTab === 'registered-users' && styles.dropdownMenuTextActive]}>
                  Utilizadores Registados
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'events' && renderEventsTab()}
        {activeTab === 'approvals' && renderApprovalsTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
    marginTop: 4,
  },
  alertBannerText: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: '600' as const,
    flex: 1,
  },
  hiddenDropdownButton: {
    display: 'none',
  },
  compactDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    flex: 1,
  },
  compactDropdownIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactDropdownText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: COLORS.primary,
    flex: 1,
  },
  dropdownButton: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  dropdownButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dropdownIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  dropdownValue: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 65,
    right: 20,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    zIndex: 1000,
  },
  dropdownMenuHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.primary + '08',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownMenuTitle: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  dropdownMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  dropdownMenuItemActive: {
    backgroundColor: COLORS.primary + '08',
  },
  dropdownMenuText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  dropdownMenuTextActive: {
    fontWeight: 'bold' as const,
    color: COLORS.primary,
  },
  dropdownMenuTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  dropdownMenuBadge: {
    backgroundColor: COLORS.error,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  dropdownMenuBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold' as const,
  },
  tabContent: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
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
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: 'bold' as const,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  userTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  userTypeText: {
    fontSize: 11,
    fontWeight: 'bold' as const,
  },
  spentValue: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.success,
  },
  lastAccessText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  eventImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 2,
  },
  eventPromoter: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  ticketsValue: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
  },
  revenueValue: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.success,
  },
  approvalsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  approvalCount: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  approvalCountText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold' as const,
  },
  approvalCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  approvalHeader: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 12,
  },
  approvalInfo: {
    flex: 1,
  },
  approvalTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  approvalTypeText: {
    fontSize: 11,
    fontWeight: 'bold' as const,
    textTransform: 'uppercase',
  },
  approvalTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  approvalDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  approvalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  approvalMetaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  approvalImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  approvalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  approvalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  approvalButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold' as const,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 15,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 15,
  },
  analyticsCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  analyticsTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  analyticsTrendText: {
    fontSize: 13,
    fontWeight: 'bold' as const,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  categoryList: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryItem: {
    gap: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  categoryValue: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
  },
  categoryBar: {
    height: 6,
    backgroundColor: COLORS.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  locationList: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  locationStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationStatText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  locationDivider: {
    fontSize: 13,
    color: COLORS.lightGray,
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

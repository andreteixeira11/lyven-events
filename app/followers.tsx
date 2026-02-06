import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Users,
  Search,
  UserPlus,
  MessageCircle,
  ArrowLeft,
  TrendingUp,
  Calendar,
  Bell,
} from 'lucide-react-native';
import { useUser } from '@/hooks/user-context';

interface Follower {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  followedAt: Date;
  eventsAttended: number;
  totalSpent: number;
  isActive: boolean;
}

const mockFollowers: Follower[] = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana.silva@email.com',
    followedAt: new Date('2024-12-01'),
    eventsAttended: 5,
    totalSpent: 250,
    isActive: true,
  },
  {
    id: '2',
    name: 'João Santos',
    email: 'joao.santos@email.com',
    followedAt: new Date('2024-11-15'),
    eventsAttended: 3,
    totalSpent: 180,
    isActive: true,
  },
  {
    id: '3',
    name: 'Maria Costa',
    email: 'maria.costa@email.com',
    followedAt: new Date('2024-10-20'),
    eventsAttended: 8,
    totalSpent: 420,
    isActive: false,
  },
  {
    id: '4',
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@email.com',
    followedAt: new Date('2024-09-10'),
    eventsAttended: 2,
    totalSpent: 90,
    isActive: true,
  },
  {
    id: '5',
    name: 'Sofia Rodrigues',
    email: 'sofia.rodrigues@email.com',
    followedAt: new Date('2024-08-05'),
    eventsAttended: 12,
    totalSpent: 680,
    isActive: true,
  },
];

export default function Followers() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'inactive'>('all');

  if (user?.userType !== 'promoter') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Acesso negado</Text>
      </View>
    );
  }

  const filteredFollowers = mockFollowers.filter(follower => {
    const matchesSearch = follower.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         follower.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedTab === 'active') return matchesSearch && follower.isActive;
    if (selectedTab === 'inactive') return matchesSearch && !follower.isActive;
    return matchesSearch;
  });

  const totalFollowers = mockFollowers.length;
  const activeFollowers = mockFollowers.filter(f => f.isActive).length;
  const totalRevenue = mockFollowers.reduce((sum, f) => sum + f.totalSpent, 0);
  const avgSpentPerFollower = totalRevenue / totalFollowers;

  const StatCard = ({ icon: Icon, title, value, subtitle, color = '#fff' }: any) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <Icon size={20} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const FollowerCard = ({ follower }: { follower: Follower }) => (
    <View style={styles.followerCard}>
      <View style={styles.followerHeader}>
        <View style={styles.avatar}>
          {follower.avatar ? (
            <Image source={{ uri: follower.avatar }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{follower.name.charAt(0).toUpperCase()}</Text>
          )}
        </View>
        
        <View style={styles.followerInfo}>
          <View style={styles.followerNameRow}>
            <Text style={styles.followerName}>{follower.name}</Text>
            <View style={[styles.statusBadge, follower.isActive ? styles.activeBadge : styles.inactiveBadge]}>
              <Text style={styles.statusText}>{follower.isActive ? 'Ativo' : 'Inativo'}</Text>
            </View>
          </View>
          <Text style={styles.followerEmail}>{follower.email}</Text>
          <Text style={styles.followedDate}>
            Seguindo desde {follower.followedAt.toLocaleDateString('pt-PT')}
          </Text>
        </View>
      </View>

      <View style={styles.followerStats}>
        <View style={styles.followerStat}>
          <Calendar size={16} color="#999" />
          <Text style={styles.followerStatText}>{follower.eventsAttended} eventos</Text>
        </View>
        <View style={styles.followerStat}>
          <TrendingUp size={16} color="#999" />
          <Text style={styles.followerStatText}>€{follower.totalSpent} gastos</Text>
        </View>
      </View>

      <View style={styles.followerActions}>
        <TouchableOpacity style={styles.actionButton}>
          <MessageCircle size={16} color="#007AFF" />
          <Text style={styles.actionButtonText}>Mensagem</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Bell size={16} color="#FFD700" />
          <Text style={styles.actionButtonText}>Notificar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const TabButton = ({ tab, title, count, isActive }: any) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={() => setSelectedTab(tab)}
    >
      <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
        {title} ({count})
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Seguidores',
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
          <Text style={styles.title}>Seus Seguidores</Text>
          <Text style={styles.subtitle}>Gerencie sua audiência</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon={Users}
            title="Total"
            value={totalFollowers.toString()}
            subtitle="seguidores"
            color="#FF385C"
          />
          
          <StatCard
            icon={UserPlus}
            title="Ativos"
            value={activeFollowers.toString()}
            subtitle="este mês"
            color="#00C851"
          />
          
          <StatCard
            icon={TrendingUp}
            title="Receita Total"
            value={`€${totalRevenue}`}
            subtitle="de seguidores"
            color="#007AFF"
          />
          
          <StatCard
            icon={TrendingUp}
            title="Média por Seguidor"
            value={`€${avgSpentPerFollower.toFixed(0)}`}
            subtitle="gasto médio"
            color="#FFD700"
          />
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Procurar seguidores..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TabButton 
            tab="all" 
            title="Todos" 
            count={mockFollowers.length}
            isActive={selectedTab === 'all'} 
          />
          <TabButton 
            tab="active" 
            title="Ativos" 
            count={activeFollowers}
            isActive={selectedTab === 'active'} 
          />
          <TabButton 
            tab="inactive" 
            title="Inativos" 
            count={totalFollowers - activeFollowers}
            isActive={selectedTab === 'inactive'} 
          />
        </View>

        <View style={styles.followersContainer}>
          {filteredFollowers.length > 0 ? (
            filteredFollowers.map((follower) => (
              <FollowerCard key={follower.id} follower={follower} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Users size={64} color="#666" />
              <Text style={styles.emptyTitle}>Nenhum seguidor encontrado</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery 
                  ? 'Tente ajustar sua pesquisa'
                  : 'Seus seguidores aparecerão aqui quando começarem a seguir você'
                }
              </Text>
            </View>
          )}
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
    marginBottom: 20,
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
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  statSubtitle: {
    color: '#666',
    fontSize: 12,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  activeTabButton: {
    backgroundColor: '#FF385C',
    borderColor: '#FF385C',
  },
  tabButtonText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  activeTabButtonText: {
    color: '#fff',
  },
  followersContainer: {
    paddingHorizontal: 20,
  },
  followerCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  followerHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  followerInfo: {
    flex: 1,
  },
  followerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  followerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold' as const,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#00C851',
  },
  inactiveBadge: {
    backgroundColor: '#666',
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold' as const,
  },
  followerEmail: {
    color: '#999',
    fontSize: 14,
    marginBottom: 4,
  },
  followedDate: {
    color: '#666',
    fontSize: 12,
  },
  followerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  followerStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followerStatText: {
    color: '#999',
    fontSize: 12,
    marginLeft: 6,
  },
  followerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600' as const,
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
  },
  errorText: {
    color: '#FF385C',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});
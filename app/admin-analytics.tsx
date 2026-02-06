import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Calendar,
  DollarSign,
  Eye,
  Target,
  Award,
  MapPin,
  User,
  LogOut
} from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { useUser } from '@/hooks/user-context';



interface EventAnalytics {
  id: string;
  title: string;
  date: string;
  location: string;
  ticketsSold: number;
  totalTickets: number;
  revenue: number;
  views: number;
  category: string;
  promoterName: string;
}

interface PlatformStats {
  totalRevenue: number;
  totalTicketsSold: number;
  totalEvents: number;
  activeUsers: number;
  averageTicketPrice: number;
  conversionRate: number;
  topCategory: string;
  topLocation: string;
}

export default function AdminAnalytics() {
  const { logout } = useUser();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  
  const [platformStats] = useState<PlatformStats>({
    totalRevenue: 125670,
    totalTicketsSold: 8945,
    totalEvents: 342,
    activeUsers: 1247,
    averageTicketPrice: 14.05,
    conversionRate: 3.2,
    topCategory: 'Música',
    topLocation: 'Lisboa'
  });

  const [topEvents] = useState<EventAnalytics[]>([
    {
      id: '1',
      title: 'Festival de Verão 2024',
      date: '2024-07-15',
      location: 'Lisboa',
      ticketsSold: 1250,
      totalTickets: 1500,
      revenue: 18750,
      views: 5420,
      category: 'Festival',
      promoterName: 'João Silva'
    },
    {
      id: '2',
      title: 'Concerto de Jazz',
      date: '2024-06-20',
      location: 'Porto',
      ticketsSold: 890,
      totalTickets: 1000,
      revenue: 13350,
      views: 3210,
      category: 'Música',
      promoterName: 'Maria Santos'
    },
    {
      id: '3',
      title: 'Teatro Clássico',
      date: '2024-08-10',
      location: 'Coimbra',
      ticketsSold: 650,
      totalTickets: 800,
      revenue: 9750,
      views: 2180,
      category: 'Teatro',
      promoterName: 'Carlos Oliveira'
    },
    {
      id: '4',
      title: 'Stand-up Comedy Night',
      date: '2024-05-25',
      location: 'Braga',
      ticketsSold: 420,
      totalTickets: 500,
      revenue: 6300,
      views: 1890,
      category: 'Comédia',
      promoterName: 'Ana Costa'
    },
    {
      id: '5',
      title: 'Espetáculo de Dança',
      date: '2024-09-05',
      location: 'Aveiro',
      ticketsSold: 380,
      totalTickets: 400,
      revenue: 5700,
      views: 1560,
      category: 'Dança',
      promoterName: 'Pedro Martins'
    }
  ]);

  const [monthlyData] = useState([
    { month: 'Jan', revenue: 8500, events: 25, users: 180 },
    { month: 'Fev', revenue: 12300, events: 32, users: 220 },
    { month: 'Mar', revenue: 15600, events: 38, users: 280 },
    { month: 'Abr', revenue: 18900, events: 45, users: 320 },
    { month: 'Mai', revenue: 22100, events: 52, users: 380 },
    { month: 'Jun', revenue: 25400, events: 58, users: 420 },
  ]);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = COLORS.primary,
    trend,
    trendValue
  }: {
    title: string;
    value: string | number;
    icon: any;
    color?: string;
    trend?: 'up' | 'down';
    trendValue?: string;
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statCardHeader}>
        <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
          <Icon size={20} color={color} />
        </View>
        {trend && (
          <View style={styles.trendContainer}>
            {trend === 'up' ? (
              <TrendingUp size={16} color={COLORS.success} />
            ) : (
              <TrendingDown size={16} color={COLORS.error} />
            )}
            <Text style={[
              styles.trendText,
              { color: trend === 'up' ? COLORS.success : COLORS.error }
            ]}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const EventCard = ({ event }: { event: EventAnalytics }) => {
    const soldPercentage = (event.ticketsSold / event.totalTickets) * 100;
    
    return (
      <View style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventPromoter}>por {event.promoterName}</Text>
          </View>
          <View style={styles.eventRevenue}>
            <Text style={styles.revenueValue}>€{event.revenue.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.eventDetails}>
          <View style={styles.eventDetailRow}>
            <Calendar size={14} color={COLORS.textSecondary} />
            <Text style={styles.eventDetailText}>
              {new Date(event.date).toLocaleDateString('pt-PT')}
            </Text>
          </View>
          <View style={styles.eventDetailRow}>
            <MapPin size={14} color={COLORS.textSecondary} />
            <Text style={styles.eventDetailText}>{event.location}</Text>
          </View>
          <View style={styles.eventDetailRow}>
            <Eye size={14} color={COLORS.textSecondary} />
            <Text style={styles.eventDetailText}>{event.views} visualizações</Text>
          </View>
        </View>

        <View style={styles.ticketProgress}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {event.ticketsSold} / {event.totalTickets} bilhetes vendidos
            </Text>
            <Text style={styles.progressPercentage}>
              {soldPercentage.toFixed(1)}%
            </Text>
          </View>
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
      </View>
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

  const formatCurrency = (value: number) => `€${value.toLocaleString()}`;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Estatísticas da Plataforma',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' as const },
          headerRight: () => <ProfileButton />
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Period Selector */}
          <View style={styles.periodSelector}>
            {['week', 'month', 'year'].map(period => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod(period as any)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive
                ]}>
                  {period === 'week' ? 'Semana' : period === 'month' ? 'Mês' : 'Ano'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Main Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visão Geral da Plataforma</Text>
            <View style={styles.statsGrid}>
              <StatCard
                title="Receita Total"
                value={formatCurrency(platformStats.totalRevenue)}
                icon={DollarSign}
                color={COLORS.success}
                trend="up"
                trendValue="+12.5%"
              />
              <StatCard
                title="Bilhetes Vendidos"
                value={platformStats.totalTicketsSold.toLocaleString()}
                icon={Target}
                color={COLORS.primary}
                trend="up"
                trendValue="+8.3%"
              />
              <StatCard
                title="Total de Eventos"
                value={platformStats.totalEvents}
                icon={Calendar}
                color={COLORS.warning}
                trend="up"
                trendValue="+15.2%"
              />
              <StatCard
                title="Utilizadores Ativos"
                value={platformStats.activeUsers.toLocaleString()}
                icon={Users}
                color={COLORS.info}
                trend="up"
                trendValue="+6.7%"
              />
            </View>
          </View>

          {/* Key Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Métricas Chave</Text>
            <View style={styles.metricsContainer}>
              <View style={styles.metricCard}>
                <Award size={24} color={COLORS.primary} />
                <Text style={styles.metricValue}>
                  {formatCurrency(platformStats.averageTicketPrice)}
                </Text>
                <Text style={styles.metricLabel}>Preço Médio do Bilhete</Text>
              </View>
              <View style={styles.metricCard}>
                <Target size={24} color={COLORS.success} />
                <Text style={styles.metricValue}>
                  {platformStats.conversionRate}%
                </Text>
                <Text style={styles.metricLabel}>Taxa de Conversão</Text>
              </View>
              <View style={styles.metricCard}>
                <BarChart3 size={24} color={COLORS.warning} />
                <Text style={styles.metricValue}>
                  {platformStats.topCategory}
                </Text>
                <Text style={styles.metricLabel}>Categoria Mais Popular</Text>
              </View>
              <View style={styles.metricCard}>
                <MapPin size={24} color={COLORS.info} />
                <Text style={styles.metricValue}>
                  {platformStats.topLocation}
                </Text>
                <Text style={styles.metricLabel}>Localização Top</Text>
              </View>
            </View>
          </View>

          {/* Monthly Trend */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tendência Mensal</Text>
            <View style={styles.chartContainer}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Receita por Mês</Text>
              </View>
              <View style={styles.simpleChart}>
                {monthlyData.map((data, index) => (
                  <View key={data.month} style={styles.chartBar}>
                    <View 
                      style={[
                        styles.bar,
                        { 
                          height: (data.revenue / 30000) * 100,
                          backgroundColor: COLORS.primary + '80'
                        }
                      ]} 
                    />
                    <Text style={styles.barLabel}>{data.month}</Text>
                    <Text style={styles.barValue}>
                      €{(data.revenue / 1000).toFixed(0)}k
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Most Popular Events */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Eventos Mais Populares</Text>
            <View style={styles.popularEventsContainer}>
              {topEvents.slice(0, 3).map((event, index) => (
                <View key={event.id} style={styles.popularEventCard}>
                  <View style={styles.popularEventRank}>
                    <Award size={20} color={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'} />
                    <Text style={styles.popularRankText}>#{index + 1}</Text>
                  </View>
                  <View style={styles.popularEventContent}>
                    <Text style={styles.popularEventTitle}>{event.title}</Text>
                    <View style={styles.popularEventStats}>
                      <View style={styles.popularStatItem}>
                        <Target size={14} color={COLORS.primary} />
                        <Text style={styles.popularStatText}>{event.ticketsSold} bilhetes</Text>
                      </View>
                      <View style={styles.popularStatItem}>
                        <Eye size={14} color={COLORS.info} />
                        <Text style={styles.popularStatText}>{event.views} views</Text>
                      </View>
                      <View style={styles.popularStatItem}>
                        <DollarSign size={14} color={COLORS.success} />
                        <Text style={styles.popularStatText}>€{event.revenue.toLocaleString()}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Top Performing Events */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Eventos com Melhor Performance</Text>
            <View style={styles.eventsContainer}>
              {topEvents.map((event, index) => (
                <View key={event.id} style={styles.eventRankContainer}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.eventCardContainer}>
                    <EventCard event={event} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 20,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500' as const,
  },
  periodButtonTextActive: {
    color: COLORS.white,
    fontWeight: 'bold' as const,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 15,
  },
  statsGrid: {
    gap: 15,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  metricCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginTop: 10,
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  simpleChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  bar: {
    width: '80%',
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: COLORS.text,
    fontWeight: 'bold' as const,
  },
  eventsContainer: {
    gap: 15,
  },
  eventRankContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  rankText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold' as const,
  },
  eventCardContainer: {
    flex: 1,
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 2,
  },
  eventPromoter: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  eventRevenue: {
    alignItems: 'flex-end',
  },
  revenueValue: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.success,
  },
  eventDetails: {
    marginBottom: 15,
    gap: 6,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDetailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  ticketProgress: {
    marginTop: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
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
  popularEventsContainer: {
    gap: 12,
  },
  popularEventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  popularEventRank: {
    alignItems: 'center',
    gap: 4,
  },
  popularRankText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: COLORS.textSecondary,
  },
  popularEventContent: {
    flex: 1,
  },
  popularEventTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  popularEventStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  popularStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popularStatText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
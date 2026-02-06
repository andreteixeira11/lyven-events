import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import {
  TrendingUp,
  Users,
  Euro,
  Plus,
  Ticket,
  TrendingDown,
  Clock,
  Target,
  Eye,
  MousePointer,
  Megaphone,
  DollarSign
} from 'lucide-react-native';
import { PromoterEvent } from '@/types/event';
import { router } from 'expo-router';
import { useUser } from '@/hooks/user-context';

interface PromoterDashboardProps {
  promoterId: string;
}

const { width } = Dimensions.get('window');

const PromoterDashboard: React.FC<PromoterDashboardProps> = ({ promoterId }) => {
  const { user } = useUser();

  const mockPromoterEvents: PromoterEvent[] = [
    {
      id: '1',
      title: 'Arctic Monkeys',
      date: new Date('2025-02-15T21:00:00'),
      venue: 'Coliseu dos Recreios',
      status: 'published',
      ticketsSold: 1250,
      totalTickets: 1500,
      revenue: 48750,
      image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800'
    },
    {
      id: '2',
      title: 'Festival NOS Alive 2025',
      date: new Date('2025-07-10T16:00:00'),
      venue: 'Passeio Marítimo de Algés',
      status: 'published',
      ticketsSold: 15000,
      totalTickets: 55000,
      revenue: 1350000,
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800'
    },
    {
      id: '3',
      title: 'Novo Evento',
      date: new Date('2025-08-20T20:00:00'),
      venue: 'MEO Arena',
      status: 'draft',
      ticketsSold: 0,
      totalTickets: 12000,
      revenue: 0,
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800'
    }
  ];

  const totalRevenue = mockPromoterEvents.reduce((sum, event) => sum + event.revenue, 0);
  const totalTicketsSold = mockPromoterEvents.reduce((sum, event) => sum + event.ticketsSold, 0);
  const totalCapacity = mockPromoterEvents.reduce((sum, event) => sum + event.totalTickets, 0);
  const averageTicketPrice = totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0;
  const occupancyRate = totalCapacity > 0 ? (totalTicketsSold / totalCapacity) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-PT').format(value);
  };

  const renderStatCard = (title: string, value: string, icon: React.ReactNode, trend?: string) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={styles.statIcon}>
          <Text>{icon}</Text>
        </View>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {trend && (
        <View style={styles.statTrend}>
          <TrendingUp size={12} color="#0099a8" />
          <Text style={styles.statTrendText}>{trend}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Bem-vindo, {user?.name || 'Promotor'}</Text>
      </View>
      <View style={styles.statsGrid}>
        {renderStatCard(
          'Receita Total',
          formatCurrency(totalRevenue),
          <Euro size={20} color="#0099a8" />,
          '+12.5%'
        )}
        {renderStatCard(
          'Bilhetes Vendidos',
          formatNumber(totalTicketsSold),
          <Users size={20} color="#0099a8" />,
          '+8.3%'
        )}
        {renderStatCard(
          'Taxa de Ocupação',
          `${occupancyRate.toFixed(1)}%`,
          <Target size={20} color="#0099a8" />,
          occupancyRate > 75 ? '+5.2%' : '-2.1%'
        )}
        {renderStatCard(
          'Preço Médio/Bilhete',
          formatCurrency(averageTicketPrice),
          <Ticket size={20} color="#0099a8" />,
          '+3.7%'
        )}

      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Métricas Avançadas</Text>
        
        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <View style={styles.metricHeader}>
              <Clock size={18} color="#0099a8" />
              <Text style={styles.metricLabel}>Tempo Médio p/ Venda</Text>
            </View>
            <Text style={styles.metricValue}>2.3 dias</Text>
            <View style={styles.metricTrend}>
              <TrendingDown size={12} color="#22c55e" />
              <Text style={[styles.metricTrendText, { color: '#22c55e' }]}>-15% (mais rápido)</Text>
            </View>
          </View>

          <View style={styles.metricBox}>
            <View style={styles.metricHeader}>
              <Eye size={18} color="#0099a8" />
              <Text style={styles.metricLabel}>Visualizações/Evento</Text>
            </View>
            <Text style={styles.metricValue}>8.2K</Text>
            <View style={styles.metricTrend}>
              <TrendingUp size={12} color="#0099a8" />
              <Text style={[styles.metricTrendText, { color: '#0099a8' }]}>+22.5%</Text>
            </View>
          </View>
        </View>


      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Análise dos Anúncios</Text>
        
        <View style={styles.adsAnalyticsCard}>
          <Text style={styles.adsCardTitle}>Resumo de Anúncios Ativos</Text>
          
          <View style={styles.adsStatsGrid}>
            <View style={styles.adsStat}>
              <View style={styles.adsStatIconContainer}>
                <Megaphone size={24} color="#0099a8" />
              </View>
              <Text style={styles.adsStatValue}>8</Text>
              <Text style={styles.adsStatLabel}>Anúncios Ativos</Text>
            </View>
            
            <View style={styles.adsStat}>
              <View style={styles.adsStatIconContainer}>
                <Eye size={24} color="#0099a8" />
              </View>
              <Text style={styles.adsStatValue}>45.2K</Text>
              <Text style={styles.adsStatLabel}>Impressões Totais</Text>
            </View>
            
            <View style={styles.adsStat}>
              <View style={styles.adsStatIconContainer}>
                <MousePointer size={24} color="#0099a8" />
              </View>
              <Text style={styles.adsStatValue}>2.8K</Text>
              <Text style={styles.adsStatLabel}>Cliques</Text>
            </View>
            
            <View style={styles.adsStat}>
              <View style={styles.adsStatIconContainer}>
                <DollarSign size={24} color="#0099a8" />
              </View>
              <Text style={styles.adsStatValue}>€1,240</Text>
              <Text style={styles.adsStatLabel}>Gasto Total</Text>
            </View>
          </View>

          <View style={styles.adsDivider} />

          <Text style={styles.adsSubtitle}>Desempenho por Evento</Text>
          
          <View style={styles.adsEventList}>
            <View style={styles.adsEventItem}>
              <View style={styles.adsEventHeader}>
                <Text style={styles.adsEventName}>Arctic Monkeys</Text>
                <View style={styles.adsEventBadge}>
                  <Text style={styles.adsEventBadgeText}>3 anúncios</Text>
                </View>
              </View>
              <View style={styles.adsEventMetrics}>
                <View style={styles.adsEventMetric}>
                  <Eye size={14} color="#666" />
                  <Text style={styles.adsEventMetricText}>18.5K impressões</Text>
                </View>
                <View style={styles.adsEventMetric}>
                  <MousePointer size={14} color="#666" />
                  <Text style={styles.adsEventMetricText}>6.2% CTR</Text>
                </View>
              </View>
              <Text style={styles.adsEventSpend}>Gasto: €480</Text>
            </View>

            <View style={styles.adsEventItem}>
              <View style={styles.adsEventHeader}>
                <Text style={styles.adsEventName}>Festival NOS Alive 2025</Text>
                <View style={styles.adsEventBadge}>
                  <Text style={styles.adsEventBadgeText}>5 anúncios</Text>
                </View>
              </View>
              <View style={styles.adsEventMetrics}>
                <View style={styles.adsEventMetric}>
                  <Eye size={14} color="#666" />
                  <Text style={styles.adsEventMetricText}>26.7K impressões</Text>
                </View>
                <View style={styles.adsEventMetric}>
                  <MousePointer size={14} color="#666" />
                  <Text style={styles.adsEventMetricText}>5.8% CTR</Text>
                </View>
              </View>
              <Text style={styles.adsEventSpend}>Gasto: €760</Text>
            </View>
          </View>
        </View>
      </View>
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => router.push('/create-event')}
      >
        <Plus size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0099a8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0099a8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8
  },

  welcomeContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    width: (width - 44) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  statIcon: {
    marginRight: 8
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500'
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  statTrendText: {
    fontSize: 12,
    color: '#0099a8',
    fontWeight: '500'
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4
  },
  analyticsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  analyticsHeader: {
    marginBottom: 16
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  analyticsMetrics: {
    flexDirection: 'row',
    gap: 16
  },
  analyticsMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  analyticsMetricText: {
    fontSize: 12,
    color: '#666'
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center'
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    flex: 1
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  metricTrendText: {
    fontSize: 12,
    fontWeight: '500'
  },
  adsAnalyticsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2
  },
  adsCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20
  },
  adsStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20
  },
  adsStat: {
    width: (width - 92) / 2,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8
  },
  adsStatIconContainer: {
    marginBottom: 8
  },
  adsStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4
  },
  adsStatLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  adsDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 20
  },
  adsSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  adsEventList: {
    gap: 12
  },
  adsEventItem: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0099a8'
  },
  adsEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  adsEventName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1
  },
  adsEventBadge: {
    backgroundColor: '#0099a8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  adsEventBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff'
  },
  adsEventMetrics: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8
  },
  adsEventMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  adsEventMetricText: {
    fontSize: 12,
    color: '#666'
  },
  adsEventSpend: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0099a8'
  }
});

export default PromoterDashboard;
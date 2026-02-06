import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Eye,
  CheckCircle,
  Info,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Target,
  CreditCard,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Award,
  MapPin,
} from 'lucide-react-native';
import { useUser } from '@/hooks/user-context';
import { COLORS } from '@/constants/colors';
import AuthGuard from '@/components/AuthGuard';

type AdType = 'banner' | 'card' | 'sponsored_event';
type AdDuration = '7' | '14' | '30';

interface AdPackage {
  type: AdType;
  name: string;
  description: string;
  price: number;
  features: string[];
  estimatedViews: string;
}

const adPackages: AdPackage[] = [
  {
    type: 'banner',
    name: 'Banner Premium',
    description: 'Banner destacado no topo da página inicial',
    price: 299,
    features: [
      'Posição premium no topo',
      'Visibilidade máxima',
      'Design personalizado',
      'Link direto para evento'
    ],
    estimatedViews: '10K-15K'
  },
  {
    type: 'card',
    name: 'Card Promocional',
    description: 'Card promocional integrado na lista de eventos',
    price: 199,
    features: [
      'Integração natural',
      'Boa visibilidade',
      'Formato compacto',
      'Call-to-action incluído'
    ],
    estimatedViews: '5K-8K'
  },
  {
    type: 'sponsored_event',
    name: 'Evento Patrocinado',
    description: 'Destaque especial para seu evento',
    price: 149,
    features: [
      'Badge "Patrocinado"',
      'Posição privilegiada',
      'Destaque visual',
      'Maior engajamento'
    ],
    estimatedViews: '3K-5K'
  }
];

const adPlacements = {
  banner: [
    { screen: 'Página Inicial', position: 'Topo da página', description: 'Banner horizontal full-width no topo da home' },
    { screen: 'Lista de Eventos', position: 'Topo da lista', description: 'Banner destacado acima dos eventos' },
  ],
  card: [
    { screen: 'Página Inicial', position: 'Integrado na lista', description: 'Card entre eventos na página inicial' },
    { screen: 'Pesquisa', position: 'Resultados de pesquisa', description: 'Card nos resultados de busca' },
    { screen: 'Favoritos', position: 'Lista de favoritos', description: 'Card na lista de eventos favoritos' },
  ],
  sponsored_event: [
    { screen: 'Página Inicial', position: 'Topo da lista', description: 'Evento com badge "Patrocinado" no topo' },
    { screen: 'Pesquisa', position: 'Primeiro resultado', description: 'Aparece como primeiro resultado de busca' },
    { screen: 'Mapa', position: 'Pin destacado', description: 'Pin com cor especial no mapa' },
  ]
};

const durationPricing = {
  '7': { multiplier: 1, label: '7 dias' },
  '14': { multiplier: 1.8, label: '14 dias' },
  '30': { multiplier: 3.2, label: '30 dias' }
};

type Step = 'event' | 'package' | 'duration' | 'review' | 'confirmation';

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

function AdPurchaseContent() {
  const { user } = useUser();

  if (user?.email === 'admin@lyven.com') {
    return <AdminAnalyticsContent />;
  }

  if (user?.userType !== 'promoter') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Acesso negado</Text>
      </View>
    );
  }

  return <PromoterAdPurchaseContent />;
}

function AdminAnalyticsContent() {
  const insets = useSafeAreaInsets();
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

  const formatCurrency = (value: number) => `€${value.toLocaleString()}`;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tendência Mensal</Text>
            <View style={styles.chartContainer}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Receita por Mês</Text>
              </View>
              <View style={styles.simpleChart}>
                {monthlyData.map((data) => (
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
    </View>
  );
}

function PromoterAdPurchaseContent() {
  const [currentStep, setCurrentStep] = useState<Step>('event');
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<AdPackage | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<AdDuration>('7');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const calculateTotalPrice = () => {
    if (!selectedPackage) return 0;
    return Math.round(selectedPackage.price * durationPricing[selectedDuration].multiplier);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'event': return 'Selecionar Evento';
      case 'package': return 'Escolher Pacote';
      case 'duration': return 'Duração & Segmentação';
      case 'review': return 'Revisão & Pagamento';
      case 'confirmation': return 'Confirmação';
      default: return 'Comprar Espaço Publicitário';
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 'event': return selectedEvent !== null;
      case 'package': return selectedPackage !== null;
      case 'duration': return true;
      case 'review': return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (!canProceedToNext()) {
      Alert.alert('Erro', 'Por favor, complete todos os campos obrigatórios.');
      return;
    }

    switch (currentStep) {
      case 'event': setCurrentStep('package'); break;
      case 'package': setCurrentStep('duration'); break;
      case 'duration': setCurrentStep('review'); break;
      case 'review': handleSubmitAd(); break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'package': setCurrentStep('event'); break;
      case 'duration': setCurrentStep('package'); break;
      case 'review': setCurrentStep('duration'); break;
      default: break;
    }
  };

  const resetAndBackToStart = () => {
    setCurrentStep('event');
    setSelectedEvent(null);
    setSelectedPackage(null);
    setSelectedDuration('7');
  };

  const handleSubmitAd = async () => {
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentStep('confirmation');
    } catch {
      Alert.alert('Erro', 'Ocorreu um erro ao enviar o anúncio. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const PackageCard = ({ pkg }: { pkg: AdPackage }) => (
    <TouchableOpacity
      style={[
        styles.packageCard,
        selectedPackage?.type === pkg.type && styles.selectedPackage
      ]}
      onPress={() => setSelectedPackage(pkg)}
    >
      <View style={styles.packageHeader}>
        <Text style={styles.packageName}>{pkg.name}</Text>
        <Text style={styles.packagePrice}>€{pkg.price}</Text>
      </View>
      <Text style={styles.packageDescription}>{pkg.description}</Text>
      
      <View style={styles.packageFeatures}>
        {pkg.features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <CheckCircle size={14} color={COLORS.primary} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.packageStats}>
        <View style={styles.statItemPackage}>
          <Eye size={16} color={COLORS.textSecondary} />
          <Text style={styles.statText}>{pkg.estimatedViews} visualizações</Text>
        </View>
      </View>

      <View style={styles.placementsSection}>
        <View style={styles.placementsSectionHeader}>
          <MapPin size={16} color={COLORS.primary} />
          <Text style={styles.placementsSectionTitle}>Onde aparece:</Text>
        </View>
        {adPlacements[pkg.type].map((placement, index) => (
          <View key={index} style={styles.placementItem}>
            <View style={styles.placementDot} />
            <View style={styles.placementContent}>
              <Text style={styles.placementScreen}>{placement.screen}</Text>
              <Text style={styles.placementPosition}>→ {placement.position}</Text>
              <Text style={styles.placementDescription}>{placement.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const DurationOption = ({ duration }: { duration: AdDuration }) => (
    <TouchableOpacity
      style={[
        styles.durationOption,
        selectedDuration === duration && styles.selectedDuration
      ]}
      onPress={() => setSelectedDuration(duration)}
    >
      <Text style={[
        styles.durationText,
        selectedDuration === duration && styles.selectedDurationText
      ]}>
        {durationPricing[duration].label}
      </Text>
      {selectedPackage && (
        <Text style={[
          styles.durationPrice,
          selectedDuration === duration && styles.selectedDurationPrice
        ]}>
          €{Math.round(selectedPackage.price * durationPricing[duration].multiplier)}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderStepIndicator = () => {
    const steps = ['event', 'package', 'duration', 'review', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    
    return (
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          
          return (
            <View key={step} style={styles.stepItem}>
              <View style={[
                styles.stepCircle,
                isActive && styles.stepCircleActive,
                isCompleted && styles.stepCircleCompleted
              ]}>
                <Text style={[
                  styles.stepNumber,
                  (isActive || isCompleted) && styles.stepNumberActive
                ]}>
                  {index + 1}
                </Text>
              </View>
              {index < steps.length - 1 && (
                <View style={[
                  styles.stepLine,
                  isCompleted && styles.stepLineCompleted
                ]} />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderEventStep = () => {
    const demoPromoterEvents = [
      {
        id: 'demo-1',
        title: 'Arctic Monkeys',
        date: new Date('2025-11-15T21:00:00'),
        category: 'music',
        image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
        venue: {
          name: 'Coliseu dos Recreios',
          city: 'Lisboa',
        },
      },
      {
        id: 'demo-2',
        title: 'Festival NOS Alive 2025',
        date: new Date('2025-12-10T16:00:00'),
        category: 'festival',
        image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
        venue: {
          name: 'Passeio Marítimo de Algés',
          city: 'Algés',
        },
      },
      {
        id: 'demo-3',
        title: 'Concerto na MEO Arena',
        date: new Date('2026-01-20T20:00:00'),
        category: 'music',
        image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
        venue: {
          name: 'MEO Arena',
          city: 'Lisboa',
        },
      },
    ];

    const now = new Date();
    const upcomingEvents = demoPromoterEvents.filter(event => new Date(event.date) >= now);

    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>Selecione o Evento para Promover</Text>
        <Text style={styles.stepSubtitle}>
          Escolha qual dos seus eventos deseja promover com anúncios
        </Text>
        
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={[
                styles.eventSelectCard,
                selectedEvent?.id === event.id && styles.selectedEventCard
              ]}
              onPress={() => setSelectedEvent(event)}
            >
              <Image
                source={{ uri: event.image }}
                style={styles.eventSelectImage}
                resizeMode="cover"
              />
              <View style={styles.eventSelectContent}>
                <Text style={styles.eventSelectTitle}>{event.title}</Text>
                <View style={styles.eventSelectInfo}>
                  <View style={styles.eventSelectInfoRow}>
                    <Calendar size={14} color={COLORS.textSecondary} />
                    <Text style={styles.eventSelectInfoText}>
                      {new Date(event.date).toLocaleDateString('pt-PT')}
                    </Text>
                  </View>
                  <View style={styles.eventSelectInfoRow}>
                    <MapPin size={14} color={COLORS.textSecondary} />
                    <Text style={styles.eventSelectInfoText}>
                      {event.venue.name}, {event.venue.city}
                    </Text>
                  </View>
                </View>
              </View>
              {selectedEvent?.id === event.id && (
                <View style={styles.eventSelectCheckmark}>
                  <CheckCircle size={24} color={COLORS.primary} />
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noEventsContainer}>
            <Calendar size={48} color={COLORS.textSecondary} />
            <Text style={styles.noEventsText}>Nenhum evento disponível</Text>
            <Text style={styles.noEventsSubtext}>
              Crie um evento primeiro para poder promovê-lo
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderPackageStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Escolha seu Pacote Publicitário</Text>
      <Text style={styles.stepSubtitle}>
        Selecione o tipo de anúncio que melhor se adequa aos seus objetivos
      </Text>
      
      {adPackages.map((pkg) => (
        <PackageCard key={pkg.type} pkg={pkg} />
      ))}
    </View>
  );

  const renderDurationStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Duração & Segmentação</Text>
      <Text style={styles.stepSubtitle}>
        Configure a duração da sua campanha publicitária
      </Text>
      
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeader}>
          <Calendar size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitleBlock}>Duração da Campanha</Text>
        </View>
        <View style={styles.durationContainer}>
          <DurationOption duration="7" />
          <DurationOption duration="14" />
          <DurationOption duration="30" />
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeader}>
          <Target size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitleBlock}>Segmentação</Text>
        </View>
        <View style={styles.targetingCard}>
          <Text style={styles.targetingTitle}>Público-Alvo Automático</Text>
          <Text style={styles.targetingDescription}>
            Seu anúncio será exibido para usuários interessados em eventos similares
            baseado em histórico de pesquisas e preferências.
          </Text>
          <View style={styles.targetingFeatures}>
            <Text style={styles.targetingFeature}>• Usuários da sua região</Text>
            <Text style={styles.targetingFeature}>• Interessados na categoria do evento</Text>
            <Text style={styles.targetingFeature}>• Histórico de compras similares</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderReviewStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Revisão & Pagamento</Text>
      <Text style={styles.stepSubtitle}>
        Revise todos os detalhes antes de finalizar sua compra
      </Text>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Evento Selecionado</Text>
        <View style={styles.reviewCard}>
          <Text style={styles.reviewContentTitle}>{selectedEvent?.title}</Text>
          <Text style={styles.reviewContentDescription}>
            {selectedEvent?.venue.name}, {selectedEvent?.venue.city}
          </Text>
          <Text style={styles.reviewSubtext}>
            {selectedEvent && new Date(selectedEvent.date).toLocaleDateString('pt-PT')}
          </Text>
          {selectedEvent?.image && (
            <Image 
              source={{ uri: selectedEvent.image }} 
              style={styles.reviewImage}
              resizeMode="cover"
            />
          )}
        </View>
      </View>
      
      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Pacote Selecionado</Text>
        <View style={styles.reviewCard}>
          <Text style={styles.reviewPackageName}>{selectedPackage?.name}</Text>
          <Text style={styles.reviewPackageDescription}>{selectedPackage?.description}</Text>
          <Text style={styles.reviewPackagePrice}>€{selectedPackage?.price}</Text>
        </View>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Duração</Text>
        <View style={styles.reviewCard}>
          <Text style={styles.reviewText}>{durationPricing[selectedDuration].label}</Text>
          <Text style={styles.reviewSubtext}>
            Estimativa: {selectedPackage?.estimatedViews} visualizações
          </Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <CreditCard size={20} color={COLORS.primary} />
          <Text style={styles.summaryTitle}>Resumo do Pagamento</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Pacote {selectedPackage?.name}:</Text>
          <Text style={styles.summaryValue}>€{selectedPackage?.price}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Duração ({durationPricing[selectedDuration].label}):</Text>
          <Text style={styles.summaryValue}>x{durationPricing[selectedDuration].multiplier}</Text>
        </View>
        
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>€{calculateTotalPrice()}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Info size={20} color={COLORS.primary} />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Processo de Aprovação</Text>
          <Text style={styles.infoText}>
            Seu anúncio será analisado pela nossa equipe em até 24 horas úteis.
            Você receberá uma notificação quando for aprovado.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderConfirmationStep = () => (
    <View style={styles.confirmationContent}>
      <View style={styles.confirmationInner}>
        <View style={styles.successIcon}>
          <CheckCircle size={64} color={COLORS.primary} />
        </View>
        
        <Text style={styles.confirmationTitle}>Anúncio Enviado com Sucesso!</Text>
        <Text style={styles.confirmationSubtitle}>
          Seu anúncio foi enviado para aprovação e será analisado pela nossa equipe.
        </Text>
        
        <View style={styles.confirmationDetails}>
          <View style={styles.confirmationRow}>
            <Text style={styles.confirmationLabel}>Pacote:</Text>
            <Text style={styles.confirmationValue}>{selectedPackage?.name}</Text>
          </View>
          <View style={styles.confirmationRow}>
            <Text style={styles.confirmationLabel}>Duração:</Text>
            <Text style={styles.confirmationValue}>{durationPricing[selectedDuration].label}</Text>
          </View>
          <View style={styles.confirmationRow}>
            <Text style={styles.confirmationLabel}>Total Pago:</Text>
            <Text style={styles.confirmationValue}>€{calculateTotalPrice()}</Text>
          </View>
        </View>
        
        <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>Próximos Passos:</Text>
          <Text style={styles.nextStepsText}>• Análise do conteúdo (até 24h)</Text>
          <Text style={styles.nextStepsText}>• Notificação de aprovação</Text>
          <Text style={styles.nextStepsText}>• Início da campanha</Text>
          <Text style={styles.nextStepsText}>• Relatórios de performance</Text>
        </View>
        
        <View style={styles.confirmationButtons}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={resetAndBackToStart}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.doneButton}
            onPress={resetAndBackToStart}
          >
            <Text style={styles.doneButtonText}>Novo Anúncio</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'event': return renderEventStep();
      case 'package': return renderPackageStep();
      case 'duration': return renderDurationStep();
      case 'review': return renderReviewStep();
      case 'confirmation': return renderConfirmationStep();
      default: return renderPackageStep();
    }
  };

  return (
    <View style={styles.container}>
      {currentStep !== 'confirmation' && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{getStepTitle()}</Text>
        </View>
      )}
      
      {currentStep !== 'confirmation' && renderStepIndicator()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>
      
      {currentStep !== 'confirmation' && (
        <View style={styles.bottomNavigation}>
          {currentStep !== 'event' && (
            <TouchableOpacity
              style={styles.backNavButton}
              onPress={handleBack}
            >
              <ChevronLeft size={20} color={COLORS.white} />
              <Text style={styles.backNavText}>Voltar</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.nextButton,
              !canProceedToNext() && styles.nextButtonDisabled,
              isSubmitting && styles.nextButtonDisabled
            ]}
            onPress={handleNext}
            disabled={!canProceedToNext() || isSubmitting}
          >
            <Text style={[
              styles.nextButtonText,
              !canProceedToNext() && styles.nextButtonTextDisabled
            ]}>
              {currentStep === 'review' 
                ? (isSubmitting ? 'Processando...' : 'Finalizar Compra')
                : 'Continuar'
              }
            </Text>
            {currentStep !== 'review' && <ChevronRight size={20} color={COLORS.white} />}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function AdPurchaseScreen() {
  return (
    <AuthGuard>
      <AdPurchaseContent />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 48,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
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
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: COLORS.card,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepCircleCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: COLORS.textSecondary,
  },
  stepNumberActive: {
    color: COLORS.white,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  stepLineCompleted: {
    backgroundColor: COLORS.primary,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  sectionBlock: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleBlock: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginLeft: 8,
  },
  targetingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  targetingTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  targetingDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  targetingFeatures: {
    gap: 4,
  },
  targetingFeature: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  packageCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  selectedPackage: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
  },
  packageDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  packageFeatures: {
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  packageStats: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  statItemPackage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  durationContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  durationOption: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  selectedDuration: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  durationText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  selectedDurationText: {
    color: COLORS.text,
  },
  durationPrice: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.textSecondary,
  },
  selectedDurationPrice: {
    color: COLORS.primary,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  inputHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontStyle: 'italic' as const,
  },
  previewContainer: {
    marginTop: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  adPreview: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewImage: {
    width: '100%',
    height: 120,
  },
  previewContent: {
    padding: 12,
  },
  previewAdTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  previewAdDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  reviewSection: {
    marginBottom: 20,
  },
  reviewSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  reviewCard: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewPackageName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  reviewPackageDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  reviewPackagePrice: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
  },
  reviewText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  reviewSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  reviewContentTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  reviewContentDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  reviewImage: {
    width: '100%',
    height: 80,
    borderRadius: 6,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500' as const,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
  },
  confirmationContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationInner: {
    width: '100%',
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 24,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmationSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  confirmationDetails: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmationLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  confirmationValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500' as const,
  },
  nextStepsCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 12,
  },
  nextStepsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  backButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
  },
  doneButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.white,
  },
  bottomNavigation: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  backNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.textSecondary,
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 16,
  },
  backNavText: {
    fontSize: 16,
    color: COLORS.white,
    marginLeft: 4,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 16,
  },
  nextButtonDisabled: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.white,
    marginRight: 4,
  },
  nextButtonTextDisabled: {
    color: COLORS.primary,
  },
  placementsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  placementsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  placementsSectionTitle: {
    fontSize: 15,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  placementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  placementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },
  placementContent: {
    flex: 1,
  },
  placementScreen: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 2,
  },
  placementPosition: {
    fontSize: 13,
    color: COLORS.primary,
    marginBottom: 2,
  },
  placementDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  eventSelectCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  selectedEventCard: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  eventSelectImage: {
    width: 100,
    height: 100,
  },
  eventSelectContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  eventSelectTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  eventSelectInfo: {
    gap: 4,
  },
  eventSelectInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventSelectInfoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  eventSelectCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noEventsText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noEventsSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

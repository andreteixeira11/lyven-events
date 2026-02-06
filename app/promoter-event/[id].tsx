import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Users,
  QrCode as QrCodeIcon,
  BarChart3,
  Search,
  CheckCircle,
  XCircle,
  DollarSign,
  Eye,
  TrendingUp,
  Download,
  ChevronRight,
} from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { LoadingSpinner, ErrorState } from '@/components/LoadingStates';
import { handleError } from '@/lib/error-handler';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

type Section = 'buyers' | 'scanner' | 'stats';

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

export default function PromoterEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeSection, setActiveSection] = useState<Section>('buyers');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValidated, setFilterValidated] = useState<'all' | 'validated' | 'pending'>('all');
  const [showPendingBuyers, setShowPendingBuyers] = useState(false);

  const { data: eventData, isLoading, error, refetch } = trpc.events.get.useQuery(
    { id: id ?? '' },
    { enabled: !!id }
  );
  const event = eventData
    ? {
        id: eventData.id,
        title: eventData.title,
        image: eventData.image,
        description: eventData.description,
        date: new Date(eventData.date),
        endDate: eventData.endDate ? new Date(eventData.endDate) : undefined,
        venue: typeof eventData.venue === 'object' && eventData.venue
          ? { id: (eventData.venue as any).id ?? '', name: (eventData.venue as any).name ?? '', address: (eventData.venue as any).address ?? '', city: (eventData.venue as any).city ?? '', capacity: (eventData.venue as any).capacity ?? 0 }
          : { id: '', name: '', address: '', city: '', capacity: 0 },
        promoter: typeof eventData.promoter === 'object' && eventData.promoter
          ? { id: (eventData.promoter as any).id ?? '', name: (eventData.promoter as any).name ?? '', image: (eventData.promoter as any).image ?? '', description: (eventData.promoter as any).description ?? '', verified: !!(eventData.promoter as any).verified, followersCount: (eventData.promoter as any).followersCount ?? 0 }
          : { id: '', name: '', image: '', description: '', verified: false, followersCount: 0 },
        ticketTypes: Array.isArray(eventData.ticketTypes) ? eventData.ticketTypes : [],
      }
    : null;

  const mockBuyers: TicketBuyer[] = [
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
  ];

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

  const filteredBuyers = mockBuyers.filter(buyer => {
    const matchesSearch = searchQuery.trim() === '' || 
      buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.phone.includes(searchQuery) ||
      buyer.ticketType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterValidated === 'all' || 
      (filterValidated === 'validated' ? buyer.isValidated : !buyer.isValidated);
    
    return matchesSearch && matchesFilter;
  });

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

  const handleExportPDF = async () => {
    try {
      const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Helvetica', 'Arial', sans-serif;
              padding: 40px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #0099a8;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #0099a8;
              margin: 0 0 10px 0;
              font-size: 28px;
            }
            .event-info {
              background: #f5f5f5;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .event-info p {
              margin: 8px 0;
              font-size: 14px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin-bottom: 30px;
            }
            .stat-card {
              background: #f9f9f9;
              border: 2px solid #e0e0e0;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
            }
            .stat-value {
              font-size: 24px;
              font-weight: bold;
              color: #0099a8;
              margin: 10px 0;
            }
            .stat-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
            }
            .section-title {
              font-size: 20px;
              color: #0099a8;
              margin: 30px 0 15px 0;
              padding-bottom: 10px;
              border-bottom: 2px solid #e0e0e0;
            }
            .buyers-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .buyers-table th {
              background: #0099a8;
              color: white;
              padding: 12px;
              text-align: left;
              font-size: 12px;
              text-transform: uppercase;
            }
            .buyers-table td {
              padding: 10px 12px;
              border-bottom: 1px solid #e0e0e0;
              font-size: 12px;
            }
            .buyers-table tr:nth-child(even) {
              background: #f9f9f9;
            }
            .status-validated {
              color: #28A745;
              font-weight: bold;
            }
            .status-pending {
              color: #FFA500;
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #999;
              font-size: 12px;
              border-top: 1px solid #e0e0e0;
              padding-top: 20px;
            }
            .progress-section {
              background: #f9f9f9;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .progress-bar {
              height: 30px;
              background: #e0e0e0;
              border-radius: 15px;
              overflow: hidden;
              margin: 10px 0;
            }
            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, #28A745, #34d058);
              display: flex;
              align-items: center;
              justify-content: flex-end;
              padding-right: 10px;
              color: white;
              font-weight: bold;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório do Evento</h1>
            <p>${event.title}</p>
            <p style="color: #666; font-size: 12px;">Gerado em ${formatDate(new Date())}</p>
          </div>

          <div class="event-info">
            <p><strong>Local:</strong> ${event.venue.name}</p>
            <p><strong>Data:</strong> ${formatDate(event.date)}</p>
            <p><strong>Capacidade:</strong> ${event.venue.capacity} pessoas</p>
          </div>

          <h2 class="section-title">Estatísticas Gerais</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Compradores</div>
              <div class="stat-value">${totalBuyers}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Bilhetes Vendidos</div>
              <div class="stat-value">${totalTickets}</div>
              <p style="font-size: 10px; color: #999; margin: 5px 0 0 0;">de ${event.venue.capacity} total</p>
            </div>
            <div class="stat-card">
              <div class="stat-label">Receita Total</div>
              <div class="stat-value">${formatCurrency(totalRevenue)}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Bilhetes Validados</div>
              <div class="stat-value">${validatedTickets}</div>
            </div>
          </div>

          <div class="progress-section">
            <h3 style="margin: 0 0 15px 0; color: #333;">Progresso de Validação</h3>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${(validatedTickets / totalTickets) * 100}%">
                ${Math.round((validatedTickets / totalTickets) * 100)}%
              </div>
            </div>
            <p style="text-align: center; color: #666; font-size: 14px; margin-top: 10px;">
              ${validatedTickets} de ${totalTickets} bilhetes validados
            </p>
          </div>

          <h2 class="section-title">Lista de Compradores</h2>
          <table class="buyers-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Tipo</th>
                <th>Qtd</th>
                <th>Total</th>
                <th>Data Compra</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${mockBuyers.map(buyer => `
                <tr>
                  <td>${buyer.name}</td>
                  <td>${buyer.email}</td>
                  <td>${buyer.phone}</td>
                  <td>${buyer.ticketType}</td>
                  <td>${buyer.quantity}</td>
                  <td>${formatCurrency(buyer.totalPaid)}</td>
                  <td>${formatDate(buyer.purchaseDate)}</td>
                  <td class="${buyer.isValidated ? 'status-validated' : 'status-pending'}">
                    ${buyer.isValidated ? 'Validado' : 'Pendente'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2 class="section-title">Análise de Conversão</h2>
          <div class="event-info">
            <p><strong>Visualizações:</strong> 12,400</p>
            <p><strong>Cliques:</strong> 1,850</p>
            <p><strong>Compras:</strong> ${totalBuyers}</p>
            <p><strong>Taxa de Conversão:</strong> 3.2%</p>
          </div>

          <div class="footer">
            <p>Relatório gerado automaticamente pelo sistema</p>
            <p>${event.title} - ${event.venue.name}</p>
          </div>
        </body>
      </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = uri;
        link.download = `evento-${event.id}-relatorio.pdf`;
        link.click();
        Alert.alert('Sucesso', 'Relatório exportado com sucesso!');
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Exportar Relatório do Evento',
            UTI: 'com.adobe.pdf'
          });
        } else {
          Alert.alert('Erro', 'Não é possível partilhar o ficheiro neste dispositivo');
        }
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao exportar o relatório');
    }
  };



  const renderBuyersSection = () => (
    <View style={styles.sectionContent}>
      <ScrollView style={styles.buyersList} showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInput}>
            <Search size={20} color="#666" />
            <TextInput
              style={styles.searchText}
              placeholder="Pesquisar compradores..."
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

        <Text style={styles.resultsCount}>
          {filteredBuyers.length} {filteredBuyers.length === 1 ? 'comprador' : 'compradores'}
        </Text>
        
        {filteredBuyers.map((buyer) => (
          <View key={buyer.id} style={styles.buyerCard}>
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
              style={styles.viewDetailsButton}
              onPress={() => router.push(`/buyer-details/${buyer.id}`)}
            >
              <Text style={styles.viewDetailsText}>Ver Detalhes</Text>
              <ChevronRight size={18} color="#0099a8" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderScannerSection = () => {
    const pendingBuyers = mockBuyers.filter(buyer => !buyer.isValidated);

    return (
      <View style={styles.sectionContent}>
        {!showPendingBuyers ? (
          <>
            <View style={styles.scannerPlaceholder}>
              <QrCodeIcon size={64} color="#0099a8" />
              <Text style={styles.scannerTitle}>Scanner QR Code</Text>
              <Text style={styles.scannerDescription}>
                Use esta funcionalidade para validar bilhetes no dia do evento
              </Text>
              <TouchableOpacity 
                style={styles.openScannerButton}
                onPress={() => router.push(`/qr-scanner/${id}`)}
              >
                <QrCodeIcon size={20} color="#fff" />
                <Text style={styles.openScannerButtonText}>Abrir Scanner</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.validationStats}>
              <Text style={styles.validationStatsTitle}>Estatísticas de Validação</Text>
              <View style={styles.validationStatsGrid}>
                <View style={styles.validationStatCard}>
                  <CheckCircle size={24} color="#28A745" />
                  <Text style={styles.validationStatValue}>{validatedTickets}</Text>
                  <Text style={styles.validationStatLabel}>Bilhetes Validados</Text>
                </View>
                <TouchableOpacity 
                  style={styles.validationStatCard}
                  onPress={() => setShowPendingBuyers(true)}
                >
                  <XCircle size={24} color="#FFA500" />
                  <Text style={styles.validationStatValue}>{totalTickets - validatedTickets}</Text>
                  <Text style={styles.validationStatLabel}>Por Validar</Text>
                </TouchableOpacity>
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
                {Math.round((validatedTickets / totalTickets) * 100)}% dos bilhetes foram validados
              </Text>
            </View>
          </>
        ) : (
          <ScrollView style={styles.pendingBuyersList} showsVerticalScrollIndicator={false}>
            <View style={styles.pendingBuyersHeader}>
              <TouchableOpacity 
                style={styles.backToPendingButton}
                onPress={() => setShowPendingBuyers(false)}
              >
                <ArrowLeft size={20} color="#0099a8" />
                <Text style={styles.backToPendingButtonText}>Voltar</Text>
              </TouchableOpacity>
              <Text style={styles.pendingBuyersTitle}>
                Compradores por Validar ({pendingBuyers.length})
              </Text>
            </View>

            <View style={styles.pendingBuyersContent}>
              {pendingBuyers.map((buyer) => (
                <View key={buyer.id} style={styles.buyerCard}>
                  <View style={styles.buyerHeader}>
                    <View style={styles.buyerInfo}>
                      <Text style={styles.buyerName}>{buyer.name}</Text>
                      <Text style={styles.buyerEmail}>{buyer.email}</Text>
                      <Text style={styles.buyerPhone}>{buyer.phone}</Text>
                    </View>
                    <View style={styles.validationStatus}>
                      <View style={styles.pendingBadge}>
                        <XCircle size={16} color="#FFA500" />
                        <Text style={styles.pendingText}>Pendente</Text>
                      </View>
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
                  </View>

                  <TouchableOpacity 
                    style={styles.viewDetailsButton}
                    onPress={() => router.push(`/buyer-details/${buyer.id}`)}
                  >
                    <Text style={styles.viewDetailsText}>Ver Detalhes</Text>
                    <ChevronRight size={18} color="#0099a8" />
                  </TouchableOpacity>
                </View>
              ))}
              {pendingBuyers.length === 0 && (
                <View style={styles.emptyState}>
                  <CheckCircle size={64} color="#28A745" />
                  <Text style={styles.emptyStateTitle}>Todos os bilhetes validados!</Text>
                  <Text style={styles.emptyStateDescription}>
                    Não há compradores pendentes de validação
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    );
  };

  const getSalesOverTime = () => {
    const salesByDate: { [key: string]: { tickets: number; revenue: number } } = {};
    
    mockBuyers.forEach(buyer => {
      const dateKey = new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: 'short'
      }).format(buyer.purchaseDate);
      
      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = { tickets: 0, revenue: 0 };
      }
      
      salesByDate[dateKey].tickets += buyer.quantity;
      salesByDate[dateKey].revenue += buyer.totalPaid;
    });
    
    return Object.entries(salesByDate)
      .sort((a, b) => {
        const dateA = mockBuyers.find(buyer => 
          new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' }).format(buyer.purchaseDate) === a[0]
        )?.purchaseDate;
        const dateB = mockBuyers.find(buyer => 
          new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' }).format(buyer.purchaseDate) === b[0]
        )?.purchaseDate;
        return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
      })
      .map(([date, data]) => ({ date, ...data }));
  };

  const renderStatsSection = () => {
    const salesData = getSalesOverTime();
    const maxTickets = Math.max(...salesData.map(d => d.tickets), 1);
    const maxRevenue = Math.max(...salesData.map(d => d.revenue), 1);

    return (
      <View style={styles.sectionContent}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.statsGrid}>
            <View style={styles.largeStatCard}>
              <DollarSign size={20} color="#00C851" />
              <Text style={styles.largeStatValue}>{formatCurrency(totalRevenue)}</Text>
              <Text style={styles.largeStatLabel}>Receita Total</Text>
              <View style={styles.trendContainer}>
                <TrendingUp size={14} color="#00C851" />
                <Text style={styles.trendText}>+12.5%</Text>
              </View>
            </View>
            
            <View style={styles.largeStatCard}>
              <Users size={20} color="#0099a8" />
              <Text style={styles.largeStatValue}>{totalBuyers}</Text>
              <Text style={styles.largeStatLabel}>Total de Compradores</Text>
              <View style={styles.trendContainer}>
                <TrendingUp size={14} color="#0099a8" />
                <Text style={styles.trendText}>+8.3%</Text>
              </View>
            </View>

            <View style={styles.largeStatCard}>
              <QrCodeIcon size={20} color="#007AFF" />
              <Text style={styles.largeStatValue}>{totalTickets}</Text>
              <Text style={styles.largeStatLabel}>Bilhetes Vendidos</Text>
              <Text style={styles.subStatText}>de {event.venue.capacity} total</Text>
            </View>

            <View style={styles.largeStatCard}>
              <Eye size={20} color="#FF385C" />
              <Text style={styles.largeStatValue}>12.4K</Text>
              <Text style={styles.largeStatLabel}>Visualizações</Text>
              <View style={styles.trendContainer}>
                <TrendingUp size={14} color="#FF385C" />
                <Text style={styles.trendText}>+15.2%</Text>
              </View>
            </View>
          </View>

          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Vendas ao Longo do Tempo</Text>
            {salesData.length > 0 ? (
              <View style={styles.chartContainer}>
                <View style={styles.chartLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#0099a8' }]} />
                    <Text style={styles.legendText}>Bilhetes</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#00C851' }]} />
                    <Text style={styles.legendText}>Receita</Text>
                  </View>
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chartContent}>
                    <View style={styles.chartBarsContainer}>
                      {salesData.map((data, index) => {
                        const ticketHeight = (data.tickets / maxTickets) * 180;
                        const revenueHeight = (data.revenue / maxRevenue) * 180;
                        
                        return (
                          <View key={index} style={styles.barGroup}>
                            <View style={styles.barsWrapper}>
                              <View style={styles.barContainer}>
                                <View style={styles.barValueContainer}>
                                  <Text style={styles.barValue}>{data.tickets}</Text>
                                </View>
                                <View style={[styles.bar, styles.ticketsBar, { height: ticketHeight }]} />
                              </View>
                              <View style={styles.barContainer}>
                                <View style={styles.barValueContainer}>
                                  <Text style={styles.barValue}>€{data.revenue}</Text>
                                </View>
                                <View style={[styles.bar, styles.revenueBar, { height: revenueHeight }]} />
                              </View>
                            </View>
                            <Text style={styles.barLabel}>{data.date}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </ScrollView>
              </View>
            ) : (
              <View style={styles.chartPlaceholder}>
                <BarChart3 size={48} color="#ccc" />
                <Text style={styles.chartPlaceholderText}>
                  Sem dados de vendas disponíveis
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: event.title,
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#000',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleExportPDF} style={styles.exportButton}>
              <Download size={20} color="#0099a8" />
              <Text style={styles.exportButtonText}>Relatório</Text>
            </TouchableOpacity>
          ),
        }} 
      />

      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <View style={styles.statsHeaderRow}>
          <View style={styles.statsHeaderItem}>
            <Text style={styles.statsHeaderValue}>{validatedTickets}</Text>
            <Text style={styles.statsHeaderLabel}>validados</Text>
          </View>
          <Text style={styles.statsHeaderSeparator}>/</Text>
          <View style={styles.statsHeaderItem}>
            <Text style={styles.statsHeaderValue}>{totalTickets}</Text>
            <Text style={styles.statsHeaderLabel}>bilhetes</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'buyers' && styles.activeTab]}
          onPress={() => setActiveSection('buyers')}
        >
          <Users size={20} color={activeSection === 'buyers' ? '#0099a8' : '#666'} />
          <Text style={[styles.tabText, activeSection === 'buyers' && styles.activeTabText]}>
            Compradores
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeSection === 'scanner' && styles.activeTab]}
          onPress={() => setActiveSection('scanner')}
        >
          <QrCodeIcon size={20} color={activeSection === 'scanner' ? '#0099a8' : '#666'} />
          <Text style={[styles.tabText, activeSection === 'scanner' && styles.activeTabText]}>
            Scanner
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeSection === 'stats' && styles.activeTab]}
          onPress={() => setActiveSection('stats')}
        >
          <BarChart3 size={20} color={activeSection === 'stats' ? '#0099a8' : '#666'} />
          <Text style={[styles.tabText, activeSection === 'stats' && styles.activeTabText]}>
            Estatísticas
          </Text>
        </TouchableOpacity>
      </View>

      {activeSection === 'buyers' && renderBuyersSection()}
      {activeSection === 'scanner' && renderScannerSection()}
      {activeSection === 'stats' && renderStatsSection()}
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
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    marginRight: 8,
  },
  exportButtonText: {
    fontSize: 14,
    color: '#0099a8',
    fontWeight: '600' as const,
  },
  errorText: {
    color: '#000',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#000',
    flex: 1,
  },
  statsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },
  statsHeaderItem: {
    alignItems: 'center',
  },
  statsHeaderValue: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#0099a8',
  },
  statsHeaderLabel: {
    fontSize: 11,
    color: '#666',
  },
  statsHeaderSeparator: {
    fontSize: 18,
    color: '#999',
    marginHorizontal: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0099a8',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600' as const,
  },
  activeTabText: {
    color: '#0099a8',
  },
  sectionContent: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#000',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
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
    color: '#666',
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginTop: 0,
    marginBottom: 16,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
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
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: '#0099a8',
    borderColor: '#0099a8',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: 'bold' as const,
  },
  buyersList: {
    flex: 1,
  },
  resultsCount: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  buyerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
    color: '#000',
    marginBottom: 4,
  },
  buyerEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  buyerPhone: {
    fontSize: 14,
    color: '#666',
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
    color: '#000',
  },
  purchaseInfo: {
    marginBottom: 12,
  },
  purchaseDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  validatedDate: {
    fontSize: 12,
    color: '#28A745',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0099a810',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#0099a8',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#0099a8',
    fontWeight: 'bold' as const,
  },

  scannerPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  scannerTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#000',
    marginTop: 20,
    marginBottom: 8,
  },
  scannerDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  openScannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0099a8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  openScannerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  validationStats: {
    paddingHorizontal: 20,
  },
  validationStatsTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#000',
    marginBottom: 16,
  },
  validationStatsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  validationStatCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  validationStatValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#000',
    marginVertical: 8,
  },
  validationStatLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statsGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  largeStatCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: '48%',
  },
  largeStatValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#000',
    marginVertical: 4,
  },
  largeStatLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  subStatText: {
    fontSize: 12,
    color: '#999',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  trendText: {
    fontSize: 12,
    color: '#00C851',
    fontWeight: '600' as const,
  },
  chartSection: {
    padding: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#000',
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 13,
    color: '#666',
  },
  chartContent: {
    paddingVertical: 8,
  },
  chartBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 20,
    paddingHorizontal: 8,
  },
  barGroup: {
    alignItems: 'center',
    gap: 8,
  },
  barsWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 200,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barValueContainer: {
    marginBottom: 4,
  },
  barValue: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#666',
  },
  bar: {
    width: 28,
    borderRadius: 4,
    minHeight: 8,
  },
  ticketsBar: {
    backgroundColor: '#0099a8',
  },
  revenueBar: {
    backgroundColor: '#00C851',
  },
  barLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  conversionCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  conversionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  conversionLabel: {
    fontSize: 16,
    color: '#666',
  },
  conversionValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600' as const,
  },
  conversionDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  conversionLabelBold: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold' as const,
  },
  conversionValueBold: {
    fontSize: 16,
    color: '#0099a8',
    fontWeight: 'bold' as const,
  },
  pendingBuyersList: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pendingBuyersHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backToPendingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  backToPendingButtonText: {
    fontSize: 16,
    color: '#0099a8',
    fontWeight: '600' as const,
  },
  pendingBuyersTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#000',
  },
  pendingBuyersContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#000',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Linking,
  Share,
  TextInput,
  Modal,
  Platform
} from 'react-native';
import {
  ArrowLeft,
  Share2,
  Sparkles,
  FileText,
  Download,
  BookmarkCheck,
  XCircle,
  Flag,
  ChevronRight,
  Send,
  Mail,
  X as CloseIcon,
  RefreshCcw,
  Wallet
} from 'lucide-react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/hooks/theme-context';
import QRCode from '@/components/QRCode';

const { width } = Dimensions.get('window');
const QR_SIZE = width * 0.7;

interface Ticket {
  id: string;
  buyerName: string;
  ticketNumber: number;
  totalTickets: number;
  ticketType: string;
  qrCode: string;
}

const mockTickets: Ticket[] = [
  {
    id: '1',
    buyerName: 'Fábio Caires',
    ticketNumber: 1,
    totalTickets: 2,
    ticketType: 'General Admission',
    qrCode: 'TICKET-001-ABC123'
  },
  {
    id: '2',
    buyerName: 'Fábio Caires',
    ticketNumber: 2,
    totalTickets: 2,
    ticketType: 'General Admission',
    qrCode: 'TICKET-002-ABC124'
  }
];

export default function TicketDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [transferEmail, setTransferEmail] = useState('');
  const [refundModalVisible, setRefundModalVisible] = useState(false);

  const demoEvent = {
    id: 't1',
    title: 'The Purple Fridays',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    date: new Date('2025-10-31T19:00:00'),
    endDate: new Date('2025-10-31T23:00:00'),
    venue: {
      id: 'v1',
      name: 'Estalagem Da Ponta Do Sol',
      address: 'Rua da Ponta do Sol',
      city: 'Ponta do Sol',
      capacity: 500
    },
    promoter: {
      id: 'p1',
      name: 'Live Nation Portugal',
      image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400',
      description: 'Promotora líder mundial em entretenimento ao vivo',
      verified: true,
      followersCount: 125000
    },
    coordinates: {
      latitude: 32.6871,
      longitude: -17.1024
    }
  };
  
  const event = demoEvent;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-PT', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  const handleShare = async () => {
    try {
      const message = `🎫 ${event.title}\n📅 ${formatDate(event.date)} às ${formatTime(event.date)}\n📍 ${event.venue.name}\n\nCompra os teus bilhetes na Lyven!`;
      
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: event.title,
            text: message,
          });
        } else {
          await navigator.clipboard.writeText(message);
          Alert.alert('Copiado', 'Link copiado para a área de transferência');
        }
      } else {
        await Share.share({
          message,
          title: event.title,
        });
      }
    } catch (error) {
      console.error('Erro ao partilhar:', error);
    }
  };

  const handleAddToWallet = async () => {
    Alert.alert(
      'Apple Wallet',
      'Esta funcionalidade estará disponível em breve. Poderá adicionar o seu bilhete à Apple Wallet ou Google Pay.',
      [{ text: 'OK' }]
    );
  };

  const handleAddToCalendar = async () => {
    if (Platform.OS === 'web') {
      const start = event.date.toISOString().replace(/-|:|\.\d+/g, '');
      const end = event.endDate ? event.endDate.toISOString().replace(/-|:|\.\d+/g, '') : '';
      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.venue.name)}&location=${encodeURIComponent(event.venue.address)}`;
      Linking.openURL(calendarUrl);
    } else {
      Alert.alert('Sucesso', 'Evento adicionado ao calendário');
    }
  };

  const handleViewMap = () => {
    if (event.coordinates) {
      const url = `https://maps.google.com/?q=${event.coordinates.latitude},${event.coordinates.longitude}`;
      Linking.openURL(url);
    }
  };

  const handleEventDetails = () => {
    router.push(`/event/${event.id}`);
  };

  const handleOrderDetails = () => {
    Alert.alert(
      'Detalhes do Pedido',
      `ID do Pedido: ${id}\n` +
      `Data de Compra: ${new Date().toLocaleDateString('pt-PT')}\n` +
      `Total de Bilhetes: ${mockTickets.length}\n` +
      `Valor Total: €${(mockTickets.length * 25).toFixed(2)}\n` +
      `Método de Pagamento: Multibanco\n` +
      `Estado: Confirmado`,
      [{ text: 'OK' }]
    );
  };

  const handleDownloadTicket = async () => {
    Alert.alert(
      'Baixar Ingresso',
      'O PDF do seu bilhete será enviado para o email registado.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: () => {
            setTimeout(() => {
              Alert.alert('Sucesso', 'Bilhete enviado para o seu email!');
            }, 1000);
          }
        }
      ]
    );
  };

  const handleTicketInfo = () => {
    Alert.alert(
      'Informações do Ingresso',
      `📋 Tipo: ${mockTickets[0].ticketType}\n` +
      `🎫 Quantidade: ${mockTickets.length}\n` +
      `✅ Estado: Válido\n` +
      `🔒 Código QR: Único e intransferível\n\n` +
      `⚠️ Importante:\n` +
      `• Apresente o código QR na entrada\n` +
      `• Não partilhe o código com terceiros\n` +
      `• O bilhete só pode ser usado uma vez\n` +
      `• Em caso de dúvidas, contacte o suporte`,
      [{ text: 'Entendi' }]
    );
  };

  const handleCancelOrder = () => {
    setRefundModalVisible(true);
  };

  const handleReportEvent = () => {
    Alert.alert(
      'Reportar Evento',
      'Selecione o motivo:',
      [
        { text: 'Evento cancelado', onPress: () => submitReport('Evento cancelado') },
        { text: 'Informações incorretas', onPress: () => submitReport('Informações incorretas') },
        { text: 'Conteúdo inapropriado', onPress: () => submitReport('Conteúdo inapropriado') },
        { text: 'Outro motivo', onPress: () => submitReport('Outro motivo') },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const submitReport = (reason: string) => {
    console.log('Reportando evento:', reason);
    Alert.alert('Obrigado', 'O seu report foi enviado. Iremos analisar o caso.');
  };

  const handleTransferTicket = () => {
    setTransferModalVisible(true);
  };

  const confirmTransfer = () => {
    if (!transferEmail.trim()) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return;
    }
    
    Alert.alert(
      'Confirmar Transferência',
      `Deseja transferir ${mockTickets.length} bilhete(s) para ${transferEmail}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Transferir',
          onPress: () => {
            console.log('Transferindo bilhetes para:', transferEmail);
            setTransferModalVisible(false);
            setTransferEmail('');
            Alert.alert('Sucesso', 'Bilhetes transferidos com sucesso!');
          }
        }
      ]
    );
  };

  const handleRequestRefund = () => {
    Alert.alert(
      'Pedido de Reembolso',
      'O seu pedido de reembolso foi submetido. Receberá uma resposta em até 5 dias úteis.',
      [
        {
          text: 'OK',
          onPress: () => {
            setRefundModalVisible(false);
            console.log('Pedido de reembolso submetido');
          }
        }
      ]
    );
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false
        }} 
      />
      
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <Share2 size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.eventInfo, { backgroundColor: colors.card }]}>
            <Image source={{ uri: event.image }} style={styles.eventImage} />
            <View style={styles.eventTitleContainer}>
              <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
              <Text style={[styles.eventDateTime, { color: colors.textSecondary }]}>
                {formatDate(event.date)} · {formatTime(event.date)}
              </Text>
            </View>
          </View>

          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.ticketCarousel}
          >
            {mockTickets.map((ticket) => (
              <View key={ticket.id} style={[styles.ticketCard, { width }]}>
                <View style={styles.qrContainer}>
                  <QRCode 
                    value={ticket.qrCode} 
                    size={QR_SIZE} 
                    backgroundColor={isDark ? '#1E1E1E' : '#FFFFFF'}
                    ticketType={ticket.ticketType}
                    enableGradient={true}
                  />
                </View>
                <Text style={[styles.ticketOwner, { color: colors.text }]}>
                  {ticket.buyerName} · Bilhete {ticket.ticketNumber} do {ticket.totalTickets}
                </Text>
                <Text style={[styles.ticketType, { color: colors.textSecondary }]}>
                  {ticket.ticketType}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.dotsContainer}>
            {mockTickets.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: index === currentIndex ? colors.text : colors.border,
                    opacity: index === currentIndex ? 1 : 0.3
                  }
                ]}
              />
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.walletButton, { backgroundColor: '#000000' }]}
            onPress={handleAddToWallet}
          >
            <Wallet size={20} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.walletButtonText}>
              Adicionar à Apple Wallet
            </Text>
          </TouchableOpacity>

          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Data e horário</Text>
            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeItem}>
                <Text style={[styles.dateTimeLabel, { color: colors.textSecondary }]}>
                  {formatDate(event.date)}
                </Text>
                <Text style={[styles.dateTimeValue, { color: colors.text }]}>
                  {formatTime(event.date)}
                </Text>
              </View>
              <View style={styles.dateTimeItem}>
                <Text style={[styles.dateTimeLabel, { color: colors.textSecondary }]}>
                  {formatDate(event.date)}
                </Text>
                <Text style={[styles.dateTimeValue, { color: colors.text }]}>
                  {event.endDate ? formatTime(event.endDate) : '23:00'}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.linkButton}
              onPress={handleAddToCalendar}
            >
              <Text style={[styles.linkButtonText, { color: colors.text }]}>
                Adicionar ao calendário
              </Text>
            </TouchableOpacity>

            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
              Localização
            </Text>
            <Text style={[styles.locationText, { color: colors.text }]}>
              {event.venue.name}
            </Text>
            
            <TouchableOpacity 
              style={styles.linkButton}
              onPress={handleViewMap}
            >
              <Text style={[styles.linkButtonText, { color: colors.text }]}>
                Visualizar mapa
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.menuSection, { backgroundColor: colors.card }]}>
            <MenuItem
              icon={<Sparkles size={24} color={colors.text} />}
              label="Detalhes do evento"
              onPress={handleEventDetails}
              colors={colors}
            />
            <MenuItem
              icon={<FileText size={24} color={colors.text} />}
              label="Detalhes do pedido"
              onPress={handleOrderDetails}
              colors={colors}
            />
            <MenuItem
              icon={<Download size={24} color={colors.text} />}
              label="Baixar ingresso (PDF)"
              onPress={handleDownloadTicket}
              colors={colors}
            />
            <MenuItem
              icon={<Send size={24} color={colors.text} />}
              label="Transferir bilhete"
              onPress={handleTransferTicket}
              colors={colors}
            />
            <MenuItem
              icon={<BookmarkCheck size={24} color={colors.text} />}
              label="Informações dos ingressos"
              onPress={handleTicketInfo}
              colors={colors}
            />
            <MenuItem
              icon={<XCircle size={24} color={colors.text} />}
              label="Cancelar e reembolsar"
              onPress={handleCancelOrder}
              colors={colors}
            />
            <MenuItem
              icon={<Flag size={24} color={colors.text} />}
              label="Reportar evento"
              onPress={handleReportEvent}
              colors={colors}
              isLast
            />
          </View>

          <View style={[styles.organizerSection, { backgroundColor: colors.card }]}>
            <Text style={[styles.organizerTitle, { color: colors.text }]}>
              Organizado por
            </Text>
            <TouchableOpacity 
              style={[styles.organizerCard, { backgroundColor: colors.background }]}
              onPress={() => router.push(`/promoter/${event.promoter.id}` as any)}
              activeOpacity={0.8}
            >
              <Image 
                source={{ uri: event.promoter.image }} 
                style={styles.organizerImage}
              />
              <View style={styles.organizerInfo}>
                <Text style={[styles.organizerName, { color: colors.text }]}>
                  {event.promoter.name}
                </Text>
                <View style={styles.organizerStats}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Seguidores
                    </Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {(event.promoter.followersCount / 1000).toFixed(1)}k
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Eventos
                    </Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>321</Text>
                  </View>
                </View>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} style={styles.organizerChevron} />
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        <Modal
          visible={transferModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setTransferModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Transferir Bilhete
                </Text>
                <TouchableOpacity onPress={() => setTransferModalVisible(false)}>
                  <CloseIcon size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
                Insira o email do destinatário para transferir os bilhetes.
              </Text>

              <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Mail size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="email@exemplo.com"
                  placeholderTextColor={colors.textSecondary}
                  value={transferEmail}
                  onChangeText={setTransferEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.border }]}
                  onPress={() => setTransferModalVisible(false)}
                >
                  <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={confirmTransfer}
                >
                  <Text style={[styles.modalButtonText, { color: colors.white }]}>Transferir</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={refundModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setRefundModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Cancelar e Reembolsar
                </Text>
                <TouchableOpacity onPress={() => setRefundModalVisible(false)}>
                  <CloseIcon size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={[styles.refundInfoBox, { backgroundColor: colors.background }]}>
                <RefreshCcw size={24} color={colors.primary} />
                <View style={styles.refundTextContainer}>
                  <Text style={[styles.refundTitle, { color: colors.text }]}>Política de Reembolso</Text>
                  <Text style={[styles.refundDescription, { color: colors.textSecondary }]}>
                    • Reembolso total: até 7 dias antes do evento{`\n`}
                    • 50% de reembolso: 3-7 dias antes{`\n`}
                    • Sem reembolso: menos de 3 dias{`\n`}
                    • Processamento: 5-10 dias úteis
                  </Text>
                </View>
              </View>

              <Text style={[styles.refundWarning, { color: colors.error }]}>
                ⚠️ Esta ação é irreversível. Tem a certeza que deseja cancelar?
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.border }]}
                  onPress={() => setRefundModalVisible(false)}
                >
                  <Text style={[styles.modalButtonText, { color: colors.text }]}>Manter Bilhete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.error }]}
                  onPress={handleRequestRefund}
                >
                  <Text style={[styles.modalButtonText, { color: colors.white }]}>Confirmar Cancelamento</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  colors: any;
  isLast?: boolean;
}

function MenuItem({ icon, label, onPress, colors, isLast }: MenuItemProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.menuItem,
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }
      ]}
      onPress={onPress}
    >
      <View style={styles.menuItemIcon}>{icon}</View>
      <Text style={[styles.menuItemText, { color: colors.text }]}>{label}</Text>
      <ChevronRight size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 24,
    borderRadius: 12,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  eventTitleContainer: {
    flex: 1,
    gap: 6,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
  },
  eventDateTime: {
    fontSize: 14,
  },
  ticketCarousel: {
    marginBottom: 16,
  },
  ticketCard: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  qrContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketOwner: {
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center',
    marginBottom: 4,
  },
  ticketType: {
    fontSize: 14,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 24,
    gap: 10,
  },
  walletButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 16,
  },
  dateTimeItem: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  dateTimeValue: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  linkButton: {
    paddingVertical: 8,
  },
  linkButtonText: {
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  locationText: {
    fontSize: 15,
    marginBottom: 12,
  },
  menuSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  menuItemIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 16,
    flex: 1,
  },
  organizerSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
  },
  organizerTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 16,
  },
  organizerCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 16,
    alignItems: 'center',
  },
  organizerChevron: {
    marginLeft: 'auto',
  },
  organizerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 12,
  },
  organizerStats: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  refundInfoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
  },
  refundTextContainer: {
    flex: 1,
  },
  refundTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  refundDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  refundWarning: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500' as const,
  },
});

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  PanResponder,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Check, 
  X, 
  Calendar,
  MapPin,
  DollarSign,
  User,
  ChevronRight,
  Users,
  Ticket,
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
} from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { useUser } from '@/hooks/user-context';
import { useTheme } from '@/hooks/theme-context';
import { useCart } from '@/hooks/cart-context';
import AuthGuard from '@/components/AuthGuard';
import CreateEvent from '@/app/create-event';
import { router, useLocalSearchParams } from 'expo-router';
import QRCode from '@/components/QRCode';
import { trpc } from '@/lib/trpc';
import { handleError, isRetryableError } from '@/lib/error-handler';
import { LoadingSpinner, ErrorState } from '@/components/LoadingStates';
import { RefreshControl } from 'react-native';

interface PendingAd {
  id: string;
  promoterId: string;
  promoterName: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  adType: 'banner' | 'featured' | 'spotlight';
  price: number;
  duration: number;
  imageUrl: string;
  description: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

function TicketsContent() {
  const { user } = useUser();

  if (user?.email === 'admin@lyven.com') {
    return <AdminApprovalsContent />;
  }

  if (user?.userType === 'promoter') {
    return <CreateEvent />;
  }

  return <NormalUserTicketsContent />;
}

interface UserTicket {
  id: string;
  eventId: string;
  eventTitle: string;
  eventImage: string;
  eventDate: string;
  venue: string;
  city: string;
  ticketType: string;
  quantity: number;
  totalPrice: number;
  purchaseDate: string;
  qrCode: string;
  isUsed: boolean;
  friendsGoing?: number;
}

const SWIPE_THRESHOLD = 50;

function NormalUserTicketsContent() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const { user } = useUser();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past' | 'cart'>('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;

  const tabs: ('upcoming' | 'past' | 'cart')[] = ['upcoming', 'past', 'cart'];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dy) < 20;
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dy) < 20;
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentIndex = tabs.indexOf(selectedTab);
        
        if (gestureState.dx < -SWIPE_THRESHOLD && currentIndex < tabs.length - 1) {
          setSelectedTab(tabs[currentIndex + 1]);
        } else if (gestureState.dx > SWIPE_THRESHOLD && currentIndex > 0) {
          setSelectedTab(tabs[currentIndex - 1]);
        }
        
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }).start();
      },
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  useEffect(() => {
    if (tab === 'cart') {
      setSelectedTab('cart');
    }
  }, [tab]);

  const [selectedQRTicket, setSelectedQRTicket] = useState<string | null>(null);

  // Fetch tickets for current user
  const {
    data: ticketsData,
    isLoading: isLoadingTickets,
    error: ticketsError,
    refetch: refetchTickets,
  } = trpc.tickets.list.useQuery(
    { userId: user?.id ?? '' },
    { enabled: !!user?.id }
  );

  // Fetch all events to enrich tickets with event details
  const {
    data: eventsData,
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch: refetchEvents,
  } = trpc.events.list.useQuery(
    {},
    { enabled: !!user?.id }
  );

  const eventsById = useMemo(() => {
    const map = new Map<string, any>();
    eventsData?.forEach((e: any) => map.set(e.id, e));
    return map;
  }, [eventsData]);

  const userTickets: UserTicket[] = useMemo(() => {
    if (!ticketsData || eventsById.size === 0) return [];

    return ticketsData.map((t: any) => {
      const ev = eventsById.get(t.eventId);

      const ticketType = ev?.ticketTypes?.find((tt: any) => tt.id === t.ticketTypeId);
      const price = t.price ?? ticketType?.price ?? 0;

      return {
        id: t.id,
        eventId: t.eventId,
        eventTitle: ev?.title ?? 'Evento',
        eventImage: ev?.image ?? 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
        eventDate: (ev?.date ?? t.purchaseDate).toString(),
        venue: ev?.venue?.name ?? '',
        city: ev?.venue?.city ?? '',
        ticketType: ticketType?.name ?? '',
        quantity: t.quantity,
        totalPrice: price * t.quantity,
        purchaseDate: t.purchaseDate?.toString?.() ?? new Date().toISOString(),
        qrCode: t.qrCode,
        isUsed: !!t.isUsed,
        friendsGoing: undefined,
      };
    });
  }, [ticketsData, eventsById]);

  const isLoading = isLoadingTickets || isLoadingEvents;
  const error = ticketsError || eventsError;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchTickets(), refetchEvents()]);
    } catch (err) {
      console.error('Error refreshing tickets:', err);
    } finally {
      setRefreshing(false);
    }
  }, [refetchTickets, refetchEvents]);

  const now = new Date();
  const upcomingTickets = userTickets.filter(t => new Date(t.eventDate) >= now && !t.isUsed);
  const pastTickets = userTickets.filter(t => new Date(t.eventDate) < now || t.isUsed);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }).toLowerCase();
  };

  const UpcomingTicketCard = ({ ticket }: { ticket: UserTicket }) => (
    <TouchableOpacity
      style={[styles.upcomingCard, { backgroundColor: colors.background }]}
      onPress={() => router.push(`/ticket-details/${ticket.id}` as any)}
      activeOpacity={0.8}
    >
      <View style={styles.upcomingCardHeader}>
        <Text style={[styles.upcomingTitle, { color: colors.text }]}>{ticket.eventTitle}</Text>
        <TouchableOpacity 
          style={styles.qrContainer}
          onPress={() => setSelectedQRTicket(selectedQRTicket === ticket.id ? null : ticket.id)}
        >
          <Text style={[styles.qrCount, { color: colors.text }]}>{ticket.quantity}</Text>
          <Ticket size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.dateTimeContainer}>
        <Text style={[styles.dateMonth, { color: colors.textSecondary }]}>{formatDate(ticket.eventDate)}</Text>
        <Text style={[styles.dateTime, { color: colors.textSecondary }]}> · {formatTime(ticket.eventDate)}</Text>
      </View>

      <Text style={[styles.upcomingVenue, { color: colors.textSecondary }]}>
        {ticket.venue} · {ticket.city}
      </Text>

      <Image source={{ uri: ticket.eventImage }} style={styles.upcomingImage} />

      {ticket.friendsGoing && ticket.friendsGoing > 0 && (
        <TouchableOpacity style={styles.friendsContainer}>
          <View style={styles.friendsAvatars}>
            <View style={[styles.friendAvatar, { backgroundColor: colors.border }]}>
              <User size={12} color={colors.textSecondary} />
            </View>
            <View style={[styles.friendAvatar, { backgroundColor: colors.border, marginLeft: -8 }]}>
              <User size={12} color={colors.textSecondary} />
            </View>
            {ticket.friendsGoing > 2 && (
              <View style={[styles.friendAvatar, { backgroundColor: colors.border, marginLeft: -8 }]}>
                <User size={12} color={colors.textSecondary} />
              </View>
            )}
          </View>
          <Text style={[styles.friendsText, { color: colors.text }]}>
            Confira se os seus amigos estão indo também
          </Text>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      )}

      {selectedQRTicket === ticket.id && (
        <View style={[styles.qrCodeContainer, { backgroundColor: colors.card }]}>
          <QRCode value={ticket.qrCode} size={200} />
          <Text style={[styles.qrCodeText, { color: colors.textSecondary }]}>{ticket.qrCode}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const ComingTicketCard = ({ ticket }: { ticket: UserTicket }) => (
    <TouchableOpacity
      style={[styles.comingCard, { backgroundColor: colors.background }]}
      onPress={() => router.push(`/ticket-details/${ticket.id}` as any)}
    >
      <View style={styles.comingCardHeader}>
        <Text style={[styles.comingTitle, { color: colors.text }]} numberOfLines={1}>
          {ticket.eventTitle}
        </Text>
        <View style={styles.comingQrContainer}>
          <Text style={[styles.comingQrCount, { color: colors.text }]}>{ticket.quantity}</Text>
          <Ticket size={20} color={colors.text} />
        </View>
      </View>

      <View style={styles.comingDateContainer}>
        <Text style={[styles.comingMonth, { color: colors.textSecondary }]}>{formatDate(ticket.eventDate)}</Text>
        <Text style={[styles.comingTime, { color: colors.textSecondary }]}> · {formatTime(ticket.eventDate)}</Text>
      </View>

      <View style={styles.comingContent}>
        <View style={[styles.comingThumbnail, { backgroundColor: colors.primary }]}>
          <Image source={{ uri: ticket.eventImage }} style={styles.comingThumbnailImage} />
        </View>
        <View style={styles.comingInfo}>
          <Text style={[styles.comingVenue, { color: colors.textSecondary }]} numberOfLines={1}>
            {ticket.venue} · {ticket.city}
          </Text>
        </View>
      </View>

      {ticket.friendsGoing && ticket.friendsGoing > 0 && (
        <View style={styles.comingFriends}>
          <View style={[styles.comingFriendIcon, { backgroundColor: colors.card }]}>
            <Users size={12} color={colors.textSecondary} />
          </View>
          <Text style={[styles.comingFriendsText, { color: colors.textSecondary }]}>
            {ticket.friendsGoing} {ticket.friendsGoing === 1 ? 'amigo indo' : 'amigos indo'}
          </Text>
        </View>
      )}

      {selectedQRTicket === ticket.id && (
        <View style={[styles.qrCodeContainer, { backgroundColor: colors.card }]}>
          <QRCode value={ticket.qrCode} size={200} />
          <Text style={[styles.qrCodeText, { color: colors.textSecondary }]}>{ticket.qrCode}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const PastTicketCard = ({ ticket }: { ticket: UserTicket }) => (
    <TouchableOpacity
      style={[styles.pastCard, { backgroundColor: colors.background }]}
      onPress={() => router.push(`/ticket-details/${ticket.id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.pastHeader}>
        <Text style={[styles.pastTitle, { color: colors.text }]} numberOfLines={2}>
          {ticket.eventTitle}
        </Text>
        <View style={styles.pastQrContainer}>
          <Text style={[styles.pastQrCount, { color: colors.text }]}>{ticket.quantity}</Text>
          <Ticket size={20} color={colors.text} />
        </View>
      </View>

      <View style={styles.pastDateContainer}>
        <Text style={[styles.pastMonth, { color: colors.textSecondary }]}>{formatDate(ticket.eventDate)}</Text>
        <Text style={[styles.pastTime, { color: colors.textSecondary }]}> · {formatTime(ticket.eventDate)}</Text>
      </View>

      <View style={styles.pastContent}>
        <View style={[styles.pastThumbnail, { backgroundColor: colors.primary }]}>
          <Image source={{ uri: ticket.eventImage }} style={styles.pastThumbnailImage} />
        </View>
        <View style={styles.pastInfo}>
          <Text style={[styles.pastVenue, { color: colors.textSecondary }]} numberOfLines={1}>
            {ticket.venue} · {ticket.city}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const comingTickets = upcomingTickets.slice(1);

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <LoadingSpinner message="A carregar bilhetes..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <ErrorState
          message={handleError(error)}
          onRetry={isRetryableError(error) ? () => {
            refetchTickets();
            refetchEvents();
          } : undefined}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Ingressos</Text>
      </View>

      <View style={[styles.tabContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'upcoming' && [styles.tabActive, { borderBottomColor: colors.primary }]
          ]}
          onPress={() => setSelectedTab('upcoming')}
        >
          <Text style={[
            styles.tabText,
            { color: selectedTab === 'upcoming' ? colors.text : colors.textSecondary }
          ]}>
            Próximos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'past' && [styles.tabActive, { borderBottomColor: colors.primary }]
          ]}
          onPress={() => setSelectedTab('past')}
        >
          <Text style={[
            styles.tabText,
            { color: selectedTab === 'past' ? colors.text : colors.textSecondary }
          ]}>
            Passado
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'cart' && [styles.tabActive, { borderBottomColor: colors.primary }]
          ]}
          onPress={() => setSelectedTab('cart')}
        >
          <View style={styles.cartTabContent}>
            <Text style={[
              styles.tabText,
              { color: selectedTab === 'cart' ? colors.text : colors.textSecondary }
            ]}>
              Carrinho
            </Text>
            {getTotalItems() > 0 && (
              <View style={[styles.cartBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <Animated.View 
        style={[styles.swipeContainer, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
        <View style={styles.content}>
          {selectedTab === 'upcoming' ? (
            <>
              {upcomingTickets.length > 0 && <UpcomingTicketCard ticket={upcomingTickets[0]} />}
              
              {comingTickets.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Chegando</Text>
                  {comingTickets.map(ticket => (
                    <ComingTicketCard key={ticket.id} ticket={ticket} />
                  ))}
                </>
              )}

              {upcomingTickets.length === 0 && (
                <View style={styles.emptyState}>
                  <Calendar size={64} color={colors.textSecondary} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum ingresso próximo</Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                    Explore eventos e compre seus ingressos
                  </Text>
                  <TouchableOpacity
                    style={[styles.exploreButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.push('/(tabs)')}
                  >
                    <Text style={styles.exploreButtonText}>Explorar Eventos</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : selectedTab === 'past' ? (
            <>
              {pastTickets.length > 0 ? (
                pastTickets.map(ticket => (
                  <PastTicketCard key={ticket.id} ticket={ticket} />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Calendar size={64} color={colors.textSecondary} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum ingresso passado</Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                    Seus ingressos usados aparecerão aqui
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              {cartItems.length > 0 ? (
                <>
                  {cartItems.map(item => (
                    <View key={`${item.eventId}-${item.ticketTypeId}`} style={[styles.cartItemCard, { backgroundColor: colors.card }]}>
                      <Image source={{ uri: item.eventImage || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800' }} style={styles.cartItemImage} />
                      <View style={styles.cartItemInfo}>
                        <Text style={[styles.cartItemTitle, { color: colors.text }]} numberOfLines={2}>
                          {item.eventTitle}
                        </Text>
                        <Text style={[styles.cartItemType, { color: colors.textSecondary }]}>
                          {item.ticketTypeName}
                        </Text>
                        <Text style={[styles.cartItemPrice, { color: colors.primary }]}>
                          €{(item.price * item.quantity).toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.cartItemActions}>
                        <View style={styles.quantityControls}>
                          <TouchableOpacity
                            style={[styles.quantityButton, { backgroundColor: colors.border }]}
                            onPress={() => updateQuantity(item.eventId, item.ticketTypeId, item.quantity - 1)}
                          >
                            <Minus size={16} color={colors.text} />
                          </TouchableOpacity>
                          <Text style={[styles.quantityText, { color: colors.text }]}>{item.quantity}</Text>
                          <TouchableOpacity
                            style={[styles.quantityButton, { backgroundColor: colors.border }]}
                            onPress={() => updateQuantity(item.eventId, item.ticketTypeId, item.quantity + 1)}
                          >
                            <Plus size={16} color={colors.text} />
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeFromCart(item.eventId, item.ticketTypeId)}
                        >
                          <Trash2 size={18} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  <View style={[styles.cartSummary, { backgroundColor: colors.card }]}>
                    <View style={styles.cartSummaryRow}>
                      <Text style={[styles.cartSummaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
                      <Text style={[styles.cartSummaryValue, { color: colors.text }]}>€{getTotalPrice().toFixed(2)}</Text>
                    </View>
                    <View style={styles.cartSummaryRow}>
                      <Text style={[styles.cartSummaryLabel, { color: colors.textSecondary }]}>Taxa de serviço</Text>
                      <Text style={[styles.cartSummaryValue, { color: colors.text }]}>€{(getTotalPrice() * 0.05).toFixed(2)}</Text>
                    </View>
                    <View style={[styles.cartSummaryDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.cartSummaryRow}>
                      <Text style={[styles.cartTotalLabel, { color: colors.text }]}>Total</Text>
                      <Text style={[styles.cartTotalValue, { color: colors.primary }]}>€{(getTotalPrice() * 1.05).toFixed(2)}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.push('/checkout')}
                  >
                    <ShoppingCart size={20} color="#FFFFFF" />
                    <Text style={styles.checkoutButtonText}>Finalizar Compra</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.emptyState}>
                  <ShoppingCart size={64} color={colors.textSecondary} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>Carrinho vazio</Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                    Adicione ingressos ao seu carrinho para continuar
                  </Text>
                  <TouchableOpacity
                    style={[styles.exploreButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.push('/(tabs)')}
                  >
                    <Text style={styles.exploreButtonText}>Explorar Eventos</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
      </Animated.View>
    </View>
  );
}

function AdminApprovalsContent() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [pendingAds, setPendingAds] = useState<PendingAd[]>([
    {
      id: '1',
      promoterId: 'p1',
      promoterName: 'João Silva',
      eventId: 'e1',
      eventTitle: 'Festival de Verão 2024',
      eventDate: '2024-07-15',
      eventLocation: 'Lisboa',
      adType: 'featured',
      price: 150,
      duration: 7,
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      description: 'Grande festival de música com artistas nacionais e internacionais',
      submittedAt: '2024-01-15T10:30:00Z',
      status: 'pending'
    },
  ]);

  const getAdTypeLabel = (type: string) => {
    switch (type) {
      case 'banner': return 'Banner';
      case 'featured': return 'Destaque';
      case 'spotlight': return 'Spotlight';
      default: return type;
    }
  };

  const getAdTypeColor = (type: string) => {
    switch (type) {
      case 'banner': return COLORS.info;
      case 'featured': return COLORS.warning;
      case 'spotlight': return COLORS.primary;
      default: return '#999';
    }
  };

  const handleApprove = (adId: string) => {
    Alert.alert(
      'Aprovar Publicidade',
      'Tem certeza que deseja aprovar esta publicidade?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprovar',
          style: 'default',
          onPress: () => {
            setPendingAds(prev => 
              prev.map(ad => 
                ad.id === adId ? { ...ad, status: 'approved' as const } : ad
              )
            );
            Alert.alert('Sucesso', 'Publicidade aprovada com sucesso!');
          }
        }
      ]
    );
  };

  const handleReject = (adId: string) => {
    Alert.alert(
      'Rejeitar Publicidade',
      'Tem certeza que deseja rejeitar esta publicidade?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rejeitar',
          style: 'destructive',
          onPress: () => {
            setPendingAds(prev => 
              prev.map(ad => 
                ad.id === adId ? { ...ad, status: 'rejected' as const } : ad
              )
            );
            Alert.alert('Rejeitada', 'Publicidade rejeitada.');
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const AdCard = ({ ad }: { ad: PendingAd }) => (
    <View style={[styles.adCard, { backgroundColor: colors.card }]}>
      <View style={styles.adHeader}>
        <View style={styles.adHeaderLeft}>
          <Text style={[styles.eventTitle, { color: colors.text }]}>{ad.eventTitle}</Text>
          <View style={[styles.adTypeBadge, { backgroundColor: getAdTypeColor(ad.adType) + '20' }]}>
            <Text style={[styles.adTypeText, { color: getAdTypeColor(ad.adType) }]}>
              {getAdTypeLabel(ad.adType)}
            </Text>
          </View>
        </View>
        <Text style={[styles.priceText, { color: colors.success }]}>€{ad.price}</Text>
      </View>

      <Image source={{ uri: ad.imageUrl }} style={styles.adImage} />

      <View style={styles.adDetails}>
        <View style={styles.detailRow}>
          <User size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{ad.promoterName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Calendar size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{formatDate(ad.eventDate)}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{ad.eventLocation}</Text>
        </View>
        <View style={styles.detailRow}>
          <DollarSign size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{ad.duration} dias de duração</Text>
        </View>
      </View>

      <Text style={[styles.description, { color: colors.text }]}>{ad.description}</Text>

      <View style={[styles.submissionInfo, { borderTopColor: colors.border }]}>
        <Text style={[styles.submissionText, { color: colors.textSecondary }]}>
          Submetido em {formatDate(ad.submittedAt)}
        </Text>
      </View>

      {ad.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={() => handleReject(ad.id)}
          >
            <X size={20} color={colors.white} />
            <Text style={[styles.actionButtonText, { color: colors.white }]}>Rejeitar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            onPress={() => handleApprove(ad.id)}
          >
            <Check size={20} color={colors.white} />
            <Text style={[styles.actionButtonText, { color: colors.white }]}>Aprovar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.adminContent}>
          {pendingAds.map(ad => (
            <AdCard key={ad.id} ad={ad} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default function TicketsScreen() {
  return (
    <AuthGuard>
      <TicketsContent />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  swipeContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  upcomingCard: {
    marginBottom: 30,
  },
  upcomingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateMonth: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  dateTime: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  qrContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qrCount: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  qrIcon: {
    width: 28,
    height: 28,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  qrSquare: {
    width: 12,
    height: 12,
    borderWidth: 2,
    borderRadius: 2,
  },
  upcomingTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  upcomingVenue: {
    fontSize: 14,
    marginBottom: 12,
  },
  upcomingImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
  },
  friendsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 100,
    gap: 12,
  },
  friendsAvatars: {
    flexDirection: 'row',
  },
  friendAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendsText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  qrCodeContainer: {
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  qrCodeText: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '500' as const,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginTop: 20,
    marginBottom: 16,
  },
  comingCard: {
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderRadius: 12,
    padding: 16,
  },
  comingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  comingTitleContainer: {
    flex: 1,
  },
  comingDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  comingMonth: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  comingTime: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  comingQrContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  comingQrCount: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  comingQrIcon: {
    width: 24,
    height: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  comingContent: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  comingThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  comingThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  comingInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  comingTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  comingVenue: {
    fontSize: 14,
  },
  comingFriends: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  comingFriendIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingFriendsText: {
    fontSize: 12,
  },
  pastCard: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderRadius: 12,
    padding: 16,
  },
  pastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  pastTitleContainer: {
    flex: 1,
  },
  pastDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pastMonth: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  pastTime: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  pastQrContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pastQrCount: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  pastQrIcon: {
    width: 24,
    height: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  pastContent: {
    flexDirection: 'row',
    gap: 12,
  },
  pastThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  pastThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  pastInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  pastTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  pastVenue: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  exploreButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  cartTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cartBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700' as const,
  },
  cartItemCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cartItemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  cartItemTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  cartItemType: {
    fontSize: 12,
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  cartItemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600' as const,
    minWidth: 20,
    textAlign: 'center' as const,
  },
  removeButton: {
    padding: 8,
  },
  cartSummary: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  cartSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cartSummaryLabel: {
    fontSize: 14,
  },
  cartSummaryValue: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  cartSummaryDivider: {
    height: 1,
    marginVertical: 12,
  },
  cartTotalLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  cartTotalValue: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  adminContent: {
    padding: 20,
  },
  adCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  adHeaderLeft: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 5,
  },
  adTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  adTypeText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold' as const,
  },
  adImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  adDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  submissionInfo: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginBottom: 15,
  },
  submissionText: {
    fontSize: 12,
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
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
});

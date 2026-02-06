import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  Users, 
  Search as SearchIcon, 
  Filter,
  UserCheck,
  UserX,
  Crown,
  Calendar,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  Edit3,
  Trash2,
  Eye,
  Clock,
  DollarSign,
  Plus
} from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { useTheme } from '@/hooks/theme-context';
import { useUser } from '@/hooks/user-context';
import AuthGuard from '@/components/AuthGuard';
import { Event } from '@/types/event';
import { trpcClient } from '@/lib/trpc';
import { trpc } from '@/lib/trpc';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';
import { handleError, isRetryableError } from '@/lib/error-handler';
import { LoadingSpinner, ErrorState, EventListSkeleton } from '@/components/LoadingStates';
import { RefreshControl } from 'react-native';

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

function SearchContent() {
  const { user } = useUser();

  if (user?.email === 'admin@lyven.com') {
    return <AdminUsersContent />;
  }

  if (user?.userType === 'promoter') {
    return <PromoterEventsContent />;
  }

  return <NormalUserSearchContent />;
}

function NormalUserSearchContent() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch events list (for category filtering when no search)
  const { 
    data: allEventsData, 
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch: refetchEvents 
  } = trpc.events.list.useQuery(
    { category: selectedCategory === 'all' ? undefined : selectedCategory as any },
    { enabled: debouncedSearchQuery.length === 0 }
  );

  // Search events with debounced query
  const { 
    data: searchResults, 
    isLoading: isSearching,
    error: searchError,
    refetch: refetchSearch 
  } = trpc.events.search.useQuery(
    {
      query: debouncedSearchQuery,
      category: selectedCategory === 'all' ? undefined : selectedCategory as any,
      limit: 50,
    },
    { 
      enabled: debouncedSearchQuery.length > 0,
      retry: 2,
    }
  );

  // Search suggestions with debounced query
  const { 
    data: suggestions 
  } = trpc.events.searchSuggestions.useQuery(
    { query: debouncedSearchQuery },
    { 
      enabled: debouncedSearchQuery.length >= 2,
    }
  );

  const categories = [
    { id: 'all', label: 'Todos', icon: '🎉' },
    { id: 'music', label: 'Música', icon: '🎵' },
    { id: 'festival', label: 'Festivais', icon: '🎪' },
    { id: 'theater', label: 'Teatro', icon: '🎭' },
    { id: 'comedy', label: 'Comédia', icon: '😂' },
    { id: 'dance', label: 'Dança', icon: '💃' },
  ];

  // Transform search results or use all events
  const filteredEvents: Event[] = React.useMemo(() => {
    if (debouncedSearchQuery.length > 0 && searchResults) {
      return searchResults.map((result: any) => ({
        ...result,
        date: new Date(result.date),
        endDate: result.endDate ? new Date(result.endDate) : undefined,
        venue: result.venue || {
          id: result.venueId || 'unknown',
          name: result.venueName || '',
          address: result.venueAddress || '',
          city: result.venueCity || '',
          capacity: result.venueCapacity || 0
        },
        promoter: result.promoter || {
          id: result.promoterId || 'unknown',
          name: result.promoterName || 'Unknown',
          verified: false,
          followersCount: 0,
          image: '',
          description: ''
        },
        ticketTypes: result.ticketTypes || [],
        artists: result.artists || [],
        isSoldOut: result.isSoldOut || false,
      })) as Event[];
    } else if (allEventsData) {
      return allEventsData.map((e: any) => ({
        ...e,
        date: new Date(e.date),
        endDate: e.endDate ? new Date(e.endDate) : undefined,
      })) as Event[];
    }
    return [];
  }, [debouncedSearchQuery, searchResults, allEventsData]);

  const isLoading = isSearching || isLoadingEvents;
  const error = searchError || eventsError;

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      if (debouncedSearchQuery.length > 0) {
        await refetchSearch();
      } else {
        await refetchEvents();
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [debouncedSearchQuery, refetchSearch, refetchEvents]);

  const featuredEvents = filteredEvents.filter(e => e.isFeatured);
  const regularEvents = filteredEvents.filter(e => !e.isFeatured);

  const FeaturedEventCard = ({ event }: { event: Event }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => router.push(`/event/${event.id}` as any)}
    >
      <Image source={{ uri: event.image }} style={styles.featuredCardImage} />
      <View style={styles.featuredCardOverlay}>
        <View style={styles.featuredCardContent}>
          <View style={[styles.featuredBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.featuredBadgeText}>Em Destaque</Text>
          </View>
          <Text style={styles.featuredCardTitle} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.featuredCardInfo}>
            <View style={styles.featuredInfoItem}>
              <Calendar size={16} color="#fff" />
              <Text style={styles.featuredInfoText}>
                {new Date(event.date).toLocaleDateString('pt-PT', {
                  day: 'numeric',
                  month: 'short',
                })}
              </Text>
            </View>
            <View style={styles.featuredInfoItem}>
              <MapPin size={16} color="#fff" />
              <Text style={styles.featuredInfoText} numberOfLines={1}>
                {event.venue.city}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const EventCard = ({ event }: { event: Event }) => (
    <TouchableOpacity
      style={[styles.eventCard2, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/event/${event.id}` as any)}
    >
      <Image source={{ uri: event.image }} style={styles.eventCardImage} />
      <View style={styles.eventCardContent}>
        <Text style={[styles.eventCardTitle, { color: colors.text }]} numberOfLines={2}>
          {event.title}
        </Text>
        <View style={styles.eventCardInfo}>
          <Calendar size={14} color={colors.textSecondary} />
          <Text style={[styles.eventCardText, { color: colors.textSecondary }]}>
            {new Date(event.date).toLocaleDateString('pt-PT', {
              day: 'numeric',
              month: 'short',
            })}
          </Text>
        </View>
        <View style={styles.eventCardInfo}>
          <MapPin size={14} color={colors.textSecondary} />
          <Text style={[styles.eventCardText, { color: colors.textSecondary }]} numberOfLines={1}>
            {event.venue?.city || ''}
          </Text>
        </View>
        {event.ticketTypes && event.ticketTypes.length > 0 && (
          <View style={styles.eventCardPrice}>
            <Text style={styles.eventCardPriceText}>
              €{Math.min(...event.ticketTypes.map(t => t.price))}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={[styles.searchHeader, { backgroundColor: colors.background }]}>
        <View>
          <View style={[styles.searchInputWrapper, { backgroundColor: colors.card }]}>
            <SearchIcon size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Procurar eventos..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          
          {suggestions && suggestions.length > 0 && debouncedSearchQuery.length >= 2 && (
            <View style={[styles.suggestionsContainer, { backgroundColor: colors.card }]}>
              {suggestions.map((suggestion: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                  onPress={() => setSearchQuery(suggestion)}
                >
                  <SearchIcon size={16} color={colors.textSecondary} />
                  <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContentContainer}
      >
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryCard,
              { backgroundColor: colors.card },
              selectedCategory === cat.id && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text
              style={[
                styles.categoryLabel,
                { color: colors.text },
                selectedCategory === cat.id && styles.categoryLabelActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {error && (
        <View style={styles.errorContainer}>
          <ErrorState
            message={handleError(error)}
            onRetry={isRetryableError(error) ? () => {
              if (debouncedSearchQuery.length > 0) {
                refetchSearch();
              } else {
                refetchEvents();
              }
            } : undefined}
          />
        </View>
      )}

      <ScrollView 
        style={styles.contentScroll} 
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
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <EventListSkeleton count={3} />
          </View>
        ) : filteredEvents.length > 0 ? (
          <View style={styles.eventsContent}>
            {featuredEvents.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Em Destaque</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.featuredScroll}
                >
                  {featuredEvents.map((event: Event) => (
                    <FeaturedEventCard key={event.id} event={event} />
                  ))}
                </ScrollView>
              </View>
            )}

            {regularEvents.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {featuredEvents.length > 0 ? 'Outros Eventos' : 'Todos os Eventos'}
                </Text>
                <View style={styles.eventsGrid}>
                  {regularEvents.map((event: Event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptySearch}>
            <SearchIcon size={64} color={colors.textSecondary} />
            <Text style={[styles.emptySearchText, { color: colors.text }]}>Nenhum evento encontrado</Text>
            <Text style={[styles.emptySearchSubtext, { color: colors.textSecondary }]}>
              Tenta ajustar os filtros ou a pesquisa
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function AdminUsersContent() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
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
      case 'normal': return colors.primary;
      case 'promoter': return colors.warning;
      case 'admin': return colors.error;
      default: return '#999';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

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
    const userToAction = users.find(u => u.id === userId);
    if (!userToAction) return;

    let title = '';
    let message = '';

    switch (action) {
      case 'suspend':
        title = 'Suspender Utilizador';
        message = `Tem certeza que deseja suspender ${userToAction.name}?`;
        break;
      case 'activate':
        title = 'Ativar Utilizador';
        message = `Tem certeza que deseja ativar ${userToAction.name}?`;
        break;
      case 'verify':
        title = 'Verificar Utilizador';
        message = `Tem certeza que deseja verificar ${userToAction.name}?`;
        break;
      case 'promote':
        title = 'Promover a Promotor';
        message = `Tem certeza que deseja promover ${userToAction.name} a promotor?`;
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

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || u.userType === filterType;
    return matchesSearch && matchesFilter;
  });

  const UserCard = ({ user: u }: { user: AdminUser }) => (
    <View style={[styles.userCard, { backgroundColor: colors.card }]}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={[styles.userName, { color: colors.text }]}>{u.name}</Text>
            {u.isVerified && (
              <UserCheck size={16} color={COLORS.success} />
            )}
          </View>
          <View style={[styles.userTypeBadge, { backgroundColor: getUserTypeColor(u.userType) + '20' }]}>
            <Text style={[styles.userTypeText, { color: getUserTypeColor(u.userType) }]}>
              {getUserTypeLabel(u.userType)}
            </Text>
          </View>
        </View>
        <View style={styles.userActions}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: u.isActive ? COLORS.success : COLORS.error }
          ]} />
          <TouchableOpacity style={styles.moreButton}>
            <MoreVertical size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.userDetails}>
        <View style={styles.detailRow}>
          <Mail size={14} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{u.email}</Text>
        </View>
        {u.phone && (
          <View style={styles.detailRow}>
            <Phone size={14} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{u.phone}</Text>
          </View>
        )}
        {u.location && (
          <View style={styles.detailRow}>
            <MapPin size={14} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{u.location}</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Calendar size={14} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>Membro desde {formatDate(u.joinDate)}</Text>
        </View>
      </View>

      <View style={styles.userStats}>
        {u.userType === 'promoter' && (
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{u.eventsCreated || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Eventos Criados</Text>
          </View>
        )}
        {u.userType === 'normal' && (
          <>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{u.eventsAttended || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Eventos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>€{u.totalSpent || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Gasto Total</Text>
            </View>
          </>
        )}
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{formatLastActive(u.lastActive)}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Última Atividade</Text>
        </View>
      </View>

      <View style={styles.userActionButtons}>
        {!u.isActive ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.activateButton]}
            onPress={() => handleUserAction(u.id, 'activate')}
          >
            <UserCheck size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Ativar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.suspendButton]}
            onPress={() => handleUserAction(u.id, 'suspend')}
          >
            <UserX size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Suspender</Text>
          </TouchableOpacity>
        )}
        
        {!u.isVerified && (
          <TouchableOpacity
            style={[styles.actionButton, styles.verifyButton]}
            onPress={() => handleUserAction(u.id, 'verify')}
          >
            <UserCheck size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Verificar</Text>
          </TouchableOpacity>
        )}

        {u.userType === 'normal' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.promoteButton]}
            onPress={() => handleUserAction(u.id, 'promote')}
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
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, { backgroundColor: colors.card }]}>
            <SearchIcon size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Procurar utilizadores..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.card }]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filterOptions}>
            {['all', 'normal', 'promoter', 'admin'].map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterOption,
                  { backgroundColor: colors.border },
                  filterType === type && { backgroundColor: colors.primary }
                ]}
                onPress={() => setFilterType(type as any)}
              >
                <Text style={[
                  styles.filterOptionText,
                  { color: colors.textSecondary },
                  filterType === type && styles.filterOptionTextActive
                ]}>
                  {type === 'all' ? 'Todos' : getUserTypeLabel(type)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{totalUsers}</Text>
            <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: COLORS.success }]}>{activeUsers}</Text>
            <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>Ativos</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: COLORS.warning }]}>{promoters}</Text>
            <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>Promotores</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: COLORS.info }]}>{normalUsers}</Text>
            <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>Utilizadores</Text>
          </View>
        </View>

        <ScrollView style={styles.usersList} showsVerticalScrollIndicator={false}>
          {filteredUsers.map(u => (
            <UserCard key={u.id} user={u} />
          ))}
          {filteredUsers.length === 0 && (
            <View style={styles.emptyState}>
              <Users size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>Nenhum utilizador encontrado</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

function PromoterEventsContent() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { colors, isDark } = useTheme();
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past'>('upcoming');

  const { data: profileByUser } = trpc.promoters.getByUserId.useQuery(
    { userId: user?.id ?? '' },
    { enabled: !!user?.id }
  );
  const promoterId = profileByUser?.id ?? null;
  const { data: eventsData, isLoading, error, refetch } = trpc.events.list.useQuery(
    promoterId ? { promoterId } : (undefined as any),
    { enabled: !!promoterId }
  );

  const allEvents: Event[] = useMemo(() => {
    if (!eventsData) return [];
    return eventsData.map((e: any) => ({
      ...e,
      date: new Date(e.date),
      endDate: e.endDate ? new Date(e.endDate) : undefined,
      venue: typeof e.venue === 'object' && e.venue
        ? { id: (e.venue as any).id ?? '', name: (e.venue as any).name ?? '', address: (e.venue as any).address ?? '', city: (e.venue as any).city ?? '', capacity: (e.venue as any).capacity ?? 0 }
        : { id: '', name: '', address: '', city: '', capacity: 0 },
      promoter: typeof e.promoter === 'object' && e.promoter
        ? { id: (e.promoter as any).id ?? '', name: (e.promoter as any).name ?? '', image: (e.promoter as any).image ?? '', description: (e.promoter as any).description ?? '', verified: !!(e.promoter as any).verified, followersCount: (e.promoter as any).followersCount ?? 0 }
        : { id: user?.id ?? '', name: user?.name ?? 'Promotor', image: '', description: '', verified: false, followersCount: 0 },
    })) as Event[];
  }, [eventsData, user?.id, user?.name]);

  const now = new Date();
  const upcomingEvents = allEvents.filter(event => new Date(event.date) >= now);
  const pastEvents = allEvents.filter(event => new Date(event.date) < now);

  const handleDeleteEvent = (eventId: string) => {
    Alert.alert(
      'Eliminar Evento',
      'Tem certeza que deseja eliminar este evento? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            console.log('Eliminar evento:', eventId);
          },
        },
      ]
    );
  };

  const EventCard = ({ event }: { event: Event }) => {
    const totalTickets = event.ticketTypes?.reduce((s: number, t: any) => s + (t.available ?? 0), 0) ?? event.venue?.capacity ?? 0;
    const soldTickets = 0;
    const revenue = 0;
    const views = 0;

    return (
      <View style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Image source={{ uri: event.image }} style={styles.eventImage} />
        
        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
            <View style={styles.eventActions}>
              <TouchableOpacity
                style={[styles.actionButtonIcon, { backgroundColor: isDark ? colors.border : '#f8f9fa' }]}
                onPress={() => router.push(`/event-buyers/${event.id}` as any)}
              >
                <Eye size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButtonIcon, { backgroundColor: isDark ? colors.border : '#f8f9fa' }]}
                onPress={() => console.log('Editar evento:', event.id)}
              >
                <Edit3 size={18} color="#FFD700" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButtonIcon, { backgroundColor: isDark ? colors.border : '#f8f9fa' }]}
                onPress={() => handleDeleteEvent(event.id)}
              >
                <Trash2 size={18} color="#FF385C" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.eventInfo}>
            <View style={styles.infoRow}>
              <Calendar size={16} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                {new Date(event.date).toLocaleDateString('pt-PT', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Clock size={16} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                {new Date(event.date).toLocaleTimeString('pt-PT', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <MapPin size={16} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>{event.venue.name}</Text>
            </View>
          </View>

          <View style={[styles.eventStats, { backgroundColor: colors.background }]}>
            <View style={styles.statItem}>
              <Users size={16} color="#4CAF50" />
              <Text style={[styles.statValue, { color: colors.text }]}>{soldTickets}/{totalTickets}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Bilhetes</Text>
            </View>
            
            <View style={styles.statItem}>
              <DollarSign size={16} color="#FFD700" />
              <Text style={[styles.statValue, { color: colors.text }]}>€{revenue.toLocaleString('pt-PT')}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Receita</Text>
            </View>
            
            <View style={styles.statItem}>
              <Eye size={16} color="#2196F3" />
              <Text style={[styles.statValue, { color: colors.text }]}>{views.toLocaleString('pt-PT')}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Visualizações</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min((soldTickets / (totalTickets || 1)) * 100, 100)}%`, backgroundColor: colors.primary }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {Math.round((soldTickets / (totalTickets || 1)) * 100)}% vendidos
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const TabButton = ({ tab, title, isActive }: { tab: 'upcoming' | 'past'; title: string; isActive: boolean }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        { backgroundColor: colors.card },
        isActive && { backgroundColor: colors.primary }
      ]}
      onPress={() => setSelectedTab(tab)}
    >
      <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const currentEvents = selectedTab === 'upcoming' ? upcomingEvents : pastEvents;

  if (user?.id && profileByUser === undefined) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <LoadingSpinner message="A carregar perfil..." />
      </View>
    );
  }
  if (promoterId && error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <ErrorState message={handleError(error)} onRetry={() => refetch()} />
      </View>
    );
  }
  if (promoterId && isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <LoadingSpinner message="A carregar eventos..." />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
        <TabButton 
          tab="upcoming" 
          title={`Próximos (${upcomingEvents.length})`} 
          isActive={selectedTab === 'upcoming'} 
        />
        <TabButton 
          tab="past" 
          title={`Passados (${pastEvents.length})`} 
          isActive={selectedTab === 'past'} 
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {currentEvents.length > 0 ? (
          currentEvents.map((event: Event) => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Calendar size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {selectedTab === 'upcoming' ? 'Nenhum evento próximo' : 'Nenhum evento passado'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {selectedTab === 'upcoming' 
                ? 'Crie seu primeiro evento para começar a vender ingressos'
                : 'Seus eventos passados aparecerão aqui'
              }
            </Text>
          </View>
        )}
      </ScrollView>
      
      <TouchableOpacity 
        style={[styles.floatingButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/create-event' as any)}
      >
        <Plus size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

export default function SearchScreen() {
  return (
    <AuthGuard>
      <SearchContent />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  filterButton: {
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
  },
  filterOptionActive: {},
  filterOptionText: {
    fontSize: 14,
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
    marginBottom: 5,
  },
  statCardLabel: {
    fontSize: 12,
  },
  usersList: {
    flex: 1,
  },
  userCard: {
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
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
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
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeTabButton: {},
  tabButtonText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  activeTabButtonText: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  eventCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    flex: 1,
    marginRight: 12,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonIcon: {
    padding: 8,
    borderRadius: 8,
  },
  eventInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  eventStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  searchHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  categoriesContainer: {
    maxHeight: 80,
    paddingLeft: 20,
    marginBottom: 20,
  },
  categoriesContentContainer: {
    paddingRight: 20,
    gap: 12,
  },
  categoryCard: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    minWidth: 75,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryCardActive: {},
  categoryIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  categoryLabelActive: {
    color: COLORS.white,
  },
  contentScroll: {
    flex: 1,
  },
  eventsContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  featuredScroll: {
    paddingHorizontal: 20,
    gap: 15,
  },
  featuredCard: {
    width: 300,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  featuredCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  featuredCardContent: {
    padding: 16,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  featuredBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold' as const,
  },
  featuredCardTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.white,
    marginBottom: 8,
  },
  featuredCardInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  featuredInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredInfoText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '500' as const,
  },
  eventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  eventCard2: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  eventCardImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  eventCardContent: {
    padding: 12,
  },
  eventCardTitle: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    marginBottom: 8,
    minHeight: 36,
  },
  eventCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  eventCardText: {
    fontSize: 12,
    flex: 1,
  },
  eventCardPrice: {
    marginTop: 8,
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  eventCardPriceText: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: COLORS.success,
  },
  emptySearch: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptySearchText: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginTop: 20,
    textAlign: 'center',
  },
  emptySearchSubtext: {
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    borderRadius: 12,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 1000,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  suggestionText: {
    fontSize: 15,
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    padding: 20,
  },
});

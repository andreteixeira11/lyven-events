import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Heart, Calendar, Bell, Clock, MapPin, Share2, Star } from 'lucide-react-native';
import { useFavorites } from '@/hooks/favorites-context';
import { router, Stack } from 'expo-router';
import { useMemo } from 'react';
import { useTheme } from '@/hooks/theme-context';
import { trpc } from '@/lib/trpc';
import { LoadingSpinner, ErrorState } from '@/components/LoadingStates';
import { handleError } from '@/lib/error-handler';
import { Event } from '@/types/event';

export default function FavoritesScreen() {
  const { isFavorite, removeFromFavorites, hasReminder, shareEvent, addToCalendar } = useFavorites();
  const { colors } = useTheme();

  const { data: allEventsData, isLoading, error, refetch } = trpc.events.list.useQuery({});

  const favoriteEvents: Event[] = useMemo(() => {
    if (!allEventsData) return [];
    return allEventsData
      .filter((e: any) => isFavorite(e.id))
      .map((e: any) => ({
        ...e,
        date: new Date(e.date),
        endDate: e.endDate ? new Date(e.endDate) : undefined,
        venue: typeof e.venue === 'object' && e.venue
          ? { id: (e.venue as any).id ?? '', name: (e.venue as any).name ?? '', address: (e.venue as any).address ?? '', city: (e.venue as any).city ?? '', capacity: (e.venue as any).capacity ?? 0 }
          : { id: '', name: '', address: '', city: '', capacity: 0 },
        promoter: typeof e.promoter === 'object' && e.promoter
          ? { id: (e.promoter as any).id ?? '', name: (e.promoter as any).name ?? '', image: (e.promoter as any).image ?? '', description: (e.promoter as any).description ?? '', verified: !!(e.promoter as any).verified, followersCount: (e.promoter as any).followersCount ?? 0 }
          : { id: '', name: '', image: '', description: '', verified: false, followersCount: 0 },
      })) as Event[];
  }, [allEventsData, isFavorite]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return favoriteEvents
      .filter(event => event.date > now)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [favoriteEvents]);

  const pastEvents = useMemo(() => {
    const now = new Date();
    return favoriteEvents
      .filter(event => event.date <= now)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [favoriteEvents]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-PT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  

  const handleRemoveFromFavorites = async (eventId: string) => {
    await removeFromFavorites(eventId);
  };

  const handleShare = async (eventId: string, eventTitle: string) => {
    await shareEvent(eventId, eventTitle);
  };

  const handleAddToCalendar = async (eventId: string) => {
    await addToCalendar(eventId);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Favoritos', headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }} />
        <LoadingSpinner message="A carregar favoritos..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Favoritos', headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }} />
        <ErrorState message={handleError(error)} onRetry={() => refetch()} />
      </View>
    );
  }

  if (favoriteEvents.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen 
          options={{
            title: 'Favoritos',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }} 
        />
        <View style={styles.emptyState}>
          <Heart size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Nenhum evento favorito</Text>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            Adicione eventos aos favoritos para os ver aqui e receber lembretes
          </Text>
          <TouchableOpacity 
            style={[styles.exploreButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/search')}
          >
            <Text style={styles.exploreButtonText}>Explorar Eventos</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{
          title: 'Favoritos',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }} 
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Próximos Eventos</Text>
            {upcomingEvents.map(event => (
              <TouchableOpacity
                key={event.id}
                style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/event/${event.id}`)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: event.image }} style={styles.eventImage} />
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>{event.title}</Text>
                    <View style={styles.eventActions}>
                      {hasReminder(event.id) && (
                        <Bell size={16} color={colors.notification} fill={colors.notification} />
                      )}
                      <TouchableOpacity onPress={() => handleRemoveFromFavorites(event.id)}>
                        <Heart size={16} color={colors.notification} fill={colors.notification} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.eventDetails}>
                    <View style={styles.eventDetailRow}>
                      <Calendar size={14} color={colors.textSecondary} />
                      <Text style={[styles.eventDetailText, { color: colors.textSecondary }]} numberOfLines={1}>
                        {formatDate(event.date)}
                      </Text>
                    </View>
                    <View style={styles.eventDetailRow}>
                      <MapPin size={14} color={colors.textSecondary} />
                      <Text style={[styles.eventDetailText, { color: colors.textSecondary }]} numberOfLines={1}>
                        {event.venue.name}, {event.venue.city}
                      </Text>
                    </View>
                    {event.duration && (
                      <View style={styles.eventDetailRow}>
                        <Clock size={14} color={colors.textSecondary} />
                        <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>
                          {event.duration} min
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.eventFooter}>
                    <Text style={[styles.eventPrice, { color: colors.primary }]}>
                      A partir de €{Math.min(...event.ticketTypes.map(t => t.price))}
                    </Text>
                    <View style={styles.eventQuickActions}>
                      <TouchableOpacity 
                        style={[styles.quickAction, { backgroundColor: colors.primary }]}
                        onPress={() => handleAddToCalendar(event.id)}
                      >
                        <Calendar size={16} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.quickAction, { backgroundColor: colors.primary }]}
                        onPress={() => handleShare(event.id, event.title)}
                      >
                        <Share2 size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Eventos Anteriores</Text>
            {pastEvents.map(event => (
              <TouchableOpacity
                key={event.id}
                style={[styles.eventCard, styles.pastEventCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/event/${event.id}`)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: event.image }} style={[styles.eventImage, styles.pastEventImage]} />
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <Text style={[styles.eventTitle, styles.pastEventTitle, { color: colors.textSecondary }]} numberOfLines={2}>
                      {event.title}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemoveFromFavorites(event.id)}>
                      <Heart size={16} color={colors.textSecondary} fill={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.eventDetails}>
                    <View style={styles.eventDetailRow}>
                      <Calendar size={14} color={colors.textSecondary} />
                      <Text style={[styles.eventDetailText, styles.pastEventText, { color: colors.textSecondary }]} numberOfLines={1}>
                        {formatDate(event.date)}
                      </Text>
                    </View>
                    <View style={styles.eventDetailRow}>
                      <MapPin size={14} color={colors.textSecondary} />
                      <Text style={[styles.eventDetailText, styles.pastEventText, { color: colors.textSecondary }]} numberOfLines={1}>
                        {event.venue.name}, {event.venue.city}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.ratingSection}>
                    <Text style={[styles.ratingText, { color: colors.textSecondary }]}>Como foi o evento?</Text>
                    <View style={styles.stars}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <TouchableOpacity key={star}>
                          <Star size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: '#FF385C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 16,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
  },
  pastEventCard: {
    opacity: 0.7,
  },
  eventImage: {
    width: 100,
    height: 140,
  },
  pastEventImage: {
    opacity: 0.6,
  },
  eventContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#fff',
    flex: 1,
    marginRight: 8,
  },
  pastEventTitle: {
    color: '#999',
  },
  eventActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  eventDetails: {
    gap: 4,
    marginBottom: 8,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  eventDetailText: {
    fontSize: 13,
    color: '#999',
    flex: 1,
  },
  pastEventText: {
    color: '#666',
  },
  eventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventPrice: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#FF385C',
  },
  eventQuickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAction: {
    backgroundColor: '#333',
    padding: 6,
    borderRadius: 6,
  },
  ratingSection: {
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, Calendar, Check } from 'lucide-react-native';
import { useTheme } from '@/hooks/theme-context';
import { useUser } from '@/hooks/user-context';
import { trpc } from '@/lib/trpc';

export default function PromoterScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const { user } = useUser();

  const promoterId = Array.isArray(id) ? id[0] : id;

  const eventsQuery = trpc.events.list.useQuery();
  
  const isFollowingQuery = trpc.social.isFollowing.useQuery(
    {
      userId: user?.id || '',
      targetId: promoterId,
      targetType: 'promoter',
    },
    {
      enabled: !!user?.id,
    }
  );

  const utils = trpc.useUtils();

  const followMutation = trpc.social.follow.useMutation({
    onSuccess: async () => {
      await isFollowingQuery.refetch();
      await utils.social.getFollowing.invalidate();
      console.log('Follow successful - promoter:', promoterId);
    },
    onError: (error) => {
      console.error('Follow error:', error);
    }
  });

  const unfollowMutation = trpc.social.unfollow.useMutation({
    onSuccess: async () => {
      await isFollowingQuery.refetch();
      await utils.social.getFollowing.invalidate();
      console.log('Unfollow successful - promoter:', promoterId);
    },
    onError: (error) => {
      console.error('Unfollow error:', error);
    }
  });

  const promoterEvents = eventsQuery.data?.filter(
    (event: { promoter?: { id: string } }) => event.promoter?.id === promoterId
  ) || [];

  const promoter = promoterEvents[0]?.promoter || {
    id: promoterId,
    name: 'Promotor',
    image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400',
    description: 'Organizador de eventos',
    verified: false,
    followersCount: 0
  };

  const handleFollowToggle = async () => {
    if (!user?.id) {
      router.push('/login');
      return;
    }

    console.log('Toggle follow for promoter:', promoterId, 'user:', user.id);
    const isFollowing = isFollowingQuery.data?.isFollowing || false;
    console.log('Currently following:', isFollowing);

    if (isFollowing) {
      unfollowMutation.mutate({
        userId: user.id,
        targetId: promoterId,
        targetType: 'promoter'
      });
    } else {
      followMutation.mutate({
        userId: user.id,
        targetId: promoterId,
        targetType: 'promoter'
      });
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const upcomingEvents = promoterEvents
    .filter((event: { date: string | Date }) => new Date(event.date) >= new Date())
    .sort((a: { date: string | Date }, b: { date: string | Date }) => {
      const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date;
      const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date;
      return dateA.getTime() - dateB.getTime();
    });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={[styles.promoterHeader, { backgroundColor: colors.primary }]}>
          <Image 
            source={{ uri: promoter.image }} 
            style={styles.promoterImage}
          />
          <Text style={styles.promoterName}>{promoter.name}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {(promoter.followersCount / 1000).toFixed(1)}k
              </Text>
              <Text style={styles.statLabel}>Seguidores</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{promoterEvents.length}</Text>
              <Text style={styles.statLabel}>Eventos</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.followButton,
              isFollowingQuery.data?.isFollowing && styles.followingButton,
              { backgroundColor: isFollowingQuery.data?.isFollowing ? colors.card : '#fff' }
            ]}
            onPress={handleFollowToggle}
            disabled={followMutation.isPending || unfollowMutation.isPending || isFollowingQuery.isLoading}
          >
            {followMutation.isPending || unfollowMutation.isPending || isFollowingQuery.isLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                {isFollowingQuery.data?.isFollowing && <Check size={18} color={colors.primary} />}
                <Text
                  style={[
                    styles.followButtonText,
                    { color: isFollowingQuery.data?.isFollowing ? colors.primary : colors.primary }
                  ]}
                >
                  {isFollowingQuery.data?.isFollowing ? 'A seguir' : 'Seguir'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {promoter.description && (
            <View style={[styles.descriptionSection, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Sobre</Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {promoter.description}
              </Text>
            </View>
          )}

          <View style={styles.eventsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Eventos Próximos ({upcomingEvents.length})
            </Text>

            {eventsQuery.isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : upcomingEvents.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
                <Calendar size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.text }]}>
                  Nenhum evento próximo
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                  Este promotor não tem eventos agendados no momento
                </Text>
              </View>
            ) : (
              upcomingEvents.map((event: { id: string; image: string; title: string; date: string | Date; venue?: { name?: string; city?: string }; ticketTypes?: Array<{ price: number }> }) => (
                <TouchableOpacity
                  key={event.id}
                  style={[styles.eventCard, { backgroundColor: colors.card }]}
                  onPress={() => router.push(`/event/${event.id}` as any)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: event.image }} style={styles.eventImage} />
                  <View style={styles.eventInfo}>
                    <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>
                      {event.title}
                    </Text>
                    
                    <View style={styles.eventDetail}>
                      <Calendar size={14} color={colors.textSecondary} />
                      <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>
                        {formatDate(event.date)} · {formatTime(event.date)}
                      </Text>
                    </View>

                    <View style={styles.eventDetail}>
                      <MapPin size={14} color={colors.textSecondary} />
                      <Text style={[styles.eventDetailText, { color: colors.textSecondary }]} numberOfLines={1}>
                        {event.venue.name} · {event.venue.city}
                      </Text>
                    </View>

                    {event.ticketTypes && event.ticketTypes.length > 0 && (
                      <View style={styles.priceContainer}>
                        <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
                          A partir de
                        </Text>
                        <Text style={[styles.price, { color: colors.primary }]}>
                          €{Math.min(...event.ticketTypes.map((t: any) => t.price))}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoterHeader: {
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  promoterImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 12,
  },
  promoterName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
    gap: 6,
    minWidth: 130,
  },
  followingButton: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  followButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  descriptionSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  eventsSection: {
    marginBottom: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  eventCard: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventImage: {
    width: 120,
    height: 140,
  },
  eventInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  eventDetailText: {
    fontSize: 13,
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
});

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
import { router, Stack } from 'expo-router';
import { ArrowLeft, Users as UsersIcon } from 'lucide-react-native';
import { useTheme } from '@/hooks/theme-context';
import { useUser } from '@/hooks/user-context';
import { trpc } from '@/lib/trpc';

export default function FollowingScreen() {
  const { colors } = useTheme();
  const { user } = useUser();

  const followingQuery = trpc.social.getFollowing.useQuery(
    {
      userId: user?.id || '',
      type: 'promoter',
    },
    {
      enabled: !!user?.id,
    }
  );

  const promoters = React.useMemo(() => {
    return followingQuery.data?.following.filter(
      (item: any) => item.type === 'promoter'
    ) || [];
  }, [followingQuery.data]);

  React.useEffect(() => {
    if (followingQuery.data) {
      console.log('Following data received:', JSON.stringify(followingQuery.data, null, 2));
      console.log('Filtered promoters count:', promoters.length);
      console.log('Promoters:', promoters);
    }
  }, [followingQuery.data, promoters]);

  if (!user) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { backgroundColor: colors.background }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>A Seguir</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              Faça login para ver quem está seguindo
            </Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>A Seguir</Text>
          <View style={{ width: 40 }} />
        </View>

        {followingQuery.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : promoters.length === 0 ? (
          <View style={styles.emptyContainer}>
            <UsersIcon size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              Ainda não segue nenhum promotor
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Siga promotores para ver os eventos deles aqui
            </Text>
            <TouchableOpacity
              style={[styles.exploreButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.exploreButtonText}>Explorar Eventos</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {promoters.map((item: any) => {
              const promoter = item.data;
              if (!promoter) return null;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.promoterCard, { backgroundColor: colors.card }]}
                  onPress={() => router.push(`/promoter/${item.id}` as any)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ 
                      uri: promoter.image || 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400'
                    }}
                    style={styles.promoterImage}
                  />
                  <View style={styles.promoterInfo}>
                    <Text style={[styles.promoterName, { color: colors.text }]}>
                      {promoter.businessName || promoter.name || 'Promotor'}
                    </Text>
                    <Text style={[styles.promoterDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                      {promoter.description || 'Organizador de eventos'}
                    </Text>
                    <View style={styles.statsRow}>
                      <Text style={[styles.statText, { color: colors.textSecondary }]}>
                        {promoter.followersCount || 0} seguidores
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  exploreButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  promoterCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  promoterImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  promoterInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  promoterName: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 6,
  },
  promoterDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statText: {
    fontSize: 13,
  },
});

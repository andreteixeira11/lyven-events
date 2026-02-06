import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { 
  Users, 
  Mail,
  Phone,
  UserCheck,
  User,
} from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { trpc } from '@/lib/trpc';

export default function UsersListScreen() {
  const usersQuery = trpc.users.list.useQuery({
    limit: 100,
    offset: 0,
  });

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
      case 'normal': return COLORS.info;
      case 'promoter': return COLORS.warning;
      case 'admin': return COLORS.error;
      default: return COLORS.gray;
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  if (usersQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{ 
            title: 'Utilizadores Registados',
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.white,
            headerTitleStyle: { fontWeight: 'bold' as const },
          }} 
        />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>A carregar utilizadores...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (usersQuery.error) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{ 
            title: 'Utilizadores Registados',
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.white,
            headerTitleStyle: { fontWeight: 'bold' as const },
          }} 
        />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Erro ao carregar utilizadores</Text>
          <Text style={styles.errorSubtext}>{usersQuery.error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const users = usersQuery.data?.users || [];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Utilizadores Registados',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' as const },
        }} 
      />
      
      <View style={styles.content}>
        <View style={styles.statsHeader}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{users.length}</Text>
            <Text style={styles.statLabel}>Total de Utilizadores</Text>
          </View>
        </View>

        <ScrollView style={styles.usersList} showsVerticalScrollIndicator={false}>
          {users.map((user: any) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userName}>{user.name || 'Sem nome'}</Text>
                    {user.emailVerified && (
                      <UserCheck size={16} color={COLORS.success} />
                    )}
                  </View>
                  <View style={[styles.userTypeBadge, { backgroundColor: getUserTypeColor(user.userType) + '20' }]}>
                    <Text style={[styles.userTypeText, { color: getUserTypeColor(user.userType) }]}>
                      {getUserTypeLabel(user.userType)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.userDetails}>
                <View style={styles.detailRow}>
                  <Mail size={14} color={COLORS.textSecondary} />
                  <Text style={styles.detailText}>{user.email}</Text>
                </View>
                {user.phoneNumber && (
                  <View style={styles.detailRow}>
                    <Phone size={14} color={COLORS.textSecondary} />
                    <Text style={styles.detailText}>{user.phoneNumber}</Text>
                  </View>
                )}
                {user.createdAt && (
                  <View style={styles.detailRow}>
                    <User size={14} color={COLORS.textSecondary} />
                    <Text style={styles.detailText}>Registado em {formatDate(user.createdAt)}</Text>
                  </View>
                )}
              </View>

              {user.location && (
                <View style={styles.locationContainer}>
                  <Text style={styles.locationText}>📍 {user.location}</Text>
                </View>
              )}

              {user.interests && user.interests.length > 0 && (
                <View style={styles.interestsContainer}>
                  <Text style={styles.interestsLabel}>Interesses:</Text>
                  <View style={styles.interestsTags}>
                    {user.interests.map((interest: string, idx: number) => (
                      <View key={idx} style={styles.interestTag}>
                        <Text style={styles.interestTagText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ))}

          {users.length === 0 && (
            <View style={styles.emptyState}>
              <Users size={48} color={COLORS.lightGray} />
              <Text style={styles.emptyStateText}>Nenhum utilizador registado</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.error,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  statsHeader: {
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: COLORS.white,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.white,
  },
  usersList: {
    flex: 1,
  },
  userCard: {
    backgroundColor: COLORS.white,
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
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  userTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  userTypeText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  userDetails: {
    marginBottom: 10,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  locationContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  interestsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  interestsLabel: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  interestsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  interestTag: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interestTagText: {
    fontSize: 12,
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 10,
  },
});

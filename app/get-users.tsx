import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { trpc } from '@/lib/trpc';

export default function GetUsersScreen() {
  const { data, isLoading, error } = trpc.users.list.useQuery({ limit: 1000 });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Utilizadores Registados' }} />
      
      <ScrollView style={styles.content}>
        {isLoading && (
          <ActivityIndicator size="large" color="#000" style={styles.loader} />
        )}

        {error && (
          <Text style={styles.error}>Erro: {error.message}</Text>
        )}

        {data && (
          <View style={styles.results}>
            <Text style={styles.title}>Total de utilizadores: {data.users.length}</Text>
            
            {data.users.map((user: { id: string; name: string; email: string; phone?: string | null; userType: string; createdAt: string; isOnboardingComplete: boolean }) => (
              <View key={user.id} style={styles.userCard}>
                <Text style={styles.userName}>Nome: {user.name}</Text>
                <Text style={styles.userEmail}>Email: {user.email}</Text>
                {user.phone && <Text style={styles.userPhone}>Telefone: {user.phone}</Text>}
                <Text style={styles.userType}>Tipo: {user.userType}</Text>
                <Text style={styles.userDate}>Registado: {new Date(user.createdAt).toLocaleDateString('pt-PT')}</Text>
                <Text style={styles.userOnboarding}>Onboarding: {user.isOnboardingComplete ? 'Completo' : 'Incompleto'}</Text>
              </View>
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
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loader: {
    marginTop: 40,
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  results: {
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  userCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
  },
  userType: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  userDate: {
    fontSize: 12,
    color: '#999',
  },
  userOnboarding: {
    fontSize: 12,
    color: '#999',
  },
});

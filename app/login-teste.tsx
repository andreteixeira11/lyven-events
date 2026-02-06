import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { ArrowLeft, User, UserPlus } from 'lucide-react-native';
import { useTheme } from '@/hooks/theme-context';
import { useUser } from '@/hooks/user-context';

export default function LoginTesteScreen() {
  const { colors } = useTheme();
  const { updateUser } = useUser();

  const handleTestLogin = async () => {
    const testUser = {
      id: 'user-teste-app',
      name: 'João Silva',
      email: 'joao@teste.com',
      userType: 'normal' as const,
      interests: ['music', 'festivals', 'dance'],
      location: {
        latitude: 38.7223,
        longitude: -9.1393,
        city: 'Lisboa',
        region: 'Lisboa',
      },
      preferences: {
        notifications: true,
        language: 'pt' as const,
        priceRange: {
          min: 0,
          max: 200,
        },
        eventTypes: ['music', 'festivals', 'dance'],
      },
      isOnboardingComplete: true,
      favoriteEvents: [],
      eventHistory: [],
      following: {
        promoters: [],
        artists: [],
        friends: [],
      },
      createdAt: new Date().toISOString(),
    };

    try {
      await updateUser(testUser);
      Alert.alert(
        'Sucesso',
        'Login como João Silva realizado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível fazer login');
    }
  };

  const handleRegularLogin = () => {
    router.push('/login');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Login de Teste</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <User size={48} color={colors.primary} />
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              Utilizador de Teste
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              João Silva
            </Text>
            <Text style={[styles.infoSubtext, { color: colors.textSecondary }]}>
              joao@teste.com
            </Text>
          </View>

          <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.detailsTitle, { color: colors.text }]}>
              Detalhes da Conta de Teste
            </Text>
            <Text style={[styles.detailsText, { color: colors.textSecondary }]}>
              • Tipo: Utilizador Normal
            </Text>
            <Text style={[styles.detailsText, { color: colors.textSecondary }]}>
              • Localização: Lisboa, Portugal
            </Text>
            <Text style={[styles.detailsText, { color: colors.textSecondary }]}>
              • Interesses: Música, Festivais, Dança
            </Text>
            <Text style={[styles.detailsText, { color: colors.textSecondary }]}>
              • Segue 3 promotores (após seed)
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={handleTestLogin}
          >
            <UserPlus size={20} color="#fff" />
            <Text style={styles.loginButtonText}>
              Login como João Silva
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.regularButton, { borderColor: colors.primary }]}
            onPress={handleRegularLogin}
          >
            <Text style={[styles.regularButtonText, { color: colors.primary }]}>
              Login Normal
            </Text>
          </TouchableOpacity>

          <View style={[styles.noteCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.noteText, { color: colors.textSecondary }]}>
              💡 Dica: Execute o seed do banco de dados primeiro na página
              &quot;Testar Seed&quot; para ter dados de teste disponíveis.
            </Text>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  infoCard: {
    padding: 30,
    borderRadius: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginTop: 16,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 14,
  },
  detailsCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  detailsText: {
    fontSize: 14,
    lineHeight: 24,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 24,
    gap: 8,
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  regularButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 2,
    marginBottom: 20,
  },
  regularButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  noteCard: {
    padding: 16,
    borderRadius: 24,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});

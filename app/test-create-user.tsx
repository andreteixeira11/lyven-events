import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { Stack } from 'expo-router';
import { trpc } from '@/lib/trpc';

export default function TestCreateUser() {
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const createUserMutation = trpc.users.create.useMutation();

  const createTestUser = async () => {
    setIsLoading(true);
    setResult('A criar utilizador de teste...\n');

    try {
      const testUser = {
        id: `test-user-${Date.now()}`,
        name: 'João Silva',
        email: `joao.silva${Date.now()}@lyven.pt`,
        phone: '+351912345678',
        userType: 'normal' as const,
        interests: ['music', 'dance', 'festival'],
        location: {
          city: 'Lisboa',
          region: 'Lisboa',
          latitude: 38.7223,
          longitude: -9.1393,
        },
        preferences: {
          notifications: true,
          language: 'pt' as const,
          priceRange: {
            min: 0,
            max: 100,
          },
          eventTypes: ['music', 'festival'],
        },
      };

      setResult((prev) => prev + '📦 Dados do utilizador:\n' + JSON.stringify(testUser, null, 2) + '\n\n');

      const createdUser = await createUserMutation.mutateAsync(testUser);

      setResult((prev) => prev + '✅ Utilizador criado com sucesso!\n\n');
      setResult((prev) => prev + '👤 Resposta do servidor:\n' + JSON.stringify(createdUser, null, 2) + '\n\n');
      
      setResult((prev) => prev + '🎉 LIGAÇÃO TURSO VERIFICADA COM SUCESSO!\n');
      setResult((prev) => prev + '\nID do utilizador criado: ' + createdUser.id + '\n');
      setResult((prev) => prev + 'Email: ' + createdUser.email + '\n');

      Alert.alert('Sucesso!', 'Utilizador criado e verificado no Turso!');
    } catch (error: any) {
      console.error('❌ Erro ao criar utilizador:', error);
      setResult((prev) => prev + '❌ ERRO:\n' + error.message + '\n\n');
      if (error.stack) {
        setResult((prev) => prev + 'Stack:\n' + error.stack + '\n');
      }
      Alert.alert('Erro', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnectionMutation = trpc.example.hi.useMutation();

  const testConnection = async () => {
    setIsLoading(true);
    setResult('A testar ligação ao Turso...\n');

    try {
      const response = await testConnectionMutation.mutateAsync({ name: 'Teste Turso' });
      setResult((prev) => prev + '✅ Backend conectado!\n');
      setResult((prev) => prev + '📡 Resposta: ' + JSON.stringify(response, null, 2) + '\n\n');
    } catch (error: any) {
      setResult((prev) => prev + '❌ Erro ao conectar ao backend:\n' + error.message + '\n\n');
    } finally {
      setIsLoading(false);
    }
  };

  const listUsersQuery = trpc.users.list.useQuery({}, { enabled: false });

  const listUsers = async () => {
    setIsLoading(true);
    setResult('A listar utilizadores...\n');

    try {
      const response = await listUsersQuery.refetch();
      const users = response.data?.users || [];
      setResult((prev) => prev + `✅ Encontrados ${users.length} utilizadores!\n\n`);
      setResult((prev) => prev + JSON.stringify(users, null, 2) + '\n');
    } catch (error: any) {
      setResult((prev) => prev + '❌ Erro ao listar:\n' + error.message + '\n\n');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Teste Turso - Criar Utilizador' }} />
      
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={createTestUser}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'A processar...' : '🔥 Criar Utilizador de Teste'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={testConnection}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, styles.secondaryText]}>
            📡 Testar Ligação Backend
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={listUsers}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, styles.secondaryText]}>
            📋 Listar Todos Utilizadores
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={() => setResult('')}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, styles.secondaryText]}>
            🗑️ Limpar Log
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultContainer}>
        <Text style={styles.resultText}>{result || 'Pressiona um botão para começar...'}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  buttons: {
    padding: 16,
    gap: 12,
    backgroundColor: '#0a0a0a',
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#8b5cf6',
  },
  secondaryButton: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
  },
  clearButton: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryText: {
    color: '#a0a0a0',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#000',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  resultText: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
});

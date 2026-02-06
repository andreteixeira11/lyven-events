import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { trpcClient } from '@/lib/trpc';

export default function TestTursoConnectionScreen() {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const testConnection = async () => {
    setLoading(true);
    setTestResult('🔄 Testando conexão com Turso...\n\n');

    try {
      setTestResult(prev => prev + '1️⃣ Testando query de exemplo...\n');
      const hiResult = await trpcClient.example.hi.mutate({ name: 'Turso Test' });
      setTestResult(prev => prev + `✅ Backend respondeu: "${hiResult.hello}"\n\n`);

      setTestResult(prev => prev + '2️⃣ Buscando eventos da base de dados...\n');
      const events = await trpcClient.events.list.query();
      setTestResult(prev => prev + `✅ Encontrados ${events.length} eventos\n`);
      
      if (events.length > 0) {
        setTestResult(prev => prev + `📋 Primeiro evento: ${events[0].title}\n\n`);
      } else {
        setTestResult(prev => prev + `⚠️ Nenhum evento encontrado (base de dados vazia)\n\n`);
      }

      setTestResult(prev => prev + '3️⃣ Buscando utilizadores...\n');
      const usersData = await trpcClient.users.list.query({ limit: 5 });
      const users = usersData.users;
      setTestResult(prev => prev + `✅ Encontrados ${users.length} utilizadores\n`);
      
      if (users.length > 0) {
        setTestResult(prev => prev + `👤 Primeiro utilizador: ${users[0].name}\n\n`);
      } else {
        setTestResult(prev => prev + `⚠️ Nenhum utilizador encontrado (base de dados vazia)\n\n`);
      }

      setTestResult(prev => prev + '✅ CONEXÃO COM TURSO ESTABELECIDA COM SUCESSO!\n\n');
      setTestResult(prev => prev + '🎉 A base de dados está funcional e pronta a usar!\n');
      
    } catch (error: any) {
      setTestResult(prev => prev + `\n❌ ERRO: ${error.message}\n\n`);
      setTestResult(prev => prev + 'Detalhes do erro:\n');
      setTestResult(prev => prev + JSON.stringify(error, null, 2));
      console.error('Test error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Teste Conexão Turso' }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>🗄️ Teste de Conexão Turso</Text>
        <Text style={styles.subtitle}>
          Verifica se a base de dados está conectada
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={testConnection}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>🚀 Testar Conexão</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultContainer}>
        {testResult ? (
          <Text style={styles.resultText}>{testResult}</Text>
        ) : (
          <Text style={styles.noResult}>
            Clique no botão acima para testar a conexão com o Turso
          </Text>
        )}
      </ScrollView>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>ℹ️ Sobre o Teste:</Text>
        <Text style={styles.infoText}>
          Este teste verifica:
        </Text>
        <Text style={styles.infoText}>• Conexão com o backend</Text>
        <Text style={styles.infoText}>• Conexão do backend com o Turso</Text>
        <Text style={styles.infoText}>• Leitura de dados das tabelas</Text>
        <Text style={styles.infoText}>• Estado geral da base de dados</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  resultContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  resultText: {
    fontSize: 14,
    color: '#00ff00',
    fontFamily: 'Courier',
    lineHeight: 20,
  },
  noResult: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  info: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

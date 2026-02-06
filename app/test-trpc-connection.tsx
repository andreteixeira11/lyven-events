import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { trpcClient } from '@/lib/trpc';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TestTRPCConnectionScreen() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    console.log(message);
  };

  const testConnection = async () => {
    setIsLoading(true);
    setLogs([]);
    addLog('🧪 Iniciando teste de conexão tRPC...');

    try {
      addLog('📞 Testando rota example.hi...');
      const hiResult = await trpcClient.example.hi.mutate({ name: 'Admin Test' });
      addLog(`✅ Resposta recebida: ${JSON.stringify(hiResult)}`);

      addLog('📞 Testando login com admin...');
      const loginResult = await trpcClient.auth.login.mutate({
        email: 'geral@lyven.pt',
        password: 'Lyven12345678',
      });
      addLog(`✅ Login sucesso: ${JSON.stringify(loginResult, null, 2)}`);

    } catch (error) {
      addLog(`❌ Erro: ${error instanceof Error ? error.message : 'Unknown error'}`);
      if (error instanceof Error && error.stack) {
        addLog(`📚 Stack: ${error.stack}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Test tRPC Connection</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.testButton, isLoading && styles.buttonDisabled]}
        onPress={testConnection}
        disabled={isLoading}
      >
        <Text style={styles.testButtonText}>
          {isLoading ? 'A testar...' : 'Testar Conexão'}
        </Text>
      </TouchableOpacity>

      <ScrollView style={styles.logsContainer}>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>{log}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  testButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  logsContainer: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 12,
  },
  logText: {
    color: '#E5E5E5',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 4,
  },
});

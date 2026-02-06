import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';

export default function SetupDatabaseScreen() {
  const [loading, setLoading] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const runMigrations = async () => {
    setLoading(true);
    setLogs([]);
    addLog('🚀 Iniciando migrations...');

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/migrate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.text();
      addLog('✅ Migrations concluídas com sucesso!');
      addLog(result);
    } catch (error) {
      addLog(`❌ Erro ao executar migrations: ${error}`);
      console.error('Migration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const runSeed = async () => {
    setLoading(true);
    addLog('🌱 Iniciando seed...');

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/seed`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.text();
      addLog('✅ Seed concluído com sucesso!');
      addLog(result);
    } catch (error) {
      addLog(`❌ Erro ao executar seed: ${error}`);
      console.error('Seed error:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAll = async () => {
    setLoading(true);
    setLogs([]);
    
    addLog('🚀 Executando setup completo da base de dados...');
    await runMigrations();
    
    addLog('---');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await runSeed();
    
    addLog('🎉 Setup completo!');
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Setup Base de Dados' }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>🗄️ Setup Base de Dados Turso</Text>
        <Text style={styles.subtitle}>
          Configure as tabelas e dados iniciais
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={runAll}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>🚀 Executar Tudo</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, loading && styles.buttonDisabled]}
          onPress={runMigrations}
          disabled={loading}
        >
          <Text style={styles.buttonTextSecondary}>📋 Apenas Migrations</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, loading && styles.buttonDisabled]}
          onPress={runSeed}
          disabled={loading}
        >
          <Text style={styles.buttonTextSecondary}>🌱 Apenas Seed</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.logsContainer}>
        <Text style={styles.logsTitle}>📝 Logs:</Text>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logEntry}>
            {log}
          </Text>
        ))}
        {logs.length === 0 && (
          <Text style={styles.noLogs}>Nenhum log ainda. Clique num botão acima para começar.</Text>
        )}
      </ScrollView>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>ℹ️ Informação:</Text>
        <Text style={styles.infoText}>
          • Executar Tudo: Cria as tabelas e insere dados iniciais
        </Text>
        <Text style={styles.infoText}>
          • Apenas Migrations: Cria apenas a estrutura das tabelas
        </Text>
        <Text style={styles.infoText}>
          • Apenas Seed: Insere dados de exemplo (requer migrations)
        </Text>
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
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logsContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  logEntry: {
    fontSize: 12,
    color: '#00ff00',
    fontFamily: 'Courier',
    marginBottom: 4,
  },
  noLogs: {
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
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

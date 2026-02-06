import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';

export default function TestBackendScreen() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const testBaseUrl = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'N/A';
      addResult(`Base URL: ${baseUrl}`);
      addResult(`API URL: ${baseUrl}/api/trpc`);
    } catch (error) {
      addResult(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const testRootEndpoint = async () => {
    setLoading(true);
    
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      addResult(`Testando: ${baseUrl}/`);
      
      const response = await fetch(`${baseUrl}/`);
      const data = await response.json();
      
      addResult(`Status: ${response.status}`);
      addResult(`Resposta: ${JSON.stringify(data)}`);
    } catch (error) {
      addResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const testApiEndpoint = async () => {
    setLoading(true);
    
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      addResult(`Testando: ${baseUrl}/api`);
      
      const response = await fetch(`${baseUrl}/api`);
      const data = await response.json();
      
      addResult(`Status: ${response.status}`);
      addResult(`Resposta: ${JSON.stringify(data)}`);
    } catch (error) {
      addResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const testTrpcEndpoint = async () => {
    setLoading(true);
    
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const url = `${baseUrl}/api/trpc/auth.login`;
      addResult(`Testando: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'teste',
          password: 'teste'
        })
      });
      
      addResult(`Status: ${response.status}`);
      addResult(`Content-Type: ${response.headers.get('content-type')}`);
      
      const text = await response.text();
      addResult(`Resposta (texto): ${text.substring(0, 200)}`);
      
      try {
        const data = JSON.parse(text);
        addResult(`Resposta (JSON): ${JSON.stringify(data)}`);
      } catch {
        addResult(`⚠️ Resposta não é JSON válido`);
      }
    } catch (error) {
      addResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Teste de Backend</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={testBaseUrl}
          disabled={loading}
        >
          <Text style={styles.buttonText}>1. Ver URLs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={testRootEndpoint}
          disabled={loading}
        >
          <Text style={styles.buttonText}>2. Testar /</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={testApiEndpoint}
          disabled={loading}
        >
          <Text style={styles.buttonText}>3. Testar /api</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={testTrpcEndpoint}
          disabled={loading}
        >
          <Text style={styles.buttonText}>4. Testar tRPC Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.clearButton]}
          onPress={() => setResults([])}
        >
          <Text style={styles.clearButtonText}>Limpar Resultados</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        {results.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  buttonsContainer: {
    padding: 16,
    gap: 12,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  clearButton: {
    backgroundColor: '#666',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
    marginBottom: 8,
  },
});

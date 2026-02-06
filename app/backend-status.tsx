import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';

type TestResult = {
  name: string;
  status: 'success' | 'error' | 'pending';
  message?: string;
  details?: string;
};

export default function BackendStatusScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const insets = useSafeAreaInsets();

  const runTests = async () => {
    setIsLoading(true);
    setResults([]);
    
    const newResults: TestResult[] = [];
    
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'http://localhost:3000';
    
    newResults.push({
      name: 'Base URL',
      status: 'success',
      message: baseUrl,
    });
    setResults([...newResults]);

    try {
      console.log('🧪 Testing root endpoint...');
      const rootResponse = await fetch(`${baseUrl}/`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      
      if (rootResponse.ok) {
        const data = await rootResponse.json();
        newResults.push({
          name: 'Root Endpoint (/)',
          status: 'success',
          message: data.message || 'OK',
          details: JSON.stringify(data, null, 2),
        });
      } else {
        newResults.push({
          name: 'Root Endpoint (/)',
          status: 'error',
          message: `Status: ${rootResponse.status}`,
          details: await rootResponse.text(),
        });
      }
    } catch (error) {
      newResults.push({
        name: 'Root Endpoint (/)',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    setResults([...newResults]);

    try {
      console.log('🧪 Testing /api endpoint...');
      const apiResponse = await fetch(`${baseUrl}/api`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      
      if (apiResponse.ok) {
        const data = await apiResponse.json();
        newResults.push({
          name: 'API Endpoint (/api)',
          status: 'success',
          message: data.message || 'OK',
          details: JSON.stringify(data, null, 2),
        });
      } else {
        newResults.push({
          name: 'API Endpoint (/api)',
          status: 'error',
          message: `Status: ${apiResponse.status}`,
          details: await apiResponse.text(),
        });
      }
    } catch (error) {
      newResults.push({
        name: 'API Endpoint (/api)',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    setResults([...newResults]);

    try {
      console.log('🧪 Testing /api/health endpoint...');
      const healthResponse = await fetch(`${baseUrl}/api/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      
      if (healthResponse.ok) {
        const data = await healthResponse.json();
        newResults.push({
          name: 'Health Check (/api/health)',
          status: 'success',
          message: data.message || 'OK',
          details: JSON.stringify(data, null, 2),
        });
      } else {
        newResults.push({
          name: 'Health Check (/api/health)',
          status: 'error',
          message: `Status: ${healthResponse.status}`,
          details: await healthResponse.text(),
        });
      }
    } catch (error) {
      newResults.push({
        name: 'Health Check (/api/health)',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    setResults([...newResults]);

    try {
      console.log('🧪 Testing tRPC endpoint...');
      const trpcResponse = await fetch(`${baseUrl}/api/trpc/example.hi`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      
      if (trpcResponse.ok) {
        const data = await trpcResponse.json();
        newResults.push({
          name: 'tRPC Endpoint',
          status: 'success',
          message: 'tRPC is working',
          details: JSON.stringify(data, null, 2),
        });
      } else {
        newResults.push({
          name: 'tRPC Endpoint',
          status: 'error',
          message: `Status: ${trpcResponse.status}`,
          details: await trpcResponse.text(),
        });
      }
    } catch (error) {
      newResults.push({
        name: 'tRPC Endpoint',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    setResults([...newResults]);

    setIsLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getIcon = (status: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success':
        return <CheckCircle size={24} color="#10B981" />;
      case 'error':
        return <XCircle size={24} color="#EF4444" />;
      case 'pending':
        return <AlertCircle size={24} color="#F59E0B" />;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Status do Backend</Text>
        <TouchableOpacity onPress={runTests} disabled={isLoading} style={styles.refreshButton}>
          <RefreshCw size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {isLoading && results.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>A verificar conexão...</Text>
          </View>
        )}

        {results.map((result, index) => (
          <View key={index} style={styles.resultCard}>
            <View style={styles.resultHeader}>
              {getIcon(result.status)}
              <Text style={styles.resultName}>{result.name}</Text>
            </View>
            
            {result.message && (
              <Text style={styles.resultMessage}>{result.message}</Text>
            )}
            
            {result.details && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsLabel}>Detalhes:</Text>
                <Text style={styles.detailsText}>{result.details}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginLeft: 12,
    flex: 1,
  },
  resultMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  detailsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  detailsLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 12,
    color: '#374151',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});

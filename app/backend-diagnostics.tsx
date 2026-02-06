import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react-native';

type TestResult = {
  name: string;
  url: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: any;
};

export default function BackendDiagnosticsScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const insets = useSafeAreaInsets();

  const runDiagnostics = async () => {
    setIsLoading(true);
    const testResults: TestResult[] = [];

    const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;

    console.log('🔍 Running backend diagnostics...');
    console.log('🌐 Base URL:', baseUrl);

    testResults.push({
      name: 'Configuração Base URL',
      url: baseUrl || 'N/A',
      status: baseUrl ? 'success' : 'error',
      message: baseUrl ? `URL: ${baseUrl}` : 'Base URL não configurada',
      details: {
        envVar: process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'Não configurada',
      },
    });

    const endpoints = [
      { name: 'Root endpoint', path: '/' },
      { name: 'API endpoint', path: '/api' },
      { name: 'Health endpoint', path: '/api/health' },
      { name: 'Health alt endpoint', path: '/health' },
      { name: 'tRPC endpoint', path: '/api/trpc' },
    ];

    for (const endpoint of endpoints) {
      const url = `${baseUrl}${endpoint.path}`;
      
      try {
        console.log(`🧪 Testing: ${url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const contentType = response.headers.get('content-type') || '';
        let data: any = null;

        if (contentType.includes('application/json')) {
          try {
            data = await response.json();
          } catch {
            data = { error: 'Failed to parse JSON' };
          }
        } else {
          const text = await response.text();
          data = { text: text.substring(0, 200) };
        }

        testResults.push({
          name: endpoint.name,
          url,
          status: response.ok ? 'success' : 'error',
          message: `Status: ${response.status} ${response.statusText}`,
          details: {
            status: response.status,
            contentType,
            data,
          },
        });

        console.log(`✅ ${endpoint.name}: ${response.status}`);
      } catch (error) {
        console.error(`❌ ${endpoint.name} failed:`, error);
        
        testResults.push({
          name: endpoint.name,
          url,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: {
            error: error instanceof Error ? error.toString() : 'Unknown error',
            type: error?.constructor?.name || 'Unknown',
          },
        });
      }
    }

    try {
      const dbCheckUrl = `${baseUrl}/api/health`;
      console.log('🗄️ Checking database connection...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(dbCheckUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      console.log('📝 Health response status:', response.status);
      console.log('📝 Content-Type:', response.headers.get('content-type'));
      
      const contentType = response.headers.get('content-type') || '';
      
      if (response.ok) {
        if (contentType.includes('application/json')) {
          try {
            const text = await response.text();
            console.log('📝 Raw response text:', text.substring(0, 200));
            
            const data = JSON.parse(text);
            console.log('📝 Parsed data:', data);
            
            const dbStatus = data.database?.status;
            testResults.push({
              name: 'Database Status',
              url: dbCheckUrl,
              status: dbStatus === 'connected' ? 'success' : dbStatus === 'error' ? 'error' : 'warning',
              message: dbStatus === 'connected' 
                ? 'Base de dados conectada com sucesso' 
                : dbStatus === 'error' 
                ? `Erro na conexão: ${data.database?.error || 'Unknown error'}` 
                : 'Estado desconhecido',
              details: data,
            });
            console.log('✅ Database status:', dbStatus);
          } catch (parseError) {
            const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown error';
            console.error('❌ JSON parse error:', errorMessage);
            testResults.push({
              name: 'Database Status',
              url: dbCheckUrl,
              status: 'error',
              message: 'Resposta do servidor não é JSON válido',
              details: {
                error: errorMessage,
                contentType,
              },
            });
          }
        } else {
          const text = await response.text();
          console.log('📝 Non-JSON response:', text.substring(0, 200));
          testResults.push({
            name: 'Database Status',
            url: dbCheckUrl,
            status: 'error',
            message: 'Servidor não retornou JSON',
            details: {
              contentType,
              response: text.substring(0, 200),
            },
          });
        }
      } else {
        const text = await response.text();
        testResults.push({
          name: 'Database Status',
          url: dbCheckUrl,
          status: 'error',
          message: `Erro HTTP: ${response.status} ${response.statusText}`,
          details: {
            status: response.status,
            response: text.substring(0, 200),
          },
        });
      }
    } catch (error) {
      console.error('❌ Database check failed:', error);
      testResults.push({
        name: 'Database Status',
        url: 'N/A',
        status: 'error',
        message: 'Não foi possível verificar o estado da base de dados',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }

    setResults(testResults);
    setIsLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={24} color="#10B981" />;
      case 'error':
        return <XCircle size={24} color="#EF4444" />;
      case 'warning':
        return <AlertCircle size={24} color="#F59E0B" />;
      default:
        return <ActivityIndicator size="small" color={COLORS.primary} />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Diagnóstico do Backend</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={runDiagnostics}
          disabled={isLoading}
        >
          <RefreshCw size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {isLoading && results.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>A executar testes...</Text>
          </View>
        ) : (
          <>
            {results.map((result, index) => (
              <View key={index} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  {getStatusIcon(result.status)}
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{result.name}</Text>
                    <Text style={styles.resultUrl} numberOfLines={1}>
                      {result.url}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.resultMessage, { color: getStatusColor(result.status) }]}>
                  {result.message}
                </Text>

                {result.details && (
                  <View style={styles.detailsContainer}>
                    <Text style={styles.detailsTitle}>Detalhes:</Text>
                    <Text style={styles.detailsText}>
                      {JSON.stringify(result.details, null, 2)}
                    </Text>
                  </View>
                )}
              </View>
            ))}

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Resumo</Text>
              <Text style={styles.summaryText}>
                Sucessos: {results.filter(r => r.status === 'success').length}{'\n'}
                Erros: {results.filter(r => r.status === 'error').length}{'\n'}
                Avisos: {results.filter(r => r.status === 'warning').length}
              </Text>

              {results.filter(r => r.status === 'error').length > 0 && (
                <View style={styles.helpContainer}>
                  <Text style={styles.helpTitle}>💡 Possíveis soluções:</Text>
                  <Text style={styles.helpText}>
                    1. Verifique se o backend está a correr{'\n'}
                    2. Confirme que a URL está correta{'\n'}
                    3. Verifique a configuração de CORS no backend{'\n'}
                    4. Certifique-se de que o backend está acessível na rede
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  resultUrl: {
    fontSize: 12,
    color: '#666',
  },
  resultMessage: {
    fontSize: 14,
    fontWeight: '500' as const,
    marginBottom: 8,
  },
  detailsContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#666',
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 11,
    fontFamily: 'monospace' as const,
    color: '#374151',
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  helpContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#92400E',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
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
    fontWeight: 'bold' as const,
  },
});

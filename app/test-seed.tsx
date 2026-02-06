import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { ArrowLeft, PlayCircle, CheckCircle, XCircle } from 'lucide-react-native';
import { useTheme } from '@/hooks/theme-context';

export default function TestSeedScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);

  const runSeed = async () => {
    setLoading(true);
    setResult(null);
    setSuccess(null);

    try {
      const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/seed`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.text();
        setResult(data || 'Seed executado com sucesso!');
        setSuccess(true);
      } else {
        const error = await response.text();
        setResult(`Erro: ${error}`);
        setSuccess(false);
      }
    } catch (error: any) {
      setResult(`Erro ao executar seed: ${error.message}`);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Testar Seed</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              Executar Seed do Banco de Dados
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Este botão irá popular o banco de dados com dados de teste, incluindo:
            </Text>
            <Text style={[styles.listItem, { color: colors.textSecondary }]}>
              • Promotores (Live Nation, Everything is New, etc.)
            </Text>
            <Text style={[styles.listItem, { color: colors.textSecondary }]}>
              • Eventos de demonstração
            </Text>
            <Text style={[styles.listItem, { color: colors.textSecondary }]}>
              • Utilizador teste: João Silva (joao@teste.com)
            </Text>
            <Text style={[styles.listItem, { color: colors.textSecondary }]}>
              • Follows de teste (João segue 3 promotores)
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.runButton,
              { backgroundColor: loading ? colors.border : colors.primary },
            ]}
            onPress={runSeed}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <PlayCircle size={20} color="#fff" />
                <Text style={styles.runButtonText}>Executar Seed</Text>
              </>
            )}
          </TouchableOpacity>

          {result && (
            <View
              style={[
                styles.resultCard,
                {
                  backgroundColor: success ? colors.success : colors.error,
                },
              ]}
            >
              <View style={styles.resultHeader}>
                {success ? (
                  <CheckCircle size={24} color="#fff" />
                ) : (
                  <XCircle size={24} color="#fff" />
                )}
                <Text style={styles.resultTitle}>
                  {success ? 'Sucesso!' : 'Erro'}
                </Text>
              </View>
              <Text style={styles.resultText}>{result}</Text>
            </View>
          )}

          {success && (
            <View style={[styles.nextStepsCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.nextStepsTitle, { color: colors.text }]}>
                Próximos Passos
              </Text>
              <Text style={[styles.nextStepsText, { color: colors.textSecondary }]}>
                1. Faça login como utilizador teste (se ainda não estiver logado)
              </Text>
              <Text style={[styles.nextStepsText, { color: colors.textSecondary }]}>
                2. Vá até a página de Perfil
              </Text>
              <Text style={[styles.nextStepsText, { color: colors.textSecondary }]}>
                3. Clique em &quot;A seguir&quot;
              </Text>
              <Text style={[styles.nextStepsText, { color: colors.textSecondary }]}>
                4. Você deverá ver 3 promotores que o João segue
              </Text>
            </View>
          )}
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
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  listItem: {
    fontSize: 14,
    lineHeight: 24,
    marginLeft: 8,
  },
  runButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
  },
  runButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  resultCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  resultTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700' as const,
  },
  resultText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  nextStepsCard: {
    padding: 20,
    borderRadius: 12,
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  nextStepsText: {
    fontSize: 14,
    lineHeight: 24,
  },
});

import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TestEmailScreen() {
  const insets = useSafeAreaInsets();
  const [result, setResult] = useState<string>('');
  const [hasSent, setHasSent] = useState(false);
  
  const sendTestMutation = trpc.emails.sendTest.useMutation({
    onSuccess: (data) => {
      setResult('Email enviado com sucesso para info@lyven.pt!');
      Alert.alert('Sucesso', 'Email de teste enviado com sucesso!');
      console.log('Email enviado:', data);
    },
    onError: (error) => {
      setResult(`Erro ao enviar email: ${error.message}`);
      Alert.alert('Erro', `Falha ao enviar email: ${error.message}`);
      console.error('Erro:', error);
    },
  });

  useEffect(() => {
    if (!hasSent) {
      setResult('Enviando email...');
      sendTestMutation.mutate();
      setHasSent(true);
    }
  }, [hasSent]);

  const handleSendTest = () => {
    setResult('Enviando email...');
    sendTestMutation.mutate();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Teste de Email' }} />
      
      <View style={[styles.content, { paddingBottom: insets.bottom }]}>
        <Text style={styles.title}>Teste de Envio de Email</Text>
        <Text style={styles.description}>
          Clique no botão abaixo para enviar um email de teste para info@lyven.pt
        </Text>

        <TouchableOpacity
          style={[styles.button, sendTestMutation.isPending && styles.buttonDisabled]}
          onPress={handleSendTest}
          disabled={sendTestMutation.isPending}
        >
          {sendTestMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Enviar Email de Teste</Text>
          )}
        </TouchableOpacity>

        {result ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        ) : null}
      </View>
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
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});

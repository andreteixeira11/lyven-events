import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/trpc';
import { useUser } from '@/hooks/user-context';
import { useNotifications } from '@/hooks/notifications-context';

export default function TestNotificationScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { expoPushToken } = useNotifications();
  const [title, setTitle] = useState('🎉 Teste de Notificação');
  const [message, setMessage] = useState('Esta é uma notificação de teste!');

  const sendNotificationMutation = trpc.notifications.send.useMutation({
    onSuccess: (data) => {
      console.log('✅ Notificação enviada com sucesso:', data);
      Alert.alert(
        'Sucesso!',
        `Notificação enviada para ${data.sent} dispositivo(s)`
      );
    },
    onError: (error) => {
      console.error('❌ Erro ao enviar notificação:', error);
      Alert.alert('Erro', 'Falha ao enviar notificação: ' + error.message);
    },
  });

  const handleSendNotification = () => {
    if (!user?.id) {
      Alert.alert('Erro', 'Você precisa estar logado');
      return;
    }

    if (!expoPushToken) {
      Alert.alert(
        'Aviso',
        'Token de notificação não registrado. Você está usando o Expo Go em um dispositivo físico?'
      );
      return;
    }

    sendNotificationMutation.mutate({
      userId: user.id,
      type: 'system',
      title,
      message,
      data: { test: true, timestamp: Date.now() },
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Teste de Notificação Push',
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
        }}
      />
      <ScrollView style={[styles.content, { paddingTop: insets.top }]}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📱 Estado da Notificação</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User ID:</Text>
            <Text style={styles.infoValue}>{user?.id || 'Não logado'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Token:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {expoPushToken || 'Não registrado'}
            </Text>
          </View>
          {expoPushToken && (
            <View style={styles.successBadge}>
              <Text style={styles.successText}>✅ Pronto para receber notificações!</Text>
            </View>
          )}
          {!expoPushToken && (
            <View style={styles.warningBadge}>
              <Text style={styles.warningText}>
                ⚠️ Token não registrado. Use um dispositivo físico com Expo Go.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Enviar Notificação de Teste</Text>
          
          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Digite o título..."
            placeholderTextColor="#888"
          />

          <Text style={styles.label}>Mensagem</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            placeholder="Digite a mensagem..."
            placeholderTextColor="#888"
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!expoPushToken || sendNotificationMutation.isPending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendNotification}
            disabled={!expoPushToken || sendNotificationMutation.isPending}
          >
            <Text style={styles.sendButtonText}>
              {sendNotificationMutation.isPending ? '⏳ Enviando...' : '📤 Enviar Notificação'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📝 Instruções</Text>
          <Text style={styles.instructionText}>
            1. Certifique-se de estar usando o <Text style={styles.bold}>Expo Go</Text> em um{' '}
            <Text style={styles.bold}>dispositivo físico</Text>
          </Text>
          <Text style={styles.instructionText}>
            2. Conceda permissões de notificação quando solicitado
          </Text>
          <Text style={styles.instructionText}>
            3. O token deve aparecer acima como &quot;registrado&quot;
          </Text>
          <Text style={styles.instructionText}>
            4. Clique em &quot;Enviar Notificação&quot; para testar
          </Text>
          <Text style={styles.instructionText}>
            5. Você deve receber a notificação em alguns segundos
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            💡 <Text style={styles.bold}>Dica:</Text> Coloque o app em segundo plano para ver a
            notificação na bandeja de notificações do seu dispositivo.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#888',
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
  },
  successBadge: {
    backgroundColor: '#10b98120',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  successText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  warningBadge: {
    backgroundColor: '#f59e0b20',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  warningText: {
    color: '#f59e0b',
    fontSize: 12,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  instructionsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 12,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
    color: '#fff',
  },
  tipCard: {
    backgroundColor: '#8b5cf620',
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  tipText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
});

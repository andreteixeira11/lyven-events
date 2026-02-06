import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SeedAdminScreen() {
  const [log, setLog] = useState<string[]>([]);
  const insets = useSafeAreaInsets();

  const addLog = (message: string) => {
    setLog((prev) => [...prev, message]);
    console.log(message);
  };

  const seedAdmin = () => {
    addLog('⚠️ Esta funcionalidade deve ser executada no backend.');
    addLog('📝 Execute o script: bun backend/db/seed-admin.ts');
    addLog('');
    addLog('📋 Credenciais de admin:');
    addLog('   Email: geral@lyven.pt');
    addLog('   Password: Lyven12345678');
    
    Alert.alert(
      'Informação',
      'Esta funcionalidade deve ser executada no backend através do script seed-admin.ts.\n\nCredenciais:\nEmail: geral@lyven.pt\nPassword: Lyven12345678',
      [
        { text: 'OK' }
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Seed Admin User</Text>
        <Text style={styles.subtitle}>Criar utilizador administrador</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={seedAdmin}
      >
        <Text style={styles.buttonText}>Mostrar Info</Text>
      </TouchableOpacity>

      <ScrollView style={styles.logContainer}>
        {log.map((line, index) => (
          <Text key={index} style={styles.logText}>
            {line}
          </Text>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  button: {
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
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  logContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 15,
  },
  logText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: COLORS.text,
    marginBottom: 4,
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});

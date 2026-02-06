import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useState } from 'react';

export default function SeedNormalUserScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleSeed = async () => {
    setLoading(true);
    setResult('');
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/seed-normal-user`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult('✅ Utilizador criado com sucesso!\n\nCredenciais:\nEmail: user\nPassword: user');
        Alert.alert('Sucesso', 'Utilizador normal criado com sucesso!');
      } else {
        setResult(`❌ Erro: ${data.error || 'Erro desconhecido'}`);
        Alert.alert('Erro', data.error || 'Erro ao criar utilizador');
      }
    } catch (error) {
      console.error('Erro:', error);
      setResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      Alert.alert('Erro', 'Erro ao conectar ao backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Criar Utilizador Normal de Teste</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Credenciais que serão criadas:</Text>
          <Text style={styles.infoText}>Email: user</Text>
          <Text style={styles.infoText}>Password: user</Text>
          <Text style={styles.infoText}>Tipo: Normal (não promotor)</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSeed}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'A criar...' : 'Criar Utilizador'}
          </Text>
        </TouchableOpacity>

        {result !== '' && (
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
});

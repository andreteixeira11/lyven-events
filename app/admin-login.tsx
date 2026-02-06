import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react-native';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { trpcClient } from '@/lib/trpc';
import { useUser } from '@/hooks/user-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { updateUser } = useUser();
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, insira o email');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Erro', 'Por favor, insira a palavra-passe');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Attempting admin login with:', { email });
      
      console.log('🔍 Calling tRPC login...');
      const result = await trpcClient.auth.login.mutate({
        email,
        password,
      });
      
      console.log('✅ Login result:', result);

      if (result.success && result.user) {
        if (result.user.userType !== 'admin') {
          Alert.alert('Erro', 'Acesso negado. Esta área é restrita a administradores.');
          setIsLoading(false);
          return;
        }

        const adminUser = {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          userType: result.user.userType,
          interests: JSON.parse(result.user.interests),
          location: result.user.locationLatitude && result.user.locationLongitude ? {
            latitude: result.user.locationLatitude,
            longitude: result.user.locationLongitude,
            city: result.user.locationCity || '',
            region: result.user.locationRegion || '',
          } : undefined,
          preferences: {
            notifications: result.user.preferencesNotifications,
            language: result.user.preferencesLanguage,
            priceRange: {
              min: result.user.preferencesPriceMin,
              max: result.user.preferencesPriceMax,
            },
            eventTypes: JSON.parse(result.user.preferencesEventTypes),
          },
          following: {
            promoters: [],
            artists: [],
            friends: [],
          },
          favoriteEvents: JSON.parse(result.user.favoriteEvents),
          eventHistory: JSON.parse(result.user.eventHistory),
          createdAt: result.user.createdAt,
          isOnboardingComplete: result.user.isOnboardingComplete,
        };

        await updateUser(adminUser);
        Alert.alert('Sucesso', 'Login de administrador realizado com sucesso!');
        router.replace('/admin-dashboard');
      } else {
        Alert.alert('Erro', 'Credenciais inválidas');
      }
    } catch (error) {
      console.error('❌ Erro no login de admin:', error);
      console.error('❌ Erro detalhado:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Ocorreu um erro ao tentar fazer login.';
      
      if (error instanceof Error) {
        if (error.message.includes('JSON.parse')) {
          errorMessage = 'Erro de comunicação com o servidor. Verifique a conexão.';
          console.error('❌ Possível problema de CORS ou servidor não está a retornar JSON');
        } else if (error.message.includes('Credenciais inválidas')) {
          errorMessage = 'Email ou palavra-passe incorretos.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <ShieldCheck size={64} color={COLORS.primary} strokeWidth={1.5} />
          </View>
          
          <Image
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/r0eawa35sn5kfssq1aek9' }}
            style={styles.logoImage}
            resizeMode="contain"
          />
          
          <Text style={styles.title}>Área de Administração</Text>
          <Text style={styles.subtitle}>Acesso restrito</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Palavra-passe"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              {showPassword ? (
                <EyeOff size={20} color="#666" />
              ) : (
                <Eye size={20} color="#666" />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Aguarde...' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.diagnosticsButton}
            onPress={() => router.push('/backend-diagnostics')}
          >
            <Text style={styles.diagnosticsButtonText}>Diagnóstico do Backend</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 200,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    height: 50,
    color: COLORS.text,
    fontSize: 16,
  },
  eyeButton: {
    padding: 8,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold' as const,
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
  diagnosticsButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  diagnosticsButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500' as const,
  },
});

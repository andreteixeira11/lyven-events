import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Image,
} from 'react-native';

import { User, Mail, Eye, EyeOff, Building2 } from 'lucide-react-native';
import { useUser } from '@/hooks/user-context';
import { router } from 'expo-router';
import { RADIUS, SHADOWS, SPACING } from '@/constants/colors';
import { useTheme } from '@/hooks/theme-context';
import { trpc, getBaseUrl } from '@/lib/trpc';
import { handleError, AuthError, NetworkError } from '@/lib/error-handler';
import { LoadingSpinner } from '@/components/LoadingStates';

export default function LoginScreen() {
  const [userType, setUserType] = useState<'normal' | 'promoter'>('normal');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [backendReachable, setBackendReachable] = useState<boolean | null>(null);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const logoClickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { updateUser } = useUser();
  const { colors } = useTheme();
  
  // tRPC mutations
  const loginMutation = trpc.auth.login.useMutation();
  const sendCodeMutation = trpc.auth.sendVerificationCode.useMutation();

  const checkBackend = () => {
    setBackendReachable(null);
    const base = getBaseUrl();
    fetch(`${base}/api/health`, { method: 'GET' })
      .then((res) => setBackendReachable(res.ok))
      .catch(() => setBackendReachable(false));
  };

  useEffect(() => {
    let cancelled = false;
    const base = getBaseUrl();
    fetch(`${base}/api/health`, { method: 'GET' })
      .then((res) => { if (!cancelled) setBackendReachable(res.ok); })
      .catch(() => { if (!cancelled) setBackendReachable(false); });
    return () => { cancelled = true; };
  }, []);
  
  const saveUser = async (userData: any) => {
    await updateUser(userData);
  };
  
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoOpacity, logoScale, logoRotate]);

  const handleLogoPress = () => {
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);

    if (logoClickTimeout.current) {
      clearTimeout(logoClickTimeout.current);
    }

    if (newCount === 5) {
      router.push('/admin-dashboard');
      setLogoClickCount(0);
      return;
    }

    logoClickTimeout.current = setTimeout(() => {
      setLogoClickCount(0);
    }, 2000);
  };

  const handleAuth = async () => {
    setErrorMessage('');
    
    // Validation
    if (!email.trim()) {
      setErrorMessage('Por favor, insira um email');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Por favor, insira uma palavra-passe');
      return;
    }

    if (!isLogin && !name.trim()) {
      setErrorMessage('Por favor, insira o seu nome');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Por favor, insira um email válido');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // Use real tRPC authentication
        const result = await loginMutation.mutateAsync({
          email: email.trim().toLowerCase(),
          password: password,
        });

        if (result.success && result.user) {
          // Map backend user to frontend user format
          const userData = {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            userType: result.user.userType as 'normal' | 'promoter' | 'admin',
            isOnboardingComplete: result.user.isOnboardingComplete === 1,
            phone: result.user.phone || undefined,
            interests: result.user.interests ? JSON.parse(result.user.interests) : [],
            location: result.user.locationLatitude && result.user.locationLongitude ? {
              latitude: result.user.locationLatitude,
              longitude: result.user.locationLongitude,
              city: result.user.locationCity || undefined,
              region: result.user.locationRegion || undefined,
            } : undefined,
            preferences: {
              notifications: result.user.preferencesNotifications === 1,
              emailUpdates: true,
              shareData: false,
              language: result.user.preferencesLanguage || 'pt',
              priceRange: {
                min: result.user.preferencesPriceMin || 0,
                max: result.user.preferencesPriceMax || 1000,
              },
              eventTypes: result.user.preferencesEventTypes ? JSON.parse(result.user.preferencesEventTypes) : [],
            },
            favoriteEvents: result.user.favoriteEvents ? JSON.parse(result.user.favoriteEvents) : [],
            eventHistory: result.user.eventHistory ? JSON.parse(result.user.eventHistory) : [],
            following: {
              promoters: [],
              venues: [],
            },
            createdAt: result.user.createdAt || new Date().toISOString(),
          };

          await saveUser(userData);

          // Navigate based on user type
          if (result.user.userType === 'admin' || result.user.email === 'geral@lyven.pt') {
            router.replace('/admin-dashboard');
          } else {
            router.replace('/(tabs)');
          }
        } else {
          setErrorMessage('Credenciais inválidas. Verifica o email e palavra-passe.');
        }
      } else {
        // Registration flow
        if (userType === 'promoter') {
          Alert.alert(
            'Registo de Promotor',
            'O registo de promotores deve ser realizado na plataforma web. Por favor, aceda à plataforma de gestão para criar a sua conta de promotor.',
            [{ text: 'OK' }]
          );
          setIsLoading(false);
          return;
        }
        
        if (email.toLowerCase() === 'admin' || email.toLowerCase() === 'geral@lyven.pt') {
          setErrorMessage('Este email não pode ser usado para registo.');
          setIsLoading(false);
          return;
        }

        // Send verification code to email, then navigate to verify screen
        const sendResult = await sendCodeMutation.mutateAsync({
          email: email.trim().toLowerCase(),
          name: name.trim(),
          password,
        });

        if (sendResult?.success) {
          router.push({
            pathname: '/verify-email',
            params: {
              email: email.trim().toLowerCase(),
              name: name.trim(),
              password,
            },
          });
        }
      }
    } catch (error) {
      console.error('❌ Erro durante autenticação:', error);
      let errorMessage = handleError(error);
      if (errorMessage.includes('Cannot reach the server')) {
        const base = getBaseUrl();
        const isLocalhost = base.includes('localhost') || base.includes('127.0.0.1');
        errorMessage += ` (Backend: ${base}).`;
        if (isLocalhost) {
          errorMessage += ' Start backend: npm run start:all (or npm run start:backend in another terminal).';
          errorMessage += ' On phone? Use your PC IP in .env instead of localhost, then restart Expo.';
        }
      }
      setErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.gradient, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {backendReachable === false && (
              <View style={[styles.backendBanner, { backgroundColor: colors.error + '20', borderColor: colors.error }]}>
                <Text style={[styles.backendBannerTitle, { color: colors.error }]}>Serviço temporariamente indisponível</Text>
                <Text style={[styles.backendBannerText, { color: colors.text }]}>
                  O que pode fazer agora: aguarde um momento e toque em "Tentar novamente" abaixo. Se continuar, tente mais tarde ou contacte o suporte.
                </Text>
                <TouchableOpacity
                  style={[styles.retryBackendButton, { backgroundColor: colors.primary }]}
                  onPress={checkBackend}
                >
                  <Text style={styles.retryBackendButtonText}>Tentar novamente</Text>
                </TouchableOpacity>
                <Text style={[styles.backendBannerSubtext, { color: colors.textSecondary }]}>
                  (Para programadores: Backend {getBaseUrl()} — No PC: npm run start:all. No telemóvel: use o IP do PC em .env e reinicie o Expo.)
                </Text>
              </View>
            )}
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={handleLogoPress}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={[
                    styles.logoContainer,
                    {
                      opacity: logoOpacity,
                      transform: [
                        { scale: logoScale },
                      ],
                    },
                  ]}
                >
                  <Image
                    source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/r0eawa35sn5kfssq1aek9' }}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.userTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    userType === 'normal' && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => {
                    setUserType('normal');
                    setIsLogin(true);
                  }}
                >
                  <User size={20} color={userType === 'normal' ? colors.white : colors.primary} />
                  <Text
                    style={[
                      styles.userTypeText,
                      { color: colors.primary },
                      userType === 'normal' && { color: colors.white },
                    ]}
                  >
                    Utilizador
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    userType === 'promoter' && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => {
                    setUserType('promoter');
                    setIsLogin(true);
                  }}
                >
                  <Building2 size={20} color={userType === 'promoter' ? colors.white : colors.primary} />
                  <Text
                    style={[
                      styles.userTypeText,
                      { color: colors.primary },
                      userType === 'promoter' && { color: colors.white },
                    ]}
                  >
                    Promotor
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Mail size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Email"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {!isLogin && userType === 'normal' && (
                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <User size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Nome completo"
                    placeholderTextColor={colors.textSecondary}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.inputIcon}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Palavra-passe"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
              </View>

              {isLogin && (
                <TouchableOpacity
                  style={styles.forgotPasswordButton}
                  onPress={() => router.push('/forgot-password')}
                >
                  <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Esqueceu a palavra-passe?</Text>
                </TouchableOpacity>
              )}

              {errorMessage ? (
                <View style={[styles.errorContainer, { backgroundColor: colors.error + '15', borderColor: colors.error + '30' }]}>
                  <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }, isLoading && styles.buttonDisabled]}
                onPress={handleAuth}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.buttonLoading}>
                    <LoadingSpinner size="small" />
                    <Text style={[styles.buttonText, { color: colors.white, marginLeft: 8 }]}>
                      Aguarde...
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.buttonText, { color: colors.white }]}>
                    {isLogin ? 'Entrar' : 'Criar Conta'}
                  </Text>
                )}
              </TouchableOpacity>

              {userType === 'normal' && (
                <TouchableOpacity
                  style={styles.switchButton}
                  onPress={() => setIsLogin(!isLogin)}
                >
                  <Text style={[styles.switchText, { color: colors.text }]}>
                    {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
                    <Text style={[styles.switchTextBold, { color: colors.primary }]}>
                      {isLogin ? 'Criar conta' : 'Entrar'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              )}

              {userType === 'promoter' && !isLogin && (
                <View style={[styles.promoterInfoBox, { backgroundColor: colors.warning + '15', borderColor: colors.warning + '30' }]}>
                  <Building2 size={16} color={colors.warning} />
                  <Text style={[styles.promoterInfoText, { color: colors.warning }]}>
                    Promotores devem registar-se na plataforma web
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  backendBanner: {
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
  },
  backendBannerTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: SPACING.sm,
  },
  backendBannerText: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: SPACING.xs,
  },
  retryBackendButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  retryBackendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  backendBannerSubtext: {
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  logoImage: {
    width: 300,
    height: 120,
  },
  form: {
    width: '100%',
  },
  userTypeContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
    height: 56,
    borderWidth: 1.5,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  userTypeText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    ...SHADOWS.sm,
  },
  inputIcon: {
    marginRight: SPACING.md,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    outlineStyle: 'none' as const,
  },
  button: {
    borderRadius: RADIUS.md,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
    ...SHADOWS.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  switchButton: {
    marginTop: SPACING.xxxl,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
  },
  switchTextBold: {
    fontWeight: '600' as const,
  },
  promoterInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginTop: SPACING.xxl,
    gap: SPACING.md,
    borderWidth: 1,
  },
  promoterInfoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.sm,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  errorContainer: {
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center' as const,
  },
  buttonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, LogBox, Platform, View, Text } from "react-native";
import { CartProvider } from "@/hooks/cart-context";
import { UserProvider } from "@/hooks/user-context";
import { FavoritesContext } from "@/hooks/favorites-context";
import { CalendarProvider } from "@/hooks/calendar-context";
import { SocialProvider } from "@/hooks/social-context";
import { NotificationsContext } from "@/hooks/notifications-context";
import { ThemeProvider, useTheme } from "@/hooks/theme-context";
import { OfflineProvider } from "@/hooks/offline-context";
import { I18nProvider, useI18n } from "@/hooks/i18n-context";

import ErrorBoundary from "@/components/ErrorBoundary";

try {
  LogBox.ignoreLogs([
    'deep imports from the "react-native" package are deprecated',
  ]);
} catch (_logBoxError) {
  console.warn('LogBox not available');
}

let queryClient: QueryClient;
try {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: (failureCount, error) => {
          const msg = (error as Error)?.message?.toLowerCase() ?? '';
          if (msg.includes('404') || msg.includes('não disponível') || msg.includes('não retornou')) {
            return false;
          }
          return failureCount < 1;
        },
        refetchOnMount: false,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
} catch (error) {
  console.error('Failed to create QueryClient:', error);
  queryClient = new QueryClient();
}

function RootLayoutNav() {
  const { colors } = useTheme();
  const { t } = useI18n();
  
  const safeT = (key: string, fallback?: string): string => {
    try {
      const result = t(key);
      return (typeof result === 'string' && result) ? result : (fallback || key);
    } catch {
      return fallback || key;
    }
  };
  
  return (
    <Stack screenOptions={{ 
      headerBackTitle: safeT('common.back', 'Voltar'),
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: colors.white,
      headerTitleStyle: {
        fontWeight: 'bold' as const,
        color: colors.white,
      },
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="event/[id]" options={{ title: safeT('events.eventDetails', 'Detalhes'), presentation: 'card' }} />
      <Stack.Screen name="checkout" options={{ title: safeT('checkout.checkout', 'Checkout'), presentation: 'modal' }} />
      <Stack.Screen name="login" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="verify-email" options={{ title: 'Verificar Email', presentation: 'card' }} />
      <Stack.Screen name="my-tickets" options={{ title: safeT('tickets.myTickets', 'Bilhetes'), presentation: 'card' }} />
      <Stack.Screen name="promoter-dashboard" options={{ title: safeT('promoter.dashboard', 'Dashboard'), presentation: 'card' }} />
      <Stack.Screen name="analytics" options={{ title: safeT('promoter.statistics', 'Estatísticas'), presentation: 'card' }} />
      <Stack.Screen name="my-events" options={{ title: safeT('promoter.myEvents', 'Eventos'), presentation: 'card' }} />
      <Stack.Screen name="followers" options={{ title: safeT('social.followers', 'Seguidores'), presentation: 'card' }} />
      <Stack.Screen name="following" options={{ title: 'A Seguir', presentation: 'card' }} />
      <Stack.Screen name="event-buyers/[id]" options={{ title: safeT('promoter.buyers', 'Compradores'), presentation: 'card' }} />
      <Stack.Screen name="qr-scanner/[id]" options={{ title: safeT('qrScanner.scanQR', 'Scan QR'), presentation: 'card' }} />
      <Stack.Screen name="create-event" options={{ title: safeT('events.createEvent', 'Criar Evento'), presentation: 'modal', gestureEnabled: false }} />
      <Stack.Screen name="admin-dashboard" options={{ title: safeT('admin.adminDashboard', 'Admin'), presentation: 'card' }} />
      <Stack.Screen name="admin-approvals" options={{ title: safeT('admin.pendingApprovals', 'Aprovações'), presentation: 'card' }} />
      <Stack.Screen name="admin-users" options={{ title: safeT('admin.userManagement', 'Utilizadores'), presentation: 'card' }} />
      <Stack.Screen name="admin-analytics" options={{ title: safeT('admin.analytics', 'Analytics'), presentation: 'card' }} />
      <Stack.Screen name="admin-events" options={{ title: safeT('admin.eventManagement', 'Eventos'), presentation: 'card' }} />
      <Stack.Screen name="admin-promoters" options={{ title: safeT('admin.promoterManagement', 'Promotores'), presentation: 'card' }} />
      <Stack.Screen name="admin-settings" options={{ title: safeT('settings.settings', 'Definições'), presentation: 'card' }} />
      <Stack.Screen name="settings" options={{ title: safeT('settings.settings', 'Definições'), presentation: 'card' }} />
      <Stack.Screen name="notifications" options={{ title: safeT('notifications.notifications', 'Notificações'), presentation: 'card' }} />
      <Stack.Screen name="help" options={{ title: safeT('help.help', 'Ajuda'), presentation: 'card' }} />
      <Stack.Screen name="faq" options={{ title: safeT('help.faq', 'FAQ'), presentation: 'card' }} />
      <Stack.Screen name="ad-purchase" options={{ title: safeT('ads.purchaseAd', 'Anúncios'), presentation: 'modal' }} />
      <Stack.Screen name="promoter-event/[id]" options={{ title: safeT('promoter.manageEvent', 'Gerir Evento'), presentation: 'card' }} />
      <Stack.Screen name="promoter/[id]" options={{ title: 'Promotor', presentation: 'card' }} />
      <Stack.Screen name="edit-profile" options={{ title: safeT('profile.editProfile', 'Editar Perfil'), presentation: 'card' }} />
      <Stack.Screen name="security" options={{ title: safeT('profile.security', 'Segurança'), presentation: 'card' }} />
      <Stack.Screen name="email-preferences" options={{ title: safeT('profile.emailPreferences', 'Email'), presentation: 'card' }} />
      <Stack.Screen name="ticket-details/[id]" options={{ title: safeT('tickets.ticketDetails', 'Bilhete'), presentation: 'card' }} />
      <Stack.Screen name="buyer-details/[id]" options={{ title: safeT('promoter.buyerDetails', 'Comprador'), presentation: 'card' }} />
      <Stack.Screen name="forgot-password" options={{ title: safeT('auth.resetPassword', 'Recuperar Palavra-passe'), presentation: 'card' }} />
      <Stack.Screen name="admin-login" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="theme-settings" options={{ title: safeT('theme.title', 'Tema'), presentation: 'card' }} />
      <Stack.Screen name="language" options={{ title: 'Idioma', presentation: 'card' }} />
      <Stack.Screen name="payment-methods" options={{ title: 'Métodos de Pagamento', presentation: 'card' }} />
      <Stack.Screen name="seed-admin" options={{ title: 'Create Admin', presentation: 'card' }} />
      <Stack.Screen name="seed-normal-user" options={{ title: 'Create User', presentation: 'card' }} />
      <Stack.Screen name="test-backend" options={{ title: 'Test Backend', presentation: 'card' }} />
      <Stack.Screen name="test-email" options={{ title: 'Test Email', presentation: 'card' }} />
      <Stack.Screen name="test-create-user" options={{ title: 'Test Create User', presentation: 'card' }} />
      <Stack.Screen name="test-notification" options={{ title: 'Test Notification', presentation: 'card' }} />
      <Stack.Screen name="test-seed" options={{ title: 'Test Seed', presentation: 'card' }} />
      <Stack.Screen name="test-trpc-connection" options={{ title: 'Test TRPC', presentation: 'card' }} />
      <Stack.Screen name="test-turso-connection" options={{ title: 'Test Turso', presentation: 'card' }} />
      <Stack.Screen name="backend-diagnostics" options={{ title: 'Diagnósticos', presentation: 'card' }} />
      <Stack.Screen name="backend-status" options={{ title: 'Backend Status', presentation: 'card' }} />
      <Stack.Screen name="setup-database" options={{ title: 'Setup Database', presentation: 'card' }} />
      <Stack.Screen name="login-teste" options={{ title: 'Login Teste', presentation: 'card' }} />
      <Stack.Screen name="get-users" options={{ title: 'Utilizadores', presentation: 'card' }} />
      <Stack.Screen name="users-list" options={{ title: 'Lista de Utilizadores', presentation: 'card' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  crashFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#0F0F0F',
  },
  crashTitle: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    color: '#F9FAFB',
    marginBottom: 12,
    textAlign: 'center' as const,
  },
  crashMessage: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center' as const,
    lineHeight: 22,
  },
});

function GlobalErrorHandler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      const originalHandler = ErrorUtils?.getGlobalHandler?.();
      ErrorUtils?.setGlobalHandler?.((error: Error, isFatal?: boolean) => {
        console.error('Global error caught:', error?.message || error);
        console.error('Is fatal:', isFatal);
        if (originalHandler) {
          originalHandler(error, isFatal);
        }
      });
    }
  }, []);

  return <>{children}</>;
}

function SafeProvider({ 
  Provider, 
  children 
}: { 
  Provider: React.ComponentType<{ children: React.ReactNode }>; 
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary fallback={<>{children}</>}>
      <Provider>{children}</Provider>
    </ErrorBoundary>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GlobalErrorHandler>
        <QueryClientProvider client={queryClient}>
            <I18nProvider>
              <ThemeProvider>
                <SafeProvider Provider={OfflineProvider}>
                  <UserProvider>
                    <ErrorBoundary fallback={
                      <GestureHandlerRootView style={styles.container}>
                        <View style={styles.crashFallback}>
                          <Text style={styles.crashTitle}>Erro ao iniciar</Text>
                          <Text style={styles.crashMessage}>A aplicação encontrou um problema. Tente fechar e abrir novamente.</Text>
                        </View>
                      </GestureHandlerRootView>
                    }>
                      <SafeProvider Provider={NotificationsContext}>
                        <SafeProvider Provider={FavoritesContext}>
                          <SafeProvider Provider={CalendarProvider}>
                            <SafeProvider Provider={SocialProvider}>
                              <SafeProvider Provider={CartProvider}>
                                <GestureHandlerRootView style={styles.container}>
                                  <RootLayoutNav />
                                </GestureHandlerRootView>
                              </SafeProvider>
                            </SafeProvider>
                          </SafeProvider>
                        </SafeProvider>
                      </SafeProvider>
                    </ErrorBoundary>
                  </UserProvider>
                </SafeProvider>
              </ThemeProvider>
            </I18nProvider>
        </QueryClientProvider>
      </GlobalErrorHandler>
    </ErrorBoundary>
  );
}
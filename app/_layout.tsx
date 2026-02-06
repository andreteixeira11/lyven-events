import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, LogBox } from "react-native";
import { CartProvider } from "@/hooks/cart-context";
import { UserProvider } from "@/hooks/user-context";
import { FavoritesContext } from "@/hooks/favorites-context";
import { CalendarProvider } from "@/hooks/calendar-context";
import { SocialProvider } from "@/hooks/social-context";
import { NotificationsContext } from "@/hooks/notifications-context";
import { ThemeProvider, useTheme } from "@/hooks/theme-context";
import { OfflineProvider } from "@/hooks/offline-context";
import { I18nProvider, useI18n } from "@/hooks/i18n-context";
import { trpc, trpcReactClient } from "@/lib/trpc";

LogBox.ignoreLogs([
  'deep imports from the "react-native" package are deprecated',
]);



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});

function RootLayoutNav() {
  const { colors } = useTheme();
  const { t } = useI18n();
  
  return (
    <Stack screenOptions={{ 
      headerBackTitle: t('common.back'),
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
      <Stack.Screen 
        name="event/[id]" 
        options={{ 
          title: t('events.eventDetails'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="checkout" 
        options={{ 
          title: t('checkout.checkout'),
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="onboarding" 
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="my-tickets" 
        options={{ 
          title: t('tickets.myTickets'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="promoter-dashboard" 
        options={{ 
          title: t('promoter.dashboard'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="analytics" 
        options={{ 
          title: t('promoter.statistics'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="my-events" 
        options={{ 
          title: t('promoter.myEvents'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="followers" 
        options={{ 
          title: t('social.followers'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="event-buyers/[id]" 
        options={{ 
          title: t('promoter.buyers'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="qr-scanner/[id]" 
        options={{ 
          title: t('qrScanner.scanQR'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="create-event" 
        options={{ 
          title: t('events.createEvent'),
          presentation: 'modal',
          gestureEnabled: false
        }} 
      />
      <Stack.Screen 
        name="admin-dashboard" 
        options={{ 
          title: t('admin.adminDashboard'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="admin-approvals" 
        options={{ 
          title: t('admin.pendingApprovals'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="admin-users" 
        options={{ 
          title: t('admin.userManagement'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="admin-analytics" 
        options={{ 
          title: t('admin.analytics'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="admin-events" 
        options={{ 
          title: t('admin.eventManagement'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="admin-promoters" 
        options={{ 
          title: t('admin.promoterManagement'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="admin-settings" 
        options={{ 
          title: t('settings.settings'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: t('settings.settings'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="notifications" 
        options={{ 
          title: t('notifications.notifications'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="help" 
        options={{ 
          title: t('help.help'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="faq" 
        options={{ 
          title: t('help.faq'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="ad-purchase" 
        options={{ 
          title: t('ads.purchaseAd'),
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="promoter-event/[id]" 
        options={{ 
          title: t('promoter.manageEvent'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="edit-profile" 
        options={{ 
          title: t('profile.editProfile'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="security" 
        options={{ 
          title: t('profile.security'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="email-preferences" 
        options={{ 
          title: t('profile.emailPreferences'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="test-backend" 
        options={{ 
          title: 'Test Backend',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="test-email" 
        options={{ 
          title: 'Test Email',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="ticket-details/[id]" 
        options={{ 
          title: t('tickets.ticketDetails'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="buyer-details/[id]" 
        options={{ 
          title: t('promoter.buyerDetails'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="forgot-password" 
        options={{ 
          title: t('auth.resetPassword'),
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="admin-login" 
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="seed-admin" 
        options={{ 
          title: 'Create Admin',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="theme-settings" 
        options={{ 
          title: t('theme.title'),
          presentation: 'card'
        }} 
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function RootLayout() {
  return (
    <trpc.Provider client={trpcReactClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <ThemeProvider>
            <OfflineProvider>
              <UserProvider>
                <NotificationsContext>
                  <FavoritesContext>
                    <CalendarProvider>
                      <SocialProvider>
                        <CartProvider>
                          <GestureHandlerRootView style={styles.container}>
                            <RootLayoutNav />
                          </GestureHandlerRootView>
                        </CartProvider>
                      </SocialProvider>
                    </CalendarProvider>
                  </FavoritesContext>
                </NotificationsContext>
              </UserProvider>
            </OfflineProvider>
          </ThemeProvider>
        </I18nProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useUser } from '@/hooks/user-context';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useUser();

  useEffect(() => {
    // Defer navigation to prevent hydration timeout
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (!user) {
          router.replace('/login');
        } else if (!user.isOnboardingComplete) {
          router.replace('/onboarding');
        }
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  if (!user || !user.isOnboardingComplete) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});
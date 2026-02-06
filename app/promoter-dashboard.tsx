import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import PromoterDashboard from '@/components/PromoterDashboard';
import AuthGuard from '@/components/AuthGuard';
import { useUser } from '@/hooks/user-context';

function PromoterDashboardScreenContent() {
  const { user } = useUser();

  if (!user || user.userType !== 'promoter') {
    return null;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Painel do Promotor',
          headerStyle: {
            backgroundColor: '#0099a8'
          },
          headerTintColor: '#FFFFFF'
        }} 
      />
      <PromoterDashboard promoterId={user.id} />
    </View>
  );
}

export default function PromoterDashboardScreen() {
  return (
    <AuthGuard>
      <PromoterDashboardScreenContent />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  }
});
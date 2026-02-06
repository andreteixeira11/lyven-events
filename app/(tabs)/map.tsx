import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import EventMap from '@/components/EventMap';
import AuthGuard from '@/components/AuthGuard';
import { COLORS } from '@/constants/colors';

function MapScreenContent() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Mapa de Eventos',
          headerStyle: {
            backgroundColor: COLORS.header
          },
          headerTintColor: COLORS.headerText,
          headerTitleStyle: {
            fontWeight: 'bold' as const
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 8 }}>
              <ArrowLeft size={24} color={COLORS.headerText} />
            </TouchableOpacity>
          )
        }} 
      />
      <EventMap />
    </View>
  );
}

export default function MapScreen() {
  return (
    <AuthGuard>
      <MapScreenContent />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  }
});
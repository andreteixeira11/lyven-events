import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { MapPin, Navigation } from 'lucide-react-native';
import * as Location from 'expo-location';
import { COLORS } from '@/constants/colors';

interface LocationStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export default function LocationStep({ data, onUpdate }: LocationStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const currentLocation = data.location;

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const requestLocation = async () => {
    setIsLoading(true);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        if (Platform.OS === 'web') {
          console.log('Permissão de localização negada');
        } else {
          Alert.alert(
            'Permissão Negada',
            'Para mostrar eventos perto de si, precisamos de acesso à sua localização.'
          );
        }
        return;
      }

      setHasPermission(true);
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        city: address[0]?.city || 'Cidade desconhecida',
        region: address[0]?.region || 'Região desconhecida',
      };

      onUpdate({ location: locationData });
      
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      if (Platform.OS === 'web') {
        console.log('Erro ao obter localização');
      } else {
        Alert.alert('Erro', 'Não foi possível obter a sua localização. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const skipLocation = () => {
    onUpdate({ location: null });
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MapPin size={64} color={COLORS.primary} />
      </View>

      <Text style={styles.description}>
        Permita-nos aceder à sua localização para mostrar eventos perto de si e 
        oferecer sugestões personalizadas baseadas na sua região.
      </Text>

      {currentLocation ? (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            📍 {currentLocation.city}, {currentLocation.region}
          </Text>
          <TouchableOpacity
            style={styles.changeButton}
            onPress={requestLocation}
            disabled={isLoading}
          >
            <Text style={styles.changeButtonText}>
              Alterar localização
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={requestLocation}
            disabled={isLoading}
          >
            <Navigation size={20} color={COLORS.white} />
            <Text style={styles.buttonText}>
              {isLoading ? 'Obtendo localização...' : 'Permitir Localização'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={skipLocation}
          >
            <Text style={styles.secondaryButtonText}>
              Pular por agora
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.note}>
        Pode alterar esta configuração a qualquer momento nas definições da aplicação.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  iconContainer: {
    marginBottom: 30,
  },
  description: {
    fontSize: 16,
    color: COLORS.black,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  locationInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  locationText: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '600' as const,
    marginBottom: 16,
  },
  changeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 20,
    marginTop: 8,
  },
  changeButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  buttons: {
    width: '100%',
    gap: 16,
    marginBottom: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 24,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  secondaryButtonText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  note: {
    fontSize: 12,
    color: COLORS.black,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 40,
  },
});
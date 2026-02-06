import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import { MapPin } from 'lucide-react-native';

interface LocationStepProps {
  venue: string;
  address: string;
  onVenueChange: (text: string) => void;
  onAddressChange: (text: string) => void;
}

export default function LocationStep({
  venue,
  address,
  onVenueChange,
  onAddressChange,
}: LocationStepProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Localização</Text>
      <Text style={styles.subtitle}>
        Onde será realizado o seu evento?
      </Text>

      <View style={styles.inputContainer}>
        <View style={styles.inputLabel}>
          <MapPin size={20} color="#0099a8" />
          <Text style={styles.inputLabelText}>Local/Venue *</Text>
        </View>
        <TextInput
          style={styles.input}
          value={venue}
          onChangeText={onVenueChange}
          placeholder="Ex: Coliseu dos Recreios"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputLabel}>
          <MapPin size={20} color="#0099a8" />
          <Text style={styles.inputLabelText}>Endereço *</Text>
        </View>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={onAddressChange}
          placeholder="Endereço completo do evento"
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  inputLabelText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
});

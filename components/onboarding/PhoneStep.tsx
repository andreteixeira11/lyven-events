import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { Smartphone, ChevronDown, Search, X } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';

interface Country {
  name: string;
  code: string;
  dial: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  { name: 'Portugal', code: 'PT', dial: '+351', flag: '🇵🇹' },
  { name: 'Brasil', code: 'BR', dial: '+55', flag: '🇧🇷' },
  { name: 'Angola', code: 'AO', dial: '+244', flag: '🇦🇴' },
  { name: 'Moçambique', code: 'MZ', dial: '+258', flag: '🇲🇿' },
  { name: 'Cabo Verde', code: 'CV', dial: '+238', flag: '🇨🇻' },
  { name: 'Espanha', code: 'ES', dial: '+34', flag: '🇪🇸' },
  { name: 'França', code: 'FR', dial: '+33', flag: '🇫🇷' },
  { name: 'Reino Unido', code: 'GB', dial: '+44', flag: '🇬🇧' },
  { name: 'Alemanha', code: 'DE', dial: '+49', flag: '🇩🇪' },
  { name: 'Itália', code: 'IT', dial: '+39', flag: '🇮🇹' },
  { name: 'Estados Unidos', code: 'US', dial: '+1', flag: '🇺🇸' },
  { name: 'Canadá', code: 'CA', dial: '+1', flag: '🇨🇦' },
  { name: 'Suíça', code: 'CH', dial: '+41', flag: '🇨🇭' },
  { name: 'Bélgica', code: 'BE', dial: '+32', flag: '🇧🇪' },
  { name: 'Luxemburgo', code: 'LU', dial: '+352', flag: '🇱🇺' },
  { name: 'Países Baixos', code: 'NL', dial: '+31', flag: '🇳🇱' },
].sort((a, b) => a.name.localeCompare(b.name));

interface PhoneStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export default function PhoneStep({ data, onUpdate }: PhoneStepProps) {
  const [phone, setPhone] = useState(data.phone || '');
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES.find(c => c.code === 'PT') || COUNTRIES[0]
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dial.includes(searchQuery)
  );

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setPhone(cleaned);
    onUpdate({ phone: selectedCountry.dial + cleaned });
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setModalVisible(false);
    setSearchQuery('');
    onUpdate({ phone: country.dial + phone });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Smartphone size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.description}>
          Adicione o seu número de telemóvel para recuperação de conta e notificações importantes
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.prefixContainer}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.flagText}>{selectedCountry.flag}</Text>
          <Text style={styles.prefixText}>{selectedCountry.dial}</Text>
          <ChevronDown size={16} color={COLORS.textSecondary} style={styles.chevron} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="9XX XXX XXX"
          placeholderTextColor={COLORS.textSecondary}
          value={phone}
          onChangeText={handlePhoneChange}
          keyboardType="phone-pad"
          maxLength={15}
        />
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione o país</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setSearchQuery('');
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Search size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Pesquisar país ou indicativo"
                placeholderTextColor={COLORS.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
            </View>

            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    selectedCountry.code === item.code && styles.countryItemSelected,
                  ]}
                  onPress={() => handleCountrySelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.countryFlag}>{item.flag}</Text>
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.countryDial}>{item.dial}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>🔒 Segurança</Text>
        <Text style={styles.infoText}>
          O seu número de telemóvel será usado apenas para:
        </Text>
        <Text style={styles.infoItem}>• Recuperação de conta</Text>
        <Text style={styles.infoItem}>• Notificações de bilhetes</Text>
        <Text style={styles.infoItem}>• Alertas de eventos</Text>
        <Text style={styles.infoSubtext}>
          Pode alterar isto mais tarde nas definições
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: 30,
    overflow: 'hidden',
  },
  prefixContainer: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRightWidth: 2,
    borderRightColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flagText: {
    fontSize: 24,
  },
  prefixText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  chevron: {
    marginLeft: 2,
  },
  input: {
    flex: 1,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  infoBox: {
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  infoItem: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  infoSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 12,
    fontStyle: 'italic' as const,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  countryItemSelected: {
    backgroundColor: `${COLORS.primary}15`,
  },
  countryFlag: {
    fontSize: 28,
    width: 40,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  countryDial: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600' as const,
  },
});

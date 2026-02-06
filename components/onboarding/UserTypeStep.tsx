import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Users } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';

interface UserTypeStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export default function UserTypeStep({ data, onUpdate }: UserTypeStepProps) {
  useEffect(() => {
    onUpdate({ userType: 'normal' });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.option}>
        <View style={styles.optionIcon}>
          <Users size={48} color={COLORS.primary} />
        </View>
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>
            Bem-vindo!
          </Text>
          <Text style={styles.optionDescription}>
            Descubra e compre bilhetes para eventos incríveis na sua região
          </Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          📱 Explore eventos locais
        </Text>
        <Text style={styles.infoText}>
          🎫 Compre bilhetes facilmente
        </Text>
        <Text style={styles.infoText}>
          ⭐ Guarde os seus favoritos
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    alignItems: 'center',
  },
  option: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 20,
    padding: 30,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: COLORS.primary,
    width: '100%',
  },
  optionIcon: {
    marginBottom: 20,
  },
  optionContent: {
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 16,
    color: COLORS.black,
    lineHeight: 24,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    gap: 16,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
});
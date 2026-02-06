import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Lock, Eye, EyeOff, Shield, Smartphone } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';

export default function Security() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Erro', 'Por favor preencha todos os campos');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Erro', 'A nova palavra-passe deve ter pelo menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As palavras-passe não coincidem');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert('Sucesso', 'Palavra-passe alterada com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
          },
        },
      ]);
    } catch {
      Alert.alert('Erro', 'Não foi possível alterar a palavra-passe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTwoFactor = (value: boolean) => {
    if (value) {
      Alert.alert(
        'Ativar Autenticação de Dois Fatores',
        'Será enviado um código de verificação para o seu email.',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Ativar',
            onPress: () => setTwoFactorEnabled(true),
          },
        ]
      );
    } else {
      Alert.alert(
        'Desativar Autenticação de Dois Fatores',
        'Tem certeza que deseja desativar esta funcionalidade de segurança?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Desativar',
            style: 'destructive',
            onPress: () => setTwoFactorEnabled(false),
          },
        ]
      );
    }
  };

  const handleToggleBiometric = (value: boolean) => {
    setBiometricEnabled(value);
    if (value) {
      Alert.alert('Sucesso', 'Autenticação biométrica ativada');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Segurança',
          headerStyle: { backgroundColor: COLORS.header },
          headerTintColor: COLORS.headerText,
          headerTitleStyle: { fontWeight: 'bold' as const },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={COLORS.headerText} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Alterar Palavra-passe</Text>
        <View style={styles.section}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Palavra-passe Atual</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Palavra-passe atual"
                placeholderTextColor={COLORS.black}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff size={20} color={COLORS.black} />
                ) : (
                  <Eye size={20} color={COLORS.black} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nova Palavra-passe</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nova palavra-passe (mín. 8 caracteres)"
                placeholderTextColor={COLORS.black}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff size={20} color={COLORS.black} />
                ) : (
                  <Eye size={20} color={COLORS.black} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmar Nova Palavra-passe</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirmar nova palavra-passe"
                placeholderTextColor={COLORS.black}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={COLORS.black} />
                ) : (
                  <Eye size={20} color={COLORS.black} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Lock size={20} color={COLORS.white} />
                <Text style={styles.buttonText}>Alterar Palavra-passe</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Autenticação Adicional</Text>
        <View style={styles.section}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Shield size={20} color={COLORS.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Autenticação de Dois Fatores</Text>
                <Text style={styles.settingSubtitle}>
                  Adicionar camada extra de segurança
                </Text>
              </View>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={handleToggleTwoFactor}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.separator} />

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Smartphone size={20} color={COLORS.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Autenticação Biométrica</Text>
                <Text style={styles.settingSubtitle}>
                  Use impressão digital ou Face ID
                </Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBiometric}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Shield size={16} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Use uma palavra-passe forte com letras, números e símbolos. Ative a
            autenticação de dois fatores para maior segurança.
          </Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: COLORS.headerText,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.header,
    marginTop: 8,
  },
  section: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.black,
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: COLORS.black,
  },
  eyeButton: {
    padding: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: COLORS.black,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  infoBox: {
    backgroundColor: `${COLORS.primary}15`,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 12,
    flexDirection: 'row',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primary,
    lineHeight: 20,
  },
  spacer: {
    height: 40,
  },
});
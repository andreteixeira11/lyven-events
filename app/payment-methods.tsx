import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  CreditCard,
  Building2,
  Smartphone,
  Mail,
  Check,
  Edit,
  Trash2,
  Star,
} from 'lucide-react-native';
import { useUser } from '@/hooks/user-context';
import { useTheme } from '@/hooks/theme-context';
import { trpc } from '@/lib/trpc';
import { scale as responsiveScale } from '@/utils/responsive-styles';

type PaymentMethodType = 'bank_transfer' | 'mbway' | 'paypal' | 'stripe';

interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  isPrimary: boolean;
  accountHolderName?: string | null;
  bankName?: string | null;
  iban?: string | null;
  swift?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  accountId?: string | null;
  isVerified: boolean;
}

export default function PaymentMethods() {
  const { user } = useUser();
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [selectedType, setSelectedType] = useState<PaymentMethodType>('bank_transfer');
  
  const [formData, setFormData] = useState({
    accountHolderName: '',
    bankName: '',
    iban: '',
    swift: '',
    phoneNumber: '',
    email: '',
    accountId: '',
  });

  const methodsQuery = trpc.paymentMethods.list.useQuery(
    { userId: user?.id || '' },
    { enabled: !!user?.id }
  );

  const createMutation = trpc.paymentMethods.create.useMutation({
    onSuccess: () => {
      methodsQuery.refetch();
      setModalVisible(false);
      resetForm();
      Alert.alert('Sucesso', 'Método de pagamento adicionado com sucesso!');
    },
    onError: (error) => {
      Alert.alert('Erro', error.message || 'Erro ao adicionar método de pagamento');
    },
  });

  const updateMutation = trpc.paymentMethods.update.useMutation({
    onSuccess: () => {
      methodsQuery.refetch();
      setModalVisible(false);
      setEditingMethod(null);
      resetForm();
      Alert.alert('Sucesso', 'Método de pagamento atualizado com sucesso!');
    },
    onError: (error) => {
      Alert.alert('Erro', error.message || 'Erro ao atualizar método de pagamento');
    },
  });

  const deleteMutation = trpc.paymentMethods.delete.useMutation({
    onSuccess: () => {
      methodsQuery.refetch();
      Alert.alert('Sucesso', 'Método de pagamento removido com sucesso!');
    },
    onError: (error) => {
      Alert.alert('Erro', error.message || 'Erro ao remover método de pagamento');
    },
  });

  const setPrimaryMutation = trpc.paymentMethods.setPrimary.useMutation({
    onSuccess: () => {
      methodsQuery.refetch();
      Alert.alert('Sucesso', 'Método principal definido com sucesso!');
    },
  });

  const resetForm = () => {
    setFormData({
      accountHolderName: '',
      bankName: '',
      iban: '',
      swift: '',
      phoneNumber: '',
      email: '',
      accountId: '',
    });
    setSelectedType('bank_transfer');
    setEditingMethod(null);
  };

  const handleAdd = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setSelectedType(method.type);
    setFormData({
      accountHolderName: method.accountHolderName || '',
      bankName: method.bankName || '',
      iban: method.iban || '',
      swift: method.swift || '',
      phoneNumber: method.phoneNumber || '',
      email: method.email || '',
      accountId: method.accountId || '',
    });
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Remover Método',
      'Tem certeza que deseja remover este método de pagamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => deleteMutation.mutate({ id }),
        },
      ]
    );
  };

  const handleSetPrimary = (id: string) => {
    if (!user?.id) return;
    setPrimaryMutation.mutate({ id, userId: user.id });
  };

  const handleSave = () => {
    if (!user?.id) return;

    const baseData = {
      userId: user.id,
      type: selectedType,
      ...formData,
    };

    if (editingMethod) {
      updateMutation.mutate({
        id: editingMethod.id,
        ...baseData,
      });
    } else {
      createMutation.mutate(baseData);
    }
  };

  const getMethodIcon = (type: PaymentMethodType) => {
    switch (type) {
      case 'bank_transfer':
        return Building2;
      case 'mbway':
        return Smartphone;
      case 'paypal':
        return Mail;
      case 'stripe':
        return CreditCard;
    }
  };

  const getMethodLabel = (type: PaymentMethodType) => {
    switch (type) {
      case 'bank_transfer':
        return 'Transferência Bancária';
      case 'mbway':
        return 'MB WAY';
      case 'paypal':
        return 'PayPal';
      case 'stripe':
        return 'Stripe';
    }
  };

  const getMethodDetails = (method: PaymentMethod) => {
    switch (method.type) {
      case 'bank_transfer':
        return method.iban || 'Não configurado';
      case 'mbway':
        return method.phoneNumber || 'Não configurado';
      case 'paypal':
        return method.email || 'Não configurado';
      case 'stripe':
        return method.accountId || 'Não configurado';
    }
  };

  const renderFormFields = () => {
    switch (selectedType) {
      case 'bank_transfer':
        return (
          <>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Nome do Titular</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                value={formData.accountHolderName}
                onChangeText={(text) => setFormData({ ...formData, accountHolderName: text })}
                placeholder="Nome completo"
                placeholderTextColor={`${colors.text}80`}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Nome do Banco</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                value={formData.bankName}
                onChangeText={(text) => setFormData({ ...formData, bankName: text })}
                placeholder="Ex: Millennium BCP"
                placeholderTextColor={`${colors.text}80`}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>IBAN</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                value={formData.iban}
                onChangeText={(text) => setFormData({ ...formData, iban: text })}
                placeholder="PT50 0000 0000 0000 0000 0000 0"
                placeholderTextColor={`${colors.text}80`}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>SWIFT/BIC (Opcional)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                value={formData.swift}
                onChangeText={(text) => setFormData({ ...formData, swift: text })}
                placeholder="BCOMPTPL"
                placeholderTextColor={`${colors.text}80`}
              />
            </View>
          </>
        );
      case 'mbway':
        return (
          <>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Nome do Titular</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                value={formData.accountHolderName}
                onChangeText={(text) => setFormData({ ...formData, accountHolderName: text })}
                placeholder="Nome completo"
                placeholderTextColor={`${colors.text}80`}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Número de Telefone</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                placeholder="+351 912 345 678"
                placeholderTextColor={`${colors.text}80`}
                keyboardType="phone-pad"
              />
            </View>
          </>
        );
      case 'paypal':
        return (
          <>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Nome do Titular</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                value={formData.accountHolderName}
                onChangeText={(text) => setFormData({ ...formData, accountHolderName: text })}
                placeholder="Nome completo"
                placeholderTextColor={`${colors.text}80`}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Email do PayPal</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="seu@email.com"
                placeholderTextColor={`${colors.text}80`}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </>
        );
      case 'stripe':
        return (
          <>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Nome do Titular</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                value={formData.accountHolderName}
                onChangeText={(text) => setFormData({ ...formData, accountHolderName: text })}
                placeholder="Nome completo"
                placeholderTextColor={`${colors.text}80`}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>ID da Conta Stripe</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                value={formData.accountId}
                onChangeText={(text) => setFormData({ ...formData, accountId: text })}
                placeholder="acct_xxxxxxxxxxxxx"
                placeholderTextColor={`${colors.text}80`}
                autoCapitalize="none"
              />
            </View>
          </>
        );
    }
  };

  if (methodsQuery.isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Métodos de Pagamento',
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.white,
            headerTitleStyle: { fontWeight: 'bold' as const },
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft size={responsiveScale(24)} color={colors.white} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  const methods = methodsQuery.data || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Métodos de Pagamento',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: 'bold' as const },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={responsiveScale(24)} color={colors.white} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Gerir Formas de Recebimento
          </Text>
          <Text style={[styles.headerSubtitle, { color: `${colors.text}80` }]}>
            Configure como deseja receber pagamentos dos seus eventos
          </Text>
        </View>

        {methods.length === 0 ? (
          <View style={styles.emptyState}>
            <CreditCard size={responsiveScale(48)} color={`${colors.text}40`} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              Nenhum método configurado
            </Text>
            <Text style={[styles.emptySubtext, { color: `${colors.text}80` }]}>
              Adicione um método para começar a receber pagamentos
            </Text>
          </View>
        ) : (
          <View style={styles.methodsList}>
            {methods.map((method: PaymentMethod) => {
              const Icon = getMethodIcon(method.type);
              return (
                <View key={method.id} style={[styles.methodCard, { backgroundColor: colors.card }]}>
                  <View style={styles.methodHeader}>
                    <View style={styles.methodInfo}>
                      <View style={[styles.methodIcon, { backgroundColor: `${colors.primary}20` }]}>
                        <Icon size={responsiveScale(20)} color={colors.primary} />
                      </View>
                      <View style={styles.methodText}>
                        <View style={styles.methodTitleRow}>
                          <Text style={[styles.methodTitle, { color: colors.text }]}>
                            {getMethodLabel(method.type)}
                          </Text>
                          {method.isPrimary && (
                            <View style={[styles.primaryBadge, { backgroundColor: colors.primary }]}>
                              <Star size={responsiveScale(10)} color={colors.white} fill={colors.white} />
                              <Text style={styles.primaryText}>Principal</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.methodDetails, { color: `${colors.text}80` }]}>
                          {getMethodDetails(method)}
                        </Text>
                        {method.isVerified && (
                          <View style={styles.verifiedBadge}>
                            <Check size={responsiveScale(12)} color="#4CAF50" />
                            <Text style={styles.verifiedText}>Verificado</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.methodActions}>
                    {!method.isPrimary && (
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: `${colors.primary}20` }]}
                        onPress={() => handleSetPrimary(method.id)}
                      >
                        <Star size={responsiveScale(16)} color={colors.primary} />
                        <Text style={[styles.actionText, { color: colors.primary }]}>
                          Definir como Principal
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: `${colors.primary}20` }]}
                      onPress={() => handleEdit(method)}
                    >
                      <Edit size={responsiveScale(16)} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#ff000020' }]}
                      onPress={() => handleDelete(method.id)}
                    >
                      <Trash2 size={responsiveScale(16)} color="#ff0000" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAdd}
        >
          <Plus size={responsiveScale(20)} color={colors.white} />
          <Text style={styles.addButtonText}>Adicionar Método</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          setEditingMethod(null);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingMethod ? 'Editar Método' : 'Adicionar Método'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setEditingMethod(null);
                  resetForm();
                }}
              >
                <Text style={[styles.modalClose, { color: colors.primary }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.typeSelector}>
                <Text style={[styles.label, { color: colors.text }]}>Tipo de Método</Text>
                <View style={styles.typeButtons}>
                  {(['bank_transfer', 'mbway', 'paypal', 'stripe'] as PaymentMethodType[]).map(
                    (type) => {
                      const Icon = getMethodIcon(type);
                      const isSelected = selectedType === type;
                      return (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.typeButton,
                            {
                              backgroundColor: isSelected ? colors.primary : colors.card,
                              borderColor: isSelected ? colors.primary : colors.border,
                            },
                          ]}
                          onPress={() => setSelectedType(type)}
                          disabled={!!editingMethod}
                        >
                          <Icon
                            size={responsiveScale(20)}
                            color={isSelected ? colors.white : colors.text}
                          />
                          <Text
                            style={[
                              styles.typeButtonText,
                              { color: isSelected ? colors.white : colors.text },
                            ]}
                          >
                            {getMethodLabel(type)}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                  )}
                </View>
              </View>

              {renderFormFields()}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: colors.primary },
                (createMutation.isPending || updateMutation.isPending) && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>
                  {editingMethod ? 'Atualizar' : 'Adicionar'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  methodsList: {
    padding: 20,
    gap: 16,
  },
  methodCard: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodText: {
    flex: 1,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  primaryText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: '#fff',
  },
  methodDetails: {
    fontSize: 14,
    marginBottom: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600' as const,
  },
  methodActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
  },
  modalClose: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  typeSelector: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: '48%',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  saveButton: {
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
});

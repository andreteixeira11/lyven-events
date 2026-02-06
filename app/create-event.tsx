import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Upload,
} from 'lucide-react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { trpcClient } from '@/lib/trpc';
import BasicInfoStep from '@/components/create-event/BasicInfoStep';
import LocationStep from '@/components/create-event/LocationStep';
import DateTimeStep from '@/components/create-event/DateTimeStep';
import TicketsStep, { TicketTypeForm } from '@/components/create-event/TicketsStep';
import ImageStep from '@/components/create-event/ImageStep';

interface EventFormData {
  title: string;
  description: string;
  venue: string;
  address: string;
  date: Date;
  time?: Date;
  category: string;
  ticketTypes: TicketTypeForm[];
  imageUrl: string;
  imageUri?: string;
}



export default function CreateEvent() {
  const params = useLocalSearchParams();
  const eventId = params.id as string | undefined;
  const isEditMode = !!eventId;

  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 5;

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    venue: '',
    address: '',
    date: new Date(),
    time: undefined,
    category: '',
    ticketTypes: [
      {
        id: '1',
        name: 'Bilhete Normal',
        stage: '',
        price: '',
        quantity: '',
        description: '',
      },
    ],
    imageUrl: '',
    imageUri: undefined,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showCancelEventModal, setShowCancelEventModal] = useState(false);

  useEffect(() => {
    if (isEditMode && eventId) {
      loadEventData(eventId);
    }
  }, [eventId]);

  const loadEventData = async (id: string) => {
    try {
      setIsLoading(true);
      console.log('📥 Carregando dados do evento:', id);
      
      const event = await trpcClient.events.get.query({ id });
      console.log('✅ Evento carregado:', event);

      const eventDate = new Date(event.date);
      const eventTime = new Date(event.date);

      const ticketTypes = event.ticketTypes.map((ticket: any, index: number) => ({
        id: (index + 1).toString(),
        name: ticket.name,
        stage: ticket.stage || '',
        price: ticket.price.toString(),
        quantity: ticket.available.toString(),
        description: ticket.description || '',
      }));

      setFormData({
        title: event.title,
        description: event.description || '',
        venue: event.venue.name,
        address: event.venue.address,
        date: eventDate,
        time: eventTime,
        category: event.category,
        ticketTypes: ticketTypes.length > 0 ? ticketTypes : [
          {
            id: '1',
            name: 'Bilhete Normal',
            stage: '',
            price: '',
            quantity: '',
            description: '',
          },
        ],
        imageUrl: event.image,
        imageUri: undefined,
      });


    } catch (error) {
      console.error('❌ Erro ao carregar evento:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do evento.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof EventFormData, value: string | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };



  const validateForm = (): boolean => {
    if (!formData.title || formData.title.trim() === '') {
      Alert.alert('Erro', 'Por favor, preencha o título do evento.');
      return false;
    }

    if (!formData.venue || formData.venue.trim() === '') {
      Alert.alert('Erro', 'Por favor, preencha o local do evento.');
      return false;
    }

    if (!formData.address || formData.address.trim() === '') {
      Alert.alert('Erro', 'Por favor, preencha o endereço do evento.');
      return false;
    }

    if (!formData.date) {
      Alert.alert('Erro', 'Por favor, selecione a data do evento.');
      return false;
    }

    if (!formData.category || formData.category.trim() === '') {
      Alert.alert('Erro', 'Por favor, selecione uma categoria.');
      return false;
    }

    if (!formData.imageUri && !formData.imageUrl) {
      Alert.alert('Erro', 'Por favor, adicione uma imagem do evento.');
      return false;
    }

    if (formData.ticketTypes.length === 0) {
      Alert.alert('Erro', 'Por favor, adicione pelo menos um tipo de bilhete.');
      return false;
    }

    const hasValidTicket = formData.ticketTypes.some(ticket => 
      ticket.name && ticket.name.trim() !== '' &&
      ticket.stage && ticket.stage.trim() !== '' &&
      ticket.price && ticket.price.trim() !== '' &&
      ticket.quantity && ticket.quantity.trim() !== ''
    );

    if (!hasValidTicket) {
      Alert.alert('Erro', 'Por favor, preencha pelo menos um bilhete completamente.');
      return false;
    }

    for (let i = 0; i < formData.ticketTypes.length; i++) {
      const ticket = formData.ticketTypes[i];
      
      if (!ticket.name && !ticket.stage && !ticket.price && !ticket.quantity) {
        continue;
      }
      
      if (!ticket.name || ticket.name.trim() === '') {
        Alert.alert('Erro', `Por favor, preencha o nome do bilhete ${i + 1}.`);
        return false;
      }

      if (!ticket.stage || ticket.stage.trim() === '') {
        Alert.alert('Erro', `Por favor, selecione o stage do bilhete ${i + 1}.`);
        return false;
      }

      if (!ticket.price || ticket.price.trim() === '') {
        Alert.alert('Erro', `Por favor, preencha o preço do bilhete ${i + 1}.`);
        return false;
      }

      if (!ticket.quantity || ticket.quantity.trim() === '') {
        Alert.alert('Erro', `Por favor, preencha a quantidade do bilhete ${i + 1}.`);
        return false;
      }

      const price = parseFloat(ticket.price);
      const quantity = parseInt(ticket.quantity);

      if (isNaN(price) || price < 0) {
        Alert.alert('Erro', `Preço inválido no bilhete ${i + 1}.`);
        return false;
      }

      if (isNaN(quantity) || quantity <= 0) {
        Alert.alert('Erro', `Quantidade inválida no bilhete ${i + 1}.`);
        return false;
      }
    }

    return true;
  };

  const addTicketType = () => {
    const newId = (formData.ticketTypes.length + 1).toString();
    setFormData(prev => ({
      ...prev,
      ticketTypes: [
        ...prev.ticketTypes,
        {
          id: newId,
          name: '',
          stage: '',
          price: '',
          quantity: '',
          description: '',
        },
      ],
    }));
  };

  const removeTicketType = (id: string) => {
    if (formData.ticketTypes.length === 1) {
      Alert.alert('Erro', 'Deve ter pelo menos um tipo de bilhete.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter(t => t.id !== id),
    }));
  };

  const updateTicketType = (id: string, field: keyof TicketTypeForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map(t => 
        t.id === id ? { ...t, [field]: value } : t
      ),
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setShowPublishModal(true);
  };

  const handlePublishEvent = async () => {
    setShowPublishModal(false);
    setIsSubmitting(true);

    try {
      console.log('📤 Enviando evento para backend...');
      
      const dateStr = formData.date.toISOString().split('T')[0];
      const timeStr = formData.time ? 
        `${formData.time.getHours().toString().padStart(2, '0')}:${formData.time.getMinutes().toString().padStart(2, '0')}:00` : 
        undefined;

      const eventData = {
        title: formData.title,
        description: formData.description || undefined,
        venue: formData.venue,
        address: formData.address,
        date: dateStr,
        time: timeStr,
        category: formData.category,
        ticketTypes: formData.ticketTypes.filter(t => 
          t.name && t.stage && t.price && t.quantity
        ),
        imageUrl: formData.imageUrl || undefined,
        imageUri: formData.imageUri || undefined,
        promoterId: 'promoter_1',
        shouldPromote: false,
      };

      console.log('📦 Dados do evento:', eventData);

      const result = await trpcClient.events.create.mutate(eventData);
      
      console.log('✅ Evento criado:', result);
      
      Alert.alert(
        'Sucesso!',
        isEditMode ? 'Evento atualizado com sucesso.' : 'Evento publicado com sucesso. Aguardando aprovação.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('❌ Erro ao criar evento:', error);
      Alert.alert('Erro', error instanceof Error ? error.message : 'Ocorreu um erro ao publicar o evento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePromoteEvent = async () => {
    setShowPublishModal(false);
    setIsSubmitting(true);

    try {
      console.log('📤 Enviando evento para backend (com promoção)...');
      
      const dateStr = formData.date.toISOString().split('T')[0];
      const timeStr = formData.time ? 
        `${formData.time.getHours().toString().padStart(2, '0')}:${formData.time.getMinutes().toString().padStart(2, '0')}:00` : 
        undefined;

      const eventData = {
        title: formData.title,
        description: formData.description || undefined,
        venue: formData.venue,
        address: formData.address,
        date: dateStr,
        time: timeStr,
        category: formData.category,
        ticketTypes: formData.ticketTypes.filter(t => 
          t.name && t.stage && t.price && t.quantity
        ),
        imageUrl: formData.imageUrl || undefined,
        imageUri: formData.imageUri || undefined,
        promoterId: 'promoter_1',
        shouldPromote: true,
      };

      console.log('📦 Dados do evento (promoção):', eventData);

      const result = await trpcClient.events.create.mutate(eventData);
      
      console.log('✅ Evento criado para promoção:', result);
      
      Alert.alert(
        'Sucesso!',
        'Evento criado. Redirecionando para a página de anúncios...',
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
              setTimeout(() => {
                router.push('/ad-purchase');
              }, 100);
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Erro ao criar evento:', error);
      Alert.alert('Erro', error instanceof Error ? error.message : 'Ocorreu um erro ao criar o evento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleConfirmCancelEvent = async () => {
    setShowCancelEventModal(false);
    setIsSubmitting(true);

    try {
      console.log('🗑️ Cancelando evento:', eventId);
      
      Alert.alert(
        'Evento Cancelado',
        'O evento foi cancelado com sucesso.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('❌ Erro ao cancelar evento:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao cancelar o evento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 0:
        if (!formData.title || formData.title.trim() === '') {
          Alert.alert('Erro', 'Por favor, preencha o título do evento.');
          return false;
        }
        if (!formData.category || formData.category.trim() === '') {
          Alert.alert('Erro', 'Por favor, selecione uma categoria.');
          return false;
        }
        return true;
      
      case 1:
        if (!formData.venue || formData.venue.trim() === '') {
          Alert.alert('Erro', 'Por favor, preencha o local do evento.');
          return false;
        }
        if (!formData.address || formData.address.trim() === '') {
          Alert.alert('Erro', 'Por favor, preencha o endereço do evento.');
          return false;
        }
        return true;
      
      case 2:
        if (!formData.date) {
          Alert.alert('Erro', 'Por favor, selecione a data do evento.');
          return false;
        }
        return true;
      
      case 3:
        const hasValidTicket = formData.ticketTypes.some(ticket => 
          ticket.name && ticket.name.trim() !== '' &&
          ticket.stage && ticket.stage.trim() !== '' &&
          ticket.price && ticket.price.trim() !== '' &&
          ticket.quantity && ticket.quantity.trim() !== ''
        );

        if (!hasValidTicket) {
          Alert.alert('Erro', 'Por favor, preencha pelo menos um bilhete completamente.');
          return false;
        }
        return true;
      
      case 4:
        if (!formData.imageUri && !formData.imageUrl) {
          Alert.alert('Erro', 'Por favor, adicione uma imagem do evento.');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      handleCancelConfirmation();
    }
  };

  const handleCancelConfirmation = () => {
    console.log('🚪 Tentando cancelar criação do evento');
    Alert.alert(
      'Cancelar Criação',
      'Tem a certeza que pretende cancelar? Todos os dados serão perdidos.',
      [
        {
          text: 'Não',
          style: 'cancel',
          onPress: () => console.log('❌ Cancelamento cancelado')
        },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: () => {
            console.log('✅ Criação cancelada pelo utilizador');
            router.back();
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.fullContainer}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: isEditMode ? 'Editar Evento' : 'Criar Evento',
          headerStyle: { backgroundColor: '#0099a8' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={handleCancelConfirmation} 
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0099a8" />
          <Text style={styles.loadingText}>Carregando evento...</Text>
        </View>
      ) : (
        <View style={styles.mainContainer}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${((currentStep + 1) / totalSteps) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>Passo {currentStep + 1} de {totalSteps}</Text>
          </View>

          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>

              {currentStep === 0 && (
                <BasicInfoStep
                  title={formData.title}
                  description={formData.description}
                  category={formData.category}
                  onTitleChange={(text) => updateFormData('title', text?.trim() || '')}
                  onDescriptionChange={(text) => updateFormData('description', text?.trim() || '')}
                  onCategoryChange={(category) => updateFormData('category', category)}
                />
              )}

              {currentStep === 1 && (
                <LocationStep
                  venue={formData.venue}
                  address={formData.address}
                  onVenueChange={(text) => updateFormData('venue', text?.trim() || '')}
                  onAddressChange={(text) => updateFormData('address', text?.trim() || '')}
                />
              )}

              {currentStep === 2 && (
                <DateTimeStep
                  date={formData.date}
                  time={formData.time}
                  onDateChange={(date) => updateFormData('date', date)}
                  onTimeChange={(time) => updateFormData('time', time)}
                />
              )}

              {currentStep === 3 && (
                <TicketsStep
                  tickets={formData.ticketTypes}
                  onAddTicket={addTicketType}
                  onRemoveTicket={removeTicketType}
                  onUpdateTicket={updateTicketType}
                />
              )}

              {currentStep === 4 && (
                <ImageStep
                  imageUrl={formData.imageUrl}
                  imageUri={formData.imageUri}
                  onImageUrlChange={(url) => updateFormData('imageUrl', url)}
                  onImageUriChange={(uri) => updateFormData('imageUri', uri)}
                />
              )}
            </View>
          </ScrollView>

          <View style={styles.navigationContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBack}
            >
              <ChevronLeft size={20} color="#0099a8" />
              <Text style={styles.backButtonText}>
                {currentStep === 0 ? 'Cancelar' : 'Voltar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.nextButton, isSubmitting && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={isSubmitting}
            >
              <Text style={styles.nextButtonText}>
                {isSubmitting ? 'A criar...' : currentStep === totalSteps - 1 ? 'Criar Evento' : 'Continuar'}
              </Text>
              {currentStep < totalSteps - 1 && <ChevronRight size={20} color="#fff" />}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal
        visible={showPublishModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPublishModal(false)}
      >
        <View style={styles.publishModalOverlay}>
          <View style={styles.publishModalContent}>
            <Text style={styles.publishModalTitle}>Publicar Evento</Text>
            <Text style={styles.publishModalSubtitle}>
              Escolha como pretende divulgar o seu evento
            </Text>

            <TouchableOpacity
              style={styles.publishModalButton}
              onPress={handlePublishEvent}
              disabled={isSubmitting}
            >
              <View style={styles.publishModalButtonIcon}>
                <Save size={24} color="#0099a8" />
              </View>
              <View style={styles.publishModalButtonContent}>
                <Text style={styles.publishModalButtonTitle}>Publicar</Text>
                <Text style={styles.publishModalButtonDescription}>
                  Publicar evento sem promoção adicional
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.publishModalButton, styles.publishModalButtonPromote]}
              onPress={handlePromoteEvent}
              disabled={isSubmitting}
            >
              <View style={styles.publishModalButtonIcon}>
                <Upload size={24} color="#fff" />
              </View>
              <View style={styles.publishModalButtonContent}>
                <Text style={[styles.publishModalButtonTitle, styles.publishModalButtonTitlePromote]}>
                  Promover Evento
                </Text>
                <Text style={[styles.publishModalButtonDescription, styles.publishModalButtonDescriptionPromote]}>
                  Publicar e promover com anúncios pagos
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.publishModalCancelButton}
              onPress={() => setShowPublishModal(false)}
              disabled={isSubmitting}
            >
              <Text style={styles.publishModalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCancelEventModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelEventModal(false)}
      >
        <View style={styles.cancelModalOverlay}>
          <View style={styles.cancelModalContent}>
            <View style={styles.cancelModalIconContainer}>
              <X size={48} color="#ff3b30" />
            </View>
            <Text style={styles.cancelModalTitle}>Cancelar Evento</Text>
            <Text style={styles.cancelModalSubtitle}>
              Tem a certeza que quer cancelar o evento?
            </Text>
            <Text style={styles.cancelModalWarning}>
              Esta ação não pode ser revertida.
            </Text>

            <View style={styles.cancelModalButtons}>
              <TouchableOpacity
                style={styles.cancelModalButtonSecondary}
                onPress={() => setShowCancelEventModal(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelModalButtonSecondaryText}>Não</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelModalButtonPrimary, isSubmitting && styles.nextButtonDisabled]}
                onPress={handleConfirmCancelEvent}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelModalButtonPrimaryText}>
                  {isSubmitting ? 'Cancelando...' : 'Sim, Cancelar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  closeButton: {
    padding: 8,
  },
  mainContainer: {
    flex: 1,
  },
  progressContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0099a8',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    gap: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#0099a8',
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#0099a8',
    borderRadius: 12,
    gap: 4,
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  publishModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  publishModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  publishModalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  publishModalSubtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  publishModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  publishModalButtonPromote: {
    backgroundColor: '#0099a8',
    borderColor: '#0099a8',
  },
  publishModalButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  publishModalButtonContent: {
    flex: 1,
  },
  publishModalButtonTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 4,
  },
  publishModalButtonTitlePromote: {
    color: '#fff',
  },
  publishModalButtonDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  publishModalButtonDescriptionPromote: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  publishModalCancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  publishModalCancelText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  cancelEventButton: {
    backgroundColor: '#ff3b30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  cancelEventButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600' as const,
  },
  cancelModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cancelModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  cancelModalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffe5e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cancelModalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  cancelModalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  cancelModalWarning: {
    fontSize: 14,
    color: '#ff3b30',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '600' as const,
  },
  cancelModalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelModalButtonSecondary: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
  },
  cancelModalButtonPrimary: {
    flex: 1,
    backgroundColor: '#ff3b30',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});

import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, TextInput, Modal, Platform, Animated, Image } from "react-native";
import { useCart } from "@/hooks/cart-context";
import { router, Stack } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { LoadingSpinner, ErrorState } from "@/components/LoadingStates";
import { handleError } from "@/lib/error-handler";
import { CreditCard, CheckCircle, X, Phone, Building2, ShoppingCart, ChevronRight, Shield, Lock, Ticket, Calendar, MapPin, Minus, Plus, Trash2, ArrowLeft, Check } from "lucide-react-native";
import * as Haptics from 'expo-haptics';
import { useUser } from "@/hooks/user-context";
import { useTheme } from "@/hooks/theme-context";
import { RADIUS, SHADOWS, SPACING } from "@/constants/colors";

type PaymentMethod = 'card' | 'mbway' | 'multibanco';
type CheckoutStep = 'review' | 'payment' | 'confirm';

export default function CheckoutScreen() {
  const { cartItems, getTotalPrice, completePurchase, removeFromCart, updateQuantity } = useCart();
  const { user } = useUser();
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('review');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('card');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showMultibancoModal, setShowMultibancoModal] = useState(false);
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [mbwayPhone, setMbwayPhone] = useState('');
  const [multibancoEntity, setMultibancoEntity] = useState('');
  const [multibancoReference, setMultibancoReference] = useState('');

  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const successScaleAnim = useRef(new Animated.Value(0)).current;

  const steps: CheckoutStep[] = ['review', 'payment', 'confirm'];
  const stepIndex = steps.indexOf(currentStep);

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: stepIndex,
      useNativeDriver: false,
      friction: 8,
    }).start();
  }, [stepIndex, progressAnim]);

  const animateStepChange = useCallback((newStep: CheckoutStep) => {
    setCurrentStep(newStep);
  }, []);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const validateCard = () => {
    if (cardNumber.replace(/\s/g, '').length < 13) {
      Alert.alert('Erro', 'Número de cartão inválido');
      return false;
    }
    if (cardName.length < 3) {
      Alert.alert('Erro', 'Por favor, insira o nome completo no cartão');
      return false;
    }
    if (cardExpiry.length !== 5) {
      Alert.alert('Erro', 'Data de validade inválida');
      return false;
    }
    if (cardCvv.length < 3) {
      Alert.alert('Erro', 'CVV inválido');
      return false;
    }
    return true;
  };

  const { data: eventsData, isLoading: isLoadingEvents, error: eventsError, refetch: refetchEvents } = trpc.events.list.useQuery(
    {},
    { enabled: cartItems.length > 0 }
  );

  const eventMap = useMemo(() => {
    if (!eventsData) return new Map<string, any>();
    const map = new Map<string, any>();
    eventsData.forEach((e: any) => {
      map.set(e.id, {
        ...e,
        date: new Date(e.date),
        endDate: e.endDate ? new Date(e.endDate) : undefined,
        venue: typeof e.venue === 'object' && e.venue ? e.venue : { id: '', name: '', address: '', city: '', capacity: 0 },
        promoter: typeof e.promoter === 'object' && e.promoter ? e.promoter : { id: '', name: '', image: '', description: '', verified: false, followersCount: 0 },
      });
    });
    return map;
  }, [eventsData]);

  const getEventById = (id: string) => eventMap.get(id);
  const getTicketType = (eventId: string, ticketTypeId: string) => {
    const event = getEventById(eventId);
    return event?.ticketTypes?.find((t: any) => t.id === ticketTypeId);
  };

  const subtotal = getTotalPrice();
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;

  const handleNextStep = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (currentStep === 'review') {
      if (cartItems.length === 0) {
        Alert.alert('Carrinho Vazio', 'Adicione bilhetes ao carrinho para continuar.');
        return;
      }
      animateStepChange('payment');
    } else if (currentStep === 'payment') {
      if (selectedPayment === 'card' && !validateCard()) return;
      if (selectedPayment === 'mbway' && !mbwayPhone) {
        Alert.alert('Erro', 'Por favor, insira o seu número de telefone.');
        return;
      }
      animateStepChange('confirm');
    }
  };

  const handlePreviousStep = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (currentStep === 'payment') {
      animateStepChange('review');
    } else if (currentStep === 'confirm') {
      animateStepChange('payment');
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      Alert.alert('Erro', 'É necessário iniciar sessão para comprar bilhetes.');
      return;
    }

    setIsProcessing(true);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    try {
      if (selectedPayment === 'multibanco') {
        const entity = '12345';
        const reference = String(Math.floor(100000000 + Math.random() * 900000000));
        setMultibancoEntity(entity);
        setMultibancoReference(reference);
        setShowMultibancoModal(true);
        setIsProcessing(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      const success = await completePurchase(user.id);
      setIsProcessing(false);
      
      if (success) {
        Animated.spring(successScaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 4,
        }).start();
        setShowSuccessModal(true);
      } else {
        Alert.alert('Erro', 'Não foi possível concluir a compra. Por favor, tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      setIsProcessing(false);
      Alert.alert('Erro', 'Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.');
    }
  };

  const handleMultibancoConfirm = async () => {
    if (!user) return;

    try {
      const success = await completePurchase(user.id);
      setShowMultibancoModal(false);
      
      if (success) {
        Animated.spring(successScaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 4,
        }).start();
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Erro ao processar pagamento Multibanco:', error);
      setShowMultibancoModal(false);
      Alert.alert('Erro', 'Ocorreu um erro ao processar o pagamento.');
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.dismissAll();
    router.push('/my-tickets');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderStepIndicator = () => {
    const progressWidth = progressAnim.interpolate({
      inputRange: [0, 1, 2],
      outputRange: ['0%', '50%', '100%'],
    });

    return (
      <View style={[styles.stepIndicator, { backgroundColor: colors.card }]}>
        <View style={styles.stepLabels}>
          {['Resumo', 'Pagamento', 'Confirmar'].map((label, index) => (
            <TouchableOpacity 
              key={label} 
              style={styles.stepLabel}
              disabled={index > stepIndex}
              onPress={() => index < stepIndex && animateStepChange(steps[index])}
            >
              <View style={[
                styles.stepDot,
                { 
                  backgroundColor: index <= stepIndex ? colors.primary : colors.border,
                  borderColor: index <= stepIndex ? colors.primary : colors.border,
                }
              ]}>
                {index < stepIndex ? (
                  <Check size={12} color={colors.white} strokeWidth={3} />
                ) : (
                  <Text style={[
                    styles.stepNumber,
                    { color: index <= stepIndex ? colors.white : colors.textSecondary }
                  ]}>
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text style={[
                styles.stepText,
                { color: index <= stepIndex ? colors.primary : colors.textSecondary }
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <Animated.View 
            style={[
              styles.progressBar, 
              { backgroundColor: colors.primary, width: progressWidth }
            ]} 
          />
        </View>
      </View>
    );
  };

  const renderReviewStep = () => (
    <Animated.View style={[styles.stepContent, { opacity: fadeAnim }]}>
      {cartItems.length === 0 ? (
        <View style={styles.emptyCart}>
          <View style={[styles.emptyCartIcon, { backgroundColor: colors.primaryLight }]}>
            <ShoppingCart size={48} color={colors.primary} />
          </View>
          <Text style={[styles.emptyCartTitle, { color: colors.text }]}>
            Carrinho Vazio
          </Text>
          <Text style={[styles.emptyCartText, { color: colors.textSecondary }]}>
            Ainda não adicionou nenhum bilhete ao carrinho
          </Text>
          <TouchableOpacity 
            style={[styles.browseButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.browseButtonText, { color: colors.white }]}>
              Explorar Eventos
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Os seus bilhetes ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
          </Text>
          
          {cartItems.map((item) => {
            const event = getEventById(item.eventId);
            const ticketType = getTicketType(item.eventId, item.ticketTypeId);
            if (!event || !ticketType) return null;

            return (
              <View 
                key={`${item.eventId}-${item.ticketTypeId}`} 
                style={[styles.ticketCard, { backgroundColor: colors.card }, SHADOWS.md]}
              >
                <Image source={{ uri: event.image }} style={styles.ticketImage} />
                <View style={styles.ticketContent}>
                  <View style={styles.ticketHeader}>
                    <Text style={[styles.ticketTitle, { color: colors.text }]} numberOfLines={1}>
                      {event.title}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => removeFromCart(item.eventId, item.ticketTypeId)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Trash2 size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.ticketMeta}>
                    <View style={styles.ticketMetaItem}>
                      <Calendar size={12} color={colors.textSecondary} />
                      <Text style={[styles.ticketMetaText, { color: colors.textSecondary }]}>
                        {formatDate(event.date)}
                      </Text>
                    </View>
                    <View style={styles.ticketMetaItem}>
                      <MapPin size={12} color={colors.textSecondary} />
                      <Text style={[styles.ticketMetaText, { color: colors.textSecondary }]} numberOfLines={1}>
                        {event.venue.name}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.ticketTypeTag, { backgroundColor: colors.primaryLight }]}>
                    <Ticket size={12} color={colors.primary} />
                    <Text style={[styles.ticketTypeText, { color: colors.primary }]}>
                      {ticketType.name}
                    </Text>
                  </View>

                  <View style={styles.ticketFooter}>
                    <View style={styles.quantityControl}>
                      <TouchableOpacity 
                        style={[styles.quantityButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                        onPress={() => updateQuantity(item.eventId, item.ticketTypeId, item.quantity - 1)}
                      >
                        <Minus size={14} color={colors.text} />
                      </TouchableOpacity>
                      <Text style={[styles.quantityText, { color: colors.text }]}>{item.quantity}</Text>
                      <TouchableOpacity 
                        style={[styles.quantityButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                        onPress={() => updateQuantity(item.eventId, item.ticketTypeId, item.quantity + 1)}
                      >
                        <Plus size={14} color={colors.text} />
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.ticketPrice, { color: colors.primary }]}>
                      €{(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}

          <View style={[styles.priceBreakdown, { backgroundColor: colors.card }, SHADOWS.sm]}>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.priceValue, { color: colors.text }]}>€{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Taxa de Serviço</Text>
              <Text style={[styles.priceValue, { color: colors.text }]}>€{serviceFee.toFixed(2)}</Text>
            </View>
            <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>€{total.toFixed(2)}</Text>
            </View>
          </View>
        </>
      )}
    </Animated.View>
  );

  const renderPaymentStep = () => (
    <Animated.View style={[styles.stepContent, { opacity: fadeAnim }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Método de Pagamento
      </Text>

      <TouchableOpacity 
        style={[
          styles.paymentOption, 
          { backgroundColor: colors.card, borderColor: colors.border },
          selectedPayment === 'card' && { borderColor: colors.primary, borderWidth: 2 }
        ]}
        onPress={() => setSelectedPayment('card')}
      >
        <View style={[styles.paymentIconWrapper, { backgroundColor: selectedPayment === 'card' ? colors.primaryLight : colors.background }]}>
          <CreditCard size={24} color={selectedPayment === 'card' ? colors.primary : colors.textSecondary} />
        </View>
        <View style={styles.paymentInfo}>
          <Text style={[styles.paymentTitle, { color: colors.text }]}>Cartão</Text>
          <Text style={[styles.paymentSubtitle, { color: colors.textSecondary }]}>Visa, Mastercard, American Express</Text>
        </View>
        <View style={[
          styles.radioOuter, 
          { borderColor: selectedPayment === 'card' ? colors.primary : colors.border }
        ]}>
          {selectedPayment === 'card' && (
            <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[
          styles.paymentOption, 
          { backgroundColor: colors.card, borderColor: colors.border },
          selectedPayment === 'mbway' && { borderColor: colors.primary, borderWidth: 2 }
        ]}
        onPress={() => setSelectedPayment('mbway')}
      >
        <View style={[styles.paymentIconWrapper, { backgroundColor: selectedPayment === 'mbway' ? colors.primaryLight : colors.background }]}>
          <Phone size={24} color={selectedPayment === 'mbway' ? colors.primary : colors.textSecondary} />
        </View>
        <View style={styles.paymentInfo}>
          <Text style={[styles.paymentTitle, { color: colors.text }]}>MB WAY</Text>
          <Text style={[styles.paymentSubtitle, { color: colors.textSecondary }]}>Pagamento instantâneo</Text>
        </View>
        <View style={[
          styles.radioOuter, 
          { borderColor: selectedPayment === 'mbway' ? colors.primary : colors.border }
        ]}>
          {selectedPayment === 'mbway' && (
            <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[
          styles.paymentOption, 
          { backgroundColor: colors.card, borderColor: colors.border },
          selectedPayment === 'multibanco' && { borderColor: colors.primary, borderWidth: 2 }
        ]}
        onPress={() => setSelectedPayment('multibanco')}
      >
        <View style={[styles.paymentIconWrapper, { backgroundColor: selectedPayment === 'multibanco' ? colors.primaryLight : colors.background }]}>
          <Building2 size={24} color={selectedPayment === 'multibanco' ? colors.primary : colors.textSecondary} />
        </View>
        <View style={styles.paymentInfo}>
          <Text style={[styles.paymentTitle, { color: colors.text }]}>Multibanco</Text>
          <Text style={[styles.paymentSubtitle, { color: colors.textSecondary }]}>Referência para pagamento</Text>
        </View>
        <View style={[
          styles.radioOuter, 
          { borderColor: selectedPayment === 'multibanco' ? colors.primary : colors.border }
        ]}>
          {selectedPayment === 'multibanco' && (
            <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
          )}
        </View>
      </TouchableOpacity>

      {selectedPayment === 'card' && (
        <View style={[styles.paymentForm, { backgroundColor: colors.card }, SHADOWS.sm]}>
          <Text style={[styles.formTitle, { color: colors.text }]}>Dados do Cartão</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            placeholder="Número do Cartão"
            placeholderTextColor={colors.textSecondary}
            value={cardNumber}
            onChangeText={(text) => setCardNumber(formatCardNumber(text))}
            keyboardType="numeric"
            maxLength={19}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            placeholder="Nome no Cartão"
            placeholderTextColor={colors.textSecondary}
            value={cardName}
            onChangeText={setCardName}
            autoCapitalize="characters"
          />
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputHalf, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="MM/AA"
              placeholderTextColor={colors.textSecondary}
              value={cardExpiry}
              onChangeText={(text) => setCardExpiry(formatExpiry(text))}
              keyboardType="numeric"
              maxLength={5}
            />
            <TextInput
              style={[styles.input, styles.inputHalf, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="CVV"
              placeholderTextColor={colors.textSecondary}
              value={cardCvv}
              onChangeText={setCardCvv}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
          </View>
        </View>
      )}

      {selectedPayment === 'mbway' && (
        <View style={[styles.paymentForm, { backgroundColor: colors.card }, SHADOWS.sm]}>
          <Text style={[styles.formTitle, { color: colors.text }]}>Número MB WAY</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            placeholder="Número de Telemóvel"
            placeholderTextColor={colors.textSecondary}
            value={mbwayPhone}
            onChangeText={setMbwayPhone}
            keyboardType="phone-pad"
            maxLength={9}
          />
          <View style={styles.infoBox}>
            <Phone size={16} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Receberá uma notificação no seu telemóvel para confirmar o pagamento.
            </Text>
          </View>
        </View>
      )}

      {selectedPayment === 'multibanco' && (
        <View style={[styles.paymentForm, { backgroundColor: colors.card }, SHADOWS.sm]}>
          <View style={styles.infoBox}>
            <Building2 size={16} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Será gerada uma referência Multibanco para pagamento. Os bilhetes são disponibilizados após confirmação.
            </Text>
          </View>
        </View>
      )}

      <View style={[styles.securityBadge, { backgroundColor: colors.card }]}>
        <Shield size={16} color={colors.success} />
        <Text style={[styles.securityText, { color: colors.textSecondary }]}>
          Pagamento seguro com encriptação SSL
        </Text>
        <Lock size={14} color={colors.success} />
      </View>
    </Animated.View>
  );

  const renderConfirmStep = () => (
    <Animated.View style={[styles.stepContent, { opacity: fadeAnim }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Confirmar Compra
      </Text>

      <View style={[styles.summaryCard, { backgroundColor: colors.card }, SHADOWS.md]}>
        <Text style={[styles.summaryTitle, { color: colors.text }]}>Resumo do Pedido</Text>
        
        {cartItems.map((item) => {
          const event = getEventById(item.eventId);
          const ticketType = getTicketType(item.eventId, item.ticketTypeId);
          if (!event || !ticketType) return null;

          return (
            <View key={`${item.eventId}-${item.ticketTypeId}`} style={[styles.summaryItem, { borderBottomColor: colors.border }]}>
              <View style={styles.summaryItemLeft}>
                <Text style={[styles.summaryItemTitle, { color: colors.text }]} numberOfLines={1}>
                  {event.title}
                </Text>
                <Text style={[styles.summaryItemSub, { color: colors.textSecondary }]}>
                  {ticketType.name} × {item.quantity}
                </Text>
              </View>
              <Text style={[styles.summaryItemPrice, { color: colors.text }]}>
                €{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          );
        })}

        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>€{subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Taxa de Serviço</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>€{serviceFee.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryTotalRow, { borderTopColor: colors.primary }]}>
          <Text style={[styles.summaryTotalLabel, { color: colors.text }]}>Total a Pagar</Text>
          <Text style={[styles.summaryTotalValue, { color: colors.primary }]}>€{total.toFixed(2)}</Text>
        </View>
      </View>

      <View style={[styles.paymentSummary, { backgroundColor: colors.card }, SHADOWS.sm]}>
        <Text style={[styles.paymentSummaryTitle, { color: colors.text }]}>Método de Pagamento</Text>
        <View style={styles.paymentSummaryContent}>
          {selectedPayment === 'card' && (
            <>
              <CreditCard size={20} color={colors.primary} />
              <Text style={[styles.paymentSummaryText, { color: colors.textSecondary }]}>
                Cartão terminado em {cardNumber.slice(-4) || '****'}
              </Text>
            </>
          )}
          {selectedPayment === 'mbway' && (
            <>
              <Phone size={20} color={colors.primary} />
              <Text style={[styles.paymentSummaryText, { color: colors.textSecondary }]}>
                MB WAY - {mbwayPhone || '*** *** ***'}
              </Text>
            </>
          )}
          {selectedPayment === 'multibanco' && (
            <>
              <Building2 size={20} color={colors.primary} />
              <Text style={[styles.paymentSummaryText, { color: colors.textSecondary }]}>
                Referência Multibanco
              </Text>
            </>
          )}
        </View>
      </View>

      <Text style={[styles.termsText, { color: colors.textSecondary }]}>
        Ao finalizar a compra, concorda com os nossos{' '}
        <Text style={{ color: colors.primary }}>Termos de Serviço</Text> e{' '}
        <Text style={{ color: colors.primary }}>Política de Privacidade</Text>.
      </Text>
    </Animated.View>
  );

  if (cartItems.length > 0 && isLoadingEvents) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Checkout', headerShown: true, headerStyle: { backgroundColor: colors.primary }, headerTintColor: colors.white }} />
        <LoadingSpinner message="A carregar eventos..." />
      </View>
    );
  }
  if (cartItems.length > 0 && eventsError) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Checkout', headerShown: true, headerStyle: { backgroundColor: colors.primary }, headerTintColor: colors.white }} />
        <ErrorState message={handleError(eventsError)} onRetry={() => refetchEvents()} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{
          title: 'Checkout',
          headerShown: true,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '600' as const },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => currentStep === 'review' ? router.back() : handlePreviousStep()}
              style={styles.headerBack}
            >
              <ArrowLeft size={24} color={colors.white} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      {renderStepIndicator()}

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 'review' && renderReviewStep()}
        {currentStep === 'payment' && renderPaymentStep()}
        {currentStep === 'confirm' && renderConfirmStep()}
      </ScrollView>

      {cartItems.length > 0 && (
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <View style={styles.footerPrice}>
            <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>Total</Text>
            <Text style={[styles.footerTotal, { color: colors.primary }]}>€{total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.footerButton, 
              { backgroundColor: colors.primary },
              isProcessing && styles.footerButtonDisabled
            ]}
            onPress={currentStep === 'confirm' ? handlePurchase : handleNextStep}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Text style={[styles.footerButtonText, { color: colors.white }]}>A processar...</Text>
            ) : (
              <>
                <Text style={[styles.footerButtonText, { color: colors.white }]}>
                  {currentStep === 'confirm' ? 'Confirmar Pagamento' : 'Continuar'}
                </Text>
                {currentStep !== 'confirm' && <ChevronRight size={20} color={colors.white} />}
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.successModal, 
              { backgroundColor: colors.card },
              { transform: [{ scale: successScaleAnim }] }
            ]}
          >
            <View style={[styles.successIcon, { backgroundColor: '#10B981' }]}>
              <CheckCircle size={48} color={colors.white} />
            </View>
            <Text style={[styles.successTitle, { color: colors.text }]}>Compra Realizada!</Text>
            <Text style={[styles.successText, { color: colors.textSecondary }]}>
              Os seus bilhetes estão disponíveis na secção Os Meus Bilhetes. Receberá um email de confirmação em breve.
            </Text>
            <TouchableOpacity 
              style={[styles.successButton, { backgroundColor: colors.primary }]}
              onPress={handleSuccessClose}
            >
              <Ticket size={20} color={colors.white} />
              <Text style={[styles.successButtonText, { color: colors.white }]}>Ver Bilhetes</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      <Modal visible={showMultibancoModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.multibancoModal, { backgroundColor: colors.card }]}>
            <TouchableOpacity 
              style={styles.modalClose}
              onPress={() => setShowMultibancoModal(false)}
            >
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.multibancoIcon, { backgroundColor: colors.primaryLight }]}>
              <Building2 size={40} color={colors.primary} />
            </View>

            <Text style={[styles.multibancoTitle, { color: colors.text }]}>Referência Multibanco</Text>
            <Text style={[styles.multibancoSubtitle, { color: colors.textSecondary }]}>
              Utilize os dados abaixo para efetuar o pagamento
            </Text>

            <View style={[styles.referenceBox, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
              <View style={[styles.referenceRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.referenceLabel, { color: colors.textSecondary }]}>Entidade</Text>
                <Text style={[styles.referenceValue, { color: colors.primary }]}>{multibancoEntity}</Text>
              </View>
              <View style={[styles.referenceRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.referenceLabel, { color: colors.textSecondary }]}>Referência</Text>
                <Text style={[styles.referenceValue, { color: colors.primary }]}>{multibancoReference}</Text>
              </View>
              <View style={styles.referenceRow}>
                <Text style={[styles.referenceLabel, { color: colors.textSecondary }]}>Montante</Text>
                <Text style={[styles.referenceValue, { color: colors.primary }]}>€{total.toFixed(2)}</Text>
              </View>
            </View>

            <Text style={[styles.multibancoInfo, { color: colors.textSecondary }]}>
              Esta referência é válida por 24 horas. Os bilhetes serão disponibilizados após confirmação do pagamento.
            </Text>

            <TouchableOpacity 
              style={[styles.multibancoButton, { backgroundColor: colors.primary }]}
              onPress={handleMultibancoConfirm}
            >
              <Text style={[styles.multibancoButtonText, { color: colors.white }]}>Entendido</Text>
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
  headerBack: {
    padding: 8,
    marginLeft: -8,
  },
  stepIndicator: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  stepLabel: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 2,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: 120,
  },
  stepContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: SPACING.lg,
  },
  emptyCart: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyCartIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  emptyCartTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: SPACING.sm,
  },
  emptyCartText: {
    fontSize: 14,
    textAlign: 'center' as const,
    marginBottom: SPACING.xl,
  },
  browseButton: {
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  ticketCard: {
    flexDirection: 'row',
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  ticketImage: {
    width: 90,
    height: 130,
  },
  ticketContent: {
    flex: 1,
    padding: SPACING.md,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  ticketTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    flex: 1,
    marginRight: SPACING.sm,
  },
  ticketMeta: {
    marginBottom: SPACING.sm,
  },
  ticketMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ticketMetaText: {
    fontSize: 11,
  },
  ticketTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    gap: 4,
    marginBottom: SPACING.sm,
  },
  ticketTypeText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '600' as const,
    minWidth: 24,
    textAlign: 'center' as const,
  },
  ticketPrice: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  priceBreakdown: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: SPACING.md,
    marginTop: SPACING.sm,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  paymentIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  paymentSubtitle: {
    fontSize: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  paymentForm: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.sm,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: SPACING.md,
  },
  input: {
    borderRadius: RADIUS.md,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  inputHalf: {
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(0, 153, 168, 0.05)',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xl,
  },
  securityText: {
    fontSize: 12,
  },
  summaryCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: SPACING.md,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  summaryItemLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  summaryItemTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  summaryItemSub: {
    fontSize: 12,
    marginTop: 2,
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  summaryDivider: {
    height: 1,
    marginVertical: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 2,
    paddingTop: SPACING.md,
    marginTop: SPACING.sm,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  paymentSummary: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  paymentSummaryTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: SPACING.sm,
  },
  paymentSummaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  paymentSummaryText: {
    fontSize: 14,
  },
  termsText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center' as const,
  },
  footer: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderTopWidth: 1,
  },
  footerPrice: {
    marginRight: SPACING.lg,
  },
  footerLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  footerTotal: {
    fontSize: 22,
    fontWeight: '700' as const,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    gap: 4,
    ...SHADOWS.md,
  },
  footerButtonDisabled: {
    opacity: 0.6,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  successModal: {
    borderRadius: RADIUS.xxl,
    padding: SPACING.xxl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: SPACING.sm,
  },
  successText: {
    fontSize: 14,
    textAlign: 'center' as const,
    lineHeight: 20,
    marginBottom: SPACING.xxl,
  },
  successButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.xxl,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    width: '100%',
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  multibancoModal: {
    borderRadius: RADIUS.xxl,
    padding: SPACING.xxl,
    width: '100%',
    maxWidth: 380,
  },
  modalClose: {
    position: 'absolute' as const,
    top: SPACING.lg,
    right: SPACING.lg,
    zIndex: 1,
  },
  multibancoIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center' as const,
    marginBottom: SPACING.xl,
  },
  multibancoTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    marginBottom: SPACING.sm,
  },
  multibancoSubtitle: {
    fontSize: 14,
    textAlign: 'center' as const,
    marginBottom: SPACING.xl,
  },
  referenceBox: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
  },
  referenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  referenceLabel: {
    fontSize: 14,
  },
  referenceValue: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  multibancoInfo: {
    fontSize: 12,
    textAlign: 'center' as const,
    lineHeight: 18,
    marginBottom: SPACING.xl,
  },
  multibancoButton: {
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  multibancoButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});

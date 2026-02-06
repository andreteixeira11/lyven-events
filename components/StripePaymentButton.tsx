import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { CreditCard } from 'lucide-react-native';
import { useStripe } from '@/hooks/useStripe';

interface StripePaymentButtonProps {
  eventId: string;
  eventTitle: string;
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  pricePerTicket: number;
  userId: string;
  userEmail: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  style?: object;
}

export function StripePaymentButton({
  eventId,
  eventTitle,
  ticketTypeId,
  ticketTypeName,
  quantity,
  pricePerTicket,
  userId,
  userEmail,
  onSuccess,
  onError,
  disabled,
  style,
}: StripePaymentButtonProps) {
  const { isConfigured, isLoading, createCheckoutSession, clearError } = useStripe();

  const totalAmount = (pricePerTicket * quantity).toFixed(2);

  const handlePress = async () => {
    clearError();
    
    if (!isConfigured) {
      onError?.('Stripe is not configured');
      return;
    }

    try {
      await createCheckoutSession({
        eventId,
        eventTitle,
        ticketTypeId,
        ticketTypeName,
        quantity,
        pricePerTicket,
        userId,
        userEmail,
      });
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      onError?.(errorMessage);
    }
  };

  if (!isConfigured && !isLoading) {
    return (
      <View style={[styles.container, styles.disabledContainer, style]}>
        <Text style={styles.disabledText}>Payment not available</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        disabled && styles.disabledContainer,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || isLoading || !isConfigured}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <>
          <CreditCard size={20} color="#fff" style={styles.icon} />
          <Text style={styles.text}>Pay €{totalAmount}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#635BFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 56,
  },
  disabledContainer: {
    backgroundColor: '#9CA3AF',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  disabledText: {
    color: '#fff',
    fontSize: 14,
  },
});

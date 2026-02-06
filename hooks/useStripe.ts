import { useState, useCallback } from 'react';
import { Platform, Linking } from 'react-native';
import { trpc } from '@/lib/trpc';

interface CheckoutOptions {
  eventId: string;
  eventTitle: string;
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  pricePerTicket: number;
  userId: string;
  userEmail: string;
}

interface PaymentIntentOptions {
  amount: number;
  eventId: string;
  ticketTypeId: string;
  userId: string;
  quantity: number;
}

export function useStripe() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configQuery = trpc.stripe.getConfig.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });

  const createCheckoutMutation = trpc.stripe.createCheckout.useMutation();
  const createPaymentIntentMutation = trpc.stripe.createPaymentIntent.useMutation();
  const getSessionQuery = trpc.stripe.getSession.useQuery;

  const isConfigured = configQuery.data?.isConfigured ?? false;
  const publishableKey = configQuery.data?.publishableKey ?? null;

  const createCheckoutSession = useCallback(async (options: CheckoutOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔵 Creating checkout session:', options);
      
      const result = await createCheckoutMutation.mutateAsync(options);
      
      console.log('✅ Checkout session created:', result.sessionId);
      
      if (result.url) {
        if (Platform.OS === 'web') {
          window.location.href = result.url;
        } else {
          const canOpen = await Linking.canOpenURL(result.url);
          if (canOpen) {
            await Linking.openURL(result.url);
          } else {
            throw new Error('Cannot open payment URL');
          }
        }
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create checkout session';
      console.error('❌ Checkout error:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [createCheckoutMutation]);

  const createPaymentIntent = useCallback(async (options: PaymentIntentOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔵 Creating payment intent:', options);
      
      const result = await createPaymentIntentMutation.mutateAsync({
        ...options,
        currency: 'eur',
      });
      
      console.log('✅ Payment intent created:', result.paymentIntentId);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment intent';
      console.error('❌ Payment intent error:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [createPaymentIntentMutation]);

  const getSession = useCallback((sessionId: string) => {
    return getSessionQuery({ sessionId }, {
      enabled: !!sessionId,
    });
  }, [getSessionQuery]);

  return {
    isConfigured,
    publishableKey,
    isLoading: isLoading || configQuery.isLoading,
    error,
    createCheckoutSession,
    createPaymentIntent,
    getSession,
    clearError: () => setError(null),
  };
}

export type { CheckoutOptions, PaymentIntentOptions };

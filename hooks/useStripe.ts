import { useState, useCallback } from 'react';
import { Platform, Linking } from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { stripeApi } from '@/lib/supabase-api';

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

  const configQuery = useQuery({
    queryKey: ['stripe', 'getConfig'],
    queryFn: () => stripeApi.getConfig(),
    staleTime: 1000 * 60 * 5,
  });

  const createCheckoutMutation = useMutation({ mutationFn: stripeApi.createCheckout });
  const createPaymentIntentMutation = useMutation({ mutationFn: stripeApi.createPaymentIntent });
  const getSessionQuery = (input: { sessionId: string }, opts?: any) => useQuery({
    queryKey: ['stripe', 'getSession', input],
    queryFn: () => stripeApi.getSession(input),
    ...opts,
  });

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

import { publicProcedure } from '../../create-context';
import { getStripePublishableKey } from '@/backend/lib/stripe';

export const getStripeConfigProcedure = publicProcedure
  .query(async () => {
    console.log('🔵 Getting Stripe config');
    
    try {
      const publishableKey = getStripePublishableKey();
      
      return {
        publishableKey,
        isConfigured: true,
      };
    } catch (error) {
      console.log('⚠️ Stripe not configured:', error);
      return {
        publishableKey: null,
        isConfigured: false,
      };
    }
  });

import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { getStripe } from '@/backend/lib/stripe';

export const getSessionProcedure = publicProcedure
  .input(z.object({
    sessionId: z.string(),
  }))
  .query(async ({ input }) => {
    console.log('🔵 Getting Stripe session:', input.sessionId);
    
    const stripe = getStripe();
    
    const session = await stripe.checkout.sessions.retrieve(input.sessionId, {
      expand: ['payment_intent', 'line_items'],
    });

    console.log('✅ Stripe session retrieved:', session.payment_status);

    return {
      id: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency,
      customerEmail: session.customer_email,
      metadata: session.metadata,
      paymentIntentId: typeof session.payment_intent === 'string' 
        ? session.payment_intent 
        : session.payment_intent?.id,
    };
  });

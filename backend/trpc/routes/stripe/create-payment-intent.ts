import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { getStripe } from '@/backend/lib/stripe';

export const createPaymentIntentProcedure = publicProcedure
  .input(z.object({
    amount: z.number().min(1),
    currency: z.string().default('eur'),
    eventId: z.string(),
    ticketTypeId: z.string(),
    userId: z.string(),
    quantity: z.number().min(1),
  }))
  .mutation(async ({ input }) => {
    console.log('🔵 Creating Stripe payment intent:', input);
    
    const stripe = getStripe();
    const amountInCents = Math.round(input.amount * 100);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: input.currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        eventId: input.eventId,
        ticketTypeId: input.ticketTypeId,
        userId: input.userId,
        quantity: String(input.quantity),
      },
    });

    console.log('✅ Stripe payment intent created:', paymentIntent.id);

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountInCents / 100,
    };
  });

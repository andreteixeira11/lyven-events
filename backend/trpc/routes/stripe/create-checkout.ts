import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { getStripe } from '@/backend/lib/stripe';

export const createCheckoutSessionProcedure = publicProcedure
  .input(z.object({
    eventId: z.string(),
    eventTitle: z.string(),
    ticketTypeId: z.string(),
    ticketTypeName: z.string(),
    quantity: z.number().min(1),
    pricePerTicket: z.number(),
    userId: z.string(),
    userEmail: z.string().email(),
    successUrl: z.string().optional(),
    cancelUrl: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log('🔵 Creating Stripe checkout session:', input);
    
    const stripe = getStripe();
    const totalAmount = Math.round(input.pricePerTicket * input.quantity * 100);
    
    const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'https://rork.app';
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: input.userEmail,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${input.eventTitle} - ${input.ticketTypeName}`,
              description: `Ticket for ${input.eventTitle}`,
              metadata: {
                eventId: input.eventId,
                ticketTypeId: input.ticketTypeId,
              },
            },
            unit_amount: Math.round(input.pricePerTicket * 100),
          },
          quantity: input.quantity,
        },
      ],
      metadata: {
        eventId: input.eventId,
        ticketTypeId: input.ticketTypeId,
        userId: input.userId,
        quantity: String(input.quantity),
        pricePerTicket: String(input.pricePerTicket),
      },
      success_url: input.successUrl || `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: input.cancelUrl || `${baseUrl}/payment-cancelled`,
    });

    console.log('✅ Stripe checkout session created:', session.id);

    return {
      sessionId: session.id,
      url: session.url,
      totalAmount: totalAmount / 100,
    };
  });

import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db, tickets } from '@/backend/db';

export const batchCreateTicketsProcedure = publicProcedure
  .input(
    z.object({
      tickets: z.array(
        z.object({
          id: z.string(),
          eventId: z.string(),
          userId: z.string(),
          ticketTypeId: z.string(),
          quantity: z.number(),
          price: z.number(),
          qrCode: z.string(),
          validUntil: z.string(),
        })
      ),
    })
  )
  .mutation(async ({ input }) => {
    const results = [];

    for (const ticket of input.tickets) {
      const result = await db.insert(tickets).values({
        id: ticket.id,
        eventId: ticket.eventId,
        userId: ticket.userId,
        ticketTypeId: ticket.ticketTypeId,
        quantity: ticket.quantity,
        price: ticket.price,
        qrCode: ticket.qrCode,
        isUsed: false,
        validUntil: ticket.validUntil,
      }).returning();

      results.push(result[0]);
    }

    return results;
  });

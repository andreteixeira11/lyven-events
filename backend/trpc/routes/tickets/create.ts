import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db, tickets, events, promoters, users } from '@/backend/db';
import { eq } from 'drizzle-orm';
import { sendNotification } from '@/backend/lib/send-notification';

export const createTicketProcedure = publicProcedure
  .input(
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
  )
  .mutation(async ({ input }) => {
    const result = await db.insert(tickets).values({
      id: input.id,
      eventId: input.eventId,
      userId: input.userId,
      ticketTypeId: input.ticketTypeId,
      quantity: input.quantity,
      price: input.price,
      qrCode: input.qrCode,
      isUsed: false,
      validUntil: input.validUntil,
    }).returning();

    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, input.eventId))
      .limit(1);

    if (event && event.length > 0) {
      const promoter = await db
        .select()
        .from(promoters)
        .where(eq(promoters.id, event[0].promoterId))
        .limit(1);

      if (promoter && promoter.length > 0) {
        const promoterUser = await db
          .select()
          .from(users)
          .where(eq(users.userType, 'promoter'))
          .limit(1);

        if (promoterUser.length > 0) {
          await sendNotification({
            userId: promoterUser[0].id,
            type: 'ticket_sold',
            title: 'Novo Bilhete Vendido! 🎫',
            message: `${input.quantity} bilhete(s) vendido(s) para "${event[0].title}" - €${input.price.toFixed(2)}`,
            data: {
              eventId: input.eventId,
              eventTitle: event[0].title,
              ticketId: input.id,
              quantity: input.quantity,
              price: input.price,
            },
          });
          console.log('🔔 Notificação de venda de bilhete enviada');
        }
      }
    }

    return result[0];
  });

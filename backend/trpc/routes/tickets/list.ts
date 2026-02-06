import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db, tickets } from '@/backend/db';
import { eq } from 'drizzle-orm';

export const listTicketsProcedure = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    const userTickets = await db.query.tickets.findMany({
      where: eq(tickets.userId, input.userId),
    });

    return userTickets.map((ticket) => ({
      id: ticket.id,
      eventId: ticket.eventId,
      ticketTypeId: ticket.ticketTypeId,
      quantity: ticket.quantity,
      price: ticket.price,
      purchaseDate: new Date(ticket.purchaseDate),
      validUntil: ticket.validUntil ? new Date(ticket.validUntil) : null,
      qrCode: ticket.qrCode,
      isUsed: ticket.isUsed === 1,
      validatedAt: ticket.validatedAt ? new Date(ticket.validatedAt) : null,
      addedToCalendar: ticket.addedToCalendar === 1,
      reminderSet: ticket.reminderSet === 1,
    }));
  });

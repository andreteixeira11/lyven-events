import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db, tickets, users, events } from '@/backend/db';
import { eq } from 'drizzle-orm';

export const validateTicketProcedure = publicProcedure
  .input(z.object({ 
    qrCode: z.string(),
    validatedBy: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log('🔍 [Validate Ticket] Iniciando validação:', input.qrCode);
    
    const ticket = await db.query.tickets.findFirst({
      where: eq(tickets.qrCode, input.qrCode),
    });

    if (!ticket) {
      console.error('❌ [Validate Ticket] Bilhete não encontrado:', input.qrCode);
      throw new Error('Ticket not found');
    }

    console.log('📋 [Validate Ticket] Bilhete encontrado:', ticket.id, '- isUsed:', ticket.isUsed);

    if (ticket.isUsed) {
      console.error('❌ [Validate Ticket] Bilhete já utilizado:', ticket.id, '- Validado em:', ticket.validatedAt);
      throw new Error('Ticket already used');
    }

    const validUntil = new Date(ticket.validUntil);
    const now = new Date();
    if (validUntil < now) {
      console.error('❌ [Validate Ticket] Bilhete expirado:', ticket.id, '- Valid until:', ticket.validUntil);
      throw new Error('Ticket expired');
    }

    const validatedAt = now.toISOString();
    
    await db.update(tickets)
      .set({ 
        isUsed: true,
        validatedAt,
        validatedBy: input.validatedBy || 'unknown',
      })
      .where(eq(tickets.id, ticket.id));

    console.log('✅ [Validate Ticket] Bilhete validado com sucesso:', ticket.id, '- Validado em:', validatedAt);

    const buyer = await db.query.users.findFirst({
      where: eq(users.id, ticket.userId),
    });

    const event = await db.query.events.findFirst({
      where: eq(events.id, ticket.eventId),
    });

    const updatedTicket = {
      ...ticket,
      isUsed: true,
      validatedAt,
      validatedBy: input.validatedBy || 'unknown',
    };

    return { 
      success: true, 
      ticket: updatedTicket,
      buyer: buyer ? { id: buyer.id, name: buyer.name, email: buyer.email } : null,
      event: event ? { id: event.id, title: event.title } : null,
    };
  });

import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db, events, promoters, users } from '@/backend/db';
import { eq } from 'drizzle-orm';
import { sendNotification } from '@/backend/lib/send-notification';

export const rejectEventProcedure = publicProcedure
  .input(
    z.object({
      eventId: z.string(),
      reason: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('❌ Rejeitando evento:', input.eventId);

    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, input.eventId))
      .limit(1);

    if (!event || event.length === 0) {
      throw new Error('Evento não encontrado');
    }

    if (event[0].status !== 'pending') {
      throw new Error('Apenas eventos pendentes podem ser rejeitados');
    }

    const result = await db
      .update(events)
      .set({ status: 'cancelled' })
      .where(eq(events.id, input.eventId))
      .returning();

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
        const message = input.reason 
          ? `O seu evento "${event[0].title}" foi rejeitado. Motivo: ${input.reason}`
          : `O seu evento "${event[0].title}" foi rejeitado.`;

        await sendNotification({
          userId: promoterUser[0].id,
          type: 'system',
          title: 'Evento Rejeitado',
          message,
          data: {
            eventId: input.eventId,
            eventTitle: event[0].title,
            reason: input.reason,
          },
        });
        console.log('🔔 Notificação de rejeição enviada');
      }
    }

    console.log('✅ Evento rejeitado com sucesso');
    return result[0];
  });

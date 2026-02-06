import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db, events, promoters, users, following } from '@/backend/db';
import { eq } from 'drizzle-orm';
import { sendNotification } from '@/backend/lib/send-notification';

export const approveEventProcedure = publicProcedure
  .input(
    z.object({
      eventId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log('✅ Aprovando evento:', input.eventId);

    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, input.eventId))
      .limit(1);

    if (!event || event.length === 0) {
      throw new Error('Evento não encontrado');
    }

    const result = await db
      .update(events)
      .set({ status: 'published' })
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
        await sendNotification({
          userId: promoterUser[0].id,
          type: 'event_approved',
          title: 'Evento Aprovado! 🎉',
          message: `O seu evento "${event[0].title}" foi aprovado e está agora publicado.`,
          data: {
            eventId: input.eventId,
            eventTitle: event[0].title,
          },
        });
        console.log('🔔 Notificação de aprovação enviada ao promotor');
      }

      const followers = await db
        .select()
        .from(following)
        .where(eq(following.promoterId, event[0].promoterId));

      console.log(`🔔 Enviando notificações para ${followers.length} seguidores do promotor ${promoter[0].name}`);

      const eventDate = new Date(event[0].date);
      const formattedDate = eventDate.toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      for (const follower of followers) {
        try {
          await sendNotification({
            userId: follower.userId,
            type: 'new_promoter_event',
            title: `${promoter[0].name} tem um novo evento! 🎉`,
            message: `${event[0].title} - ${formattedDate} em ${event[0].venueName}`,
            data: {
              eventId: input.eventId,
              eventTitle: event[0].title,
              promoterId: event[0].promoterId,
              promoterName: promoter[0].name,
              type: 'new_event_from_followed_promoter',
            },
          });
        } catch (error) {
          console.error(`❌ Erro ao enviar notificação para seguidor ${follower.userId}:`, error);
        }
      }

      if (followers.length > 0) {
        console.log(`✅ Notificações enviadas para todos os seguidores`);
      }
    }

    return result[0];
  });

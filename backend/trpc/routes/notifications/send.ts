import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db, pushTokens, notifications } from '@/backend/db';
import { eq } from 'drizzle-orm';

export const sendPushNotificationProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      type: z.enum(['event_approved', 'ad_approved', 'ticket_sold', 'event_reminder', 'follower', 'system']),
      title: z.string(),
      message: z.string(),
      data: z.record(z.string(), z.any()).optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('🔔 Enviando notificação push:', input.title);

    const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const notification = await db.insert(notifications).values({
      id: notifId,
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data ? JSON.stringify(input.data) : null,
      isRead: false,
    }).returning();

    const userTokens = await db
      .select()
      .from(pushTokens)
      .where(eq(pushTokens.userId, input.userId));

    const activeTokens = userTokens.filter(t => t.isActive);

    if (activeTokens.length === 0) {
      console.log('⚠️ Nenhum token ativo para o usuário');
      return { notification: notification[0], sent: 0 };
    }

    const expoPushMessages = activeTokens.map(tokenRecord => ({
      to: tokenRecord.token,
      sound: 'default' as const,
      title: input.title,
      body: input.message,
      data: input.data || {},
    }));

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expoPushMessages),
      });

      const result = await response.json();
      console.log('✅ Notificação enviada:', result);

      return { notification: notification[0], sent: activeTokens.length };
    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error);
      return { notification: notification[0], sent: 0, error: String(error) };
    }
  });

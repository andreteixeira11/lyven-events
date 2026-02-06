import { db, pushTokens, notifications } from '@/backend/db';
import { eq } from 'drizzle-orm';

interface NotificationPayload {
  userId: string;
  type: 'event_approved' | 'ad_approved' | 'ticket_sold' | 'event_reminder' | 'follower' | 'system' | 'new_promoter_event';
  title: string;
  message: string;
  data?: Record<string, any>;
}

export async function sendNotification(payload: NotificationPayload) {
  console.log('🔔 Enviando notificação:', payload.title);

  const notifId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const notification = await db.insert(notifications).values({
    id: notifId,
    userId: payload.userId,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    data: payload.data ? JSON.stringify(payload.data) : undefined,
    isRead: false,
  }).returning();

  const userTokens = await db
    .select()
    .from(pushTokens)
    .where(eq(pushTokens.userId, payload.userId));

  const activeTokens = userTokens.filter(t => t.isActive);

  if (activeTokens.length === 0) {
    console.log('⚠️ Nenhum token ativo para o usuário');
    return { notification: notification[0], sent: 0 };
  }

  const expoPushMessages = activeTokens.map(tokenRecord => ({
    to: tokenRecord.token,
    sound: 'default' as const,
    title: payload.title,
    body: payload.message,
    data: payload.data || {},
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
}

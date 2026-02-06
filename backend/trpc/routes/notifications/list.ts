import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db, notifications } from '@/backend/db';
import { eq, desc } from 'drizzle-orm';

export const listNotificationsProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      limit: z.number().optional().default(50),
    })
  )
  .query(async ({ input }) => {
    console.log('📋 Listando notificações:', input.userId);

    const result = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, input.userId))
      .orderBy(desc(notifications.createdAt))
      .limit(input.limit);

    return result.map(n => ({
      ...n,
      data: n.data ? JSON.parse(n.data) : undefined,
    }));
  });

import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db, notifications } from '@/backend/db';
import { eq } from 'drizzle-orm';

export const markNotificationReadProcedure = publicProcedure
  .input(
    z.object({
      notificationId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, input.notificationId))
      .returning();

    return result[0];
  });

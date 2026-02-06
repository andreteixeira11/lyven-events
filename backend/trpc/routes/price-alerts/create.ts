import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '@/backend/db';
import { priceAlerts } from '@/backend/db/schema';

export const createPriceAlertProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      eventId: z.string(),
      targetPrice: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    const id = `price_alert_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    await db
      .insert(priceAlerts)
      .values({
        id,
        userId: input.userId,
        eventId: input.eventId,
        targetPrice: input.targetPrice,
        isActive: true,
        createdAt: new Date().toISOString(),
      })
      .run();

    return { id, success: true };
  });

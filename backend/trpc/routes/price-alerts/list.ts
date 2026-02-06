import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '@/backend/db';
import { priceAlerts } from '@/backend/db/schema';
import { eq } from 'drizzle-orm';

export const listPriceAlertsProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const alerts = await db
      .select()
      .from(priceAlerts)
      .where(eq(priceAlerts.userId, input.userId))
      .all();

    return alerts;
  });

import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '@/backend/db';
import { priceAlerts } from '@/backend/db/schema';
import { eq } from 'drizzle-orm';

export const deletePriceAlertProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    await db
      .delete(priceAlerts)
      .where(eq(priceAlerts.id, input.id))
      .run();

    return { success: true };
  });

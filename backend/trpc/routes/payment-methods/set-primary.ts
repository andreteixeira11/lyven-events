import { publicProcedure } from '../../create-context';
import { db } from '@/backend/db';
import { paymentMethods } from '@/backend/db/schema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

export const setPrimaryPaymentMethodProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    userId: z.string(),
  }))
  .mutation(async ({ input }) => {
    await db
      .update(paymentMethods)
      .set({ isPrimary: false })
      .where(eq(paymentMethods.userId, input.userId))
      .run();

    await db
      .update(paymentMethods)
      .set({ isPrimary: true, updatedAt: new Date().toISOString() })
      .where(eq(paymentMethods.id, input.id))
      .run();

    return { success: true };
  });

import { publicProcedure } from '../../create-context';
import { db } from '@/backend/db';
import { paymentMethods } from '@/backend/db/schema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

export const deletePaymentMethodProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ input }) => {
    await db
      .delete(paymentMethods)
      .where(eq(paymentMethods.id, input.id))
      .run();

    return { success: true };
  });

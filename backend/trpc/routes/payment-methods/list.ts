import { publicProcedure } from '../../create-context';
import { db } from '@/backend/db';
import { paymentMethods } from '@/backend/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const listPaymentMethodsProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
  }))
  .query(async ({ input }) => {
    const methods = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.userId, input.userId))
      .all();

    return methods;
  });

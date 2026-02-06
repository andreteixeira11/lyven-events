import { publicProcedure } from '../../create-context';
import { db } from '@/backend/db';
import { paymentMethods } from '@/backend/db/schema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

export const updatePaymentMethodProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    userId: z.string(),
    isPrimary: z.boolean().optional(),
    accountHolderName: z.string().optional(),
    bankName: z.string().optional(),
    iban: z.string().optional(),
    swift: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().optional(),
    accountId: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    if (input.isPrimary) {
      await db
        .update(paymentMethods)
        .set({ isPrimary: false })
        .where(eq(paymentMethods.userId, input.userId))
        .run();
    }

    await db
      .update(paymentMethods)
      .set({
        isPrimary: input.isPrimary,
        accountHolderName: input.accountHolderName,
        bankName: input.bankName,
        iban: input.iban,
        swift: input.swift,
        phoneNumber: input.phoneNumber,
        email: input.email,
        accountId: input.accountId,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(paymentMethods.id, input.id))
      .run();

    const method = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.id, input.id))
      .get();

    return method;
  });

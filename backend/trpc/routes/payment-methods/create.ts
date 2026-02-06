import { publicProcedure } from '../../create-context';
import { db } from '@/backend/db';
import { paymentMethods } from '@/backend/db/schema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

export const createPaymentMethodProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    type: z.enum(['bank_transfer', 'mbway', 'paypal', 'stripe']),
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
    const id = `pm-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    if (input.isPrimary) {
      await db
        .update(paymentMethods)
        .set({ isPrimary: false })
        .where(eq(paymentMethods.userId, input.userId))
        .run();
    }

    await db.insert(paymentMethods).values({
      id,
      userId: input.userId,
      type: input.type,
      isPrimary: input.isPrimary ?? false,
      accountHolderName: input.accountHolderName ?? null,
      bankName: input.bankName ?? null,
      iban: input.iban ?? null,
      swift: input.swift ?? null,
      phoneNumber: input.phoneNumber ?? null,
      email: input.email ?? null,
      accountId: input.accountId ?? null,
      isVerified: false,
    }).run();

    const method = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.id, id))
      .get();

    return method;
  });

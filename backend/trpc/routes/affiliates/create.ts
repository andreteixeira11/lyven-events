import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '@/backend/db';
import { affiliates } from '@/backend/db/schema';

export const createAffiliateProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      code: z.string(),
      commissionRate: z.number().default(0.1),
    })
  )
  .mutation(async ({ input }) => {
    const id = `affiliate_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    await db
      .insert(affiliates)
      .values({
        id,
        userId: input.userId,
        code: input.code,
        commissionRate: input.commissionRate,
        totalEarnings: 0,
        totalSales: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
      })
      .run();

    return { id, success: true };
  });

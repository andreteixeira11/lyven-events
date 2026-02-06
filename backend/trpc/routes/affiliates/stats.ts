import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '@/backend/db';
import { affiliates } from '@/backend/db/schema';
import { eq } from 'drizzle-orm';

export const getAffiliateStatsProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const affiliate = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.userId, input.userId))
      .get();

    if (!affiliate) {
      return null;
    }

    return {
      code: affiliate.code,
      totalEarnings: affiliate.totalEarnings,
      totalSales: affiliate.totalSales,
      commissionRate: affiliate.commissionRate,
      isActive: affiliate.isActive,
    };
  });

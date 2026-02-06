import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '@/backend/db';
import { affiliateSales, affiliates } from '@/backend/db/schema';
import { eq } from 'drizzle-orm';

export const recordAffiliateSaleProcedure = publicProcedure
  .input(
    z.object({
      affiliateId: z.string(),
      ticketId: z.string(),
      commission: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    const id = `aff_sale_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    await db
      .insert(affiliateSales)
      .values({
        id,
        affiliateId: input.affiliateId,
        ticketId: input.ticketId,
        commission: input.commission,
        status: 'pending',
        createdAt: new Date().toISOString(),
      })
      .run();

    const affiliate = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.id, input.affiliateId))
      .get();

    if (affiliate) {
      await db
        .update(affiliates)
        .set({
          totalEarnings: affiliate.totalEarnings + input.commission,
          totalSales: affiliate.totalSales + 1,
        })
        .where(eq(affiliates.id, input.affiliateId))
        .run();
    }

    return { id, success: true };
  });

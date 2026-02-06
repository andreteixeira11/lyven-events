import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '@/backend/db';
import { affiliates } from '@/backend/db/schema';
import { eq } from 'drizzle-orm';

export const getAffiliateByUserProcedure = publicProcedure
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

    return affiliate || null;
  });

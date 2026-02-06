import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '@/backend/db';
import { affiliates } from '@/backend/db/schema';
import { eq } from 'drizzle-orm';

export const getAffiliateByCodeProcedure = publicProcedure
  .input(
    z.object({
      code: z.string(),
    })
  )
  .query(async ({ input }) => {
    const affiliate = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.code, input.code))
      .get();

    return affiliate || null;
  });

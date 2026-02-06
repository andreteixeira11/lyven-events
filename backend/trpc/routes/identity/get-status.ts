import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '@/backend/db';
import { identityVerifications } from '@/backend/db/schema';
import { eq } from 'drizzle-orm';

export const getVerificationStatusProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const verification = await db
      .select()
      .from(identityVerifications)
      .where(eq(identityVerifications.userId, input.userId))
      .get();

    return verification || null;
  });

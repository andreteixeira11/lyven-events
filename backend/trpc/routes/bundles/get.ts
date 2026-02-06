import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '@/backend/db';
import { eventBundles } from '@/backend/db/schema';
import { eq } from 'drizzle-orm';

export const getBundleProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ input }) => {
    const bundle = await db
      .select()
      .from(eventBundles)
      .where(eq(eventBundles.id, input.id))
      .get();

    if (!bundle) {
      throw new Error('Bundle not found');
    }

    return {
      ...bundle,
      eventIds: JSON.parse(bundle.eventIds),
    };
  });

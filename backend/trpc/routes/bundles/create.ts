import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '@/backend/db';
import { eventBundles } from '@/backend/db/schema';

export const createBundleProcedure = publicProcedure
  .input(
    z.object({
      name: z.string(),
      description: z.string(),
      eventIds: z.array(z.string()),
      discount: z.number(),
      image: z.string(),
      validUntil: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const id = `bundle_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    await db
      .insert(eventBundles)
      .values({
        id,
        name: input.name,
        description: input.description,
        eventIds: JSON.stringify(input.eventIds),
        discount: input.discount,
        image: input.image,
        isActive: true,
        validUntil: input.validUntil,
        createdAt: new Date().toISOString(),
      })
      .run();

    return { id, success: true };
  });

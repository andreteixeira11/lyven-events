import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '@/backend/db';
import { eventBundles } from '@/backend/db/schema';


export const listBundlesProcedure = publicProcedure
  .input(
    z.object({
      activeOnly: z.boolean().default(true),
    })
  )
  .query(async ({ input }) => {
    const now = new Date().toISOString();
    
    const allBundles = await db
      .select()
      .from(eventBundles)
      .all();

    const bundles = allBundles
      .filter((bundle) => {
        if (input.activeOnly) {
          return bundle.isActive && bundle.validUntil > now;
        }
        return true;
      })
      .map((bundle) => ({
        ...bundle,
        eventIds: JSON.parse(bundle.eventIds),
      }));

    return bundles;
  });

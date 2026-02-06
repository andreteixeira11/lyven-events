import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '@/backend/db';
import { eventViews } from '@/backend/db/schema';
import { eq, and, gt, count } from 'drizzle-orm';

export const getActiveViewers = publicProcedure
  .input(
    z.object({
      eventId: z.string(),
    })
  )
  .query(async ({ input }) => {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const result = await db
        .select({ count: count() })
        .from(eventViews)
        .where(
          and(
            eq(eventViews.eventId, input.eventId),
            gt(eventViews.lastActiveAt, fiveMinutesAgo)
          )
        )
        .get();

      return {
        eventId: input.eventId,
        activeViewers: result?.count ?? 0,
      };
    } catch (err: any) {
      if (err?.message?.includes('no such table') || err?.message?.includes('event_views')) {
        console.warn('[getActiveViewers] event_views table missing:', err?.message);
        return { eventId: input.eventId, activeViewers: 0 };
      }
      throw err;
    }
  });

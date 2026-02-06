import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '@/backend/db';
import { eventViews } from '@/backend/db/schema';
import { eq, and, gt } from 'drizzle-orm';

export const trackView = publicProcedure
  .input(
    z.object({
      eventId: z.string(),
      userId: z.string().optional(),
      sessionId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const now = new Date().toISOString();
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const existingView = await db
        .select()
        .from(eventViews)
        .where(
          and(
            eq(eventViews.eventId, input.eventId),
            eq(eventViews.sessionId, input.sessionId),
            gt(eventViews.lastActiveAt, fiveMinutesAgo)
          )
        )
        .get();

      if (existingView) {
        await db
          .update(eventViews)
          .set({ lastActiveAt: now })
          .where(eq(eventViews.id, existingView.id))
          .run();
      } else {
        const id = `view_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        await db
          .insert(eventViews)
          .values({
            id,
            eventId: input.eventId,
            userId: input.userId,
            sessionId: input.sessionId,
            viewedAt: now,
            lastActiveAt: now,
          })
          .run();
      }
    } catch (err: any) {
      if (err?.message?.includes('no such table') || err?.message?.includes('event_views')) {
        console.warn('[trackView] event_views table missing, skipping:', err?.message);
      } else {
        throw err;
      }
    }
    return { success: true };
  });

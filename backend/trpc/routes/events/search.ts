import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '@/backend/db';
import { events } from '@/backend/db/schema';
import { like, or, and, eq } from 'drizzle-orm';

export const searchEventsProcedure = publicProcedure
  .input(
    z.object({
      query: z.string(),
      category: z.string().optional(),
      city: z.string().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      limit: z.number().default(20),
    })
  )
  .query(async ({ input }) => {
    const conditions = [
      eq(events.status, 'published'),
    ];

    if (input.query) {
      conditions.push(
        or(
          like(events.title, `%${input.query}%`),
          like(events.venueCity, `%${input.query}%`),
          like(events.venueName, `%${input.query}%`),
          like(events.description, `%${input.query}%`),
          like(events.tags, `%${input.query}%`)
        ) as any
      );
    }

    if (input.category && input.category !== 'all') {
      conditions.push(eq(events.category, input.category as any));
    }

    if (input.city) {
      conditions.push(like(events.venueCity, `%${input.city}%`));
    }

    if (input.dateFrom) {
      conditions.push(eq(events.date, input.dateFrom));
    }

    const results = await db
      .select()
      .from(events)
      .where(and(...conditions))
      .limit(input.limit)
      .all();

    return results.map((event) => ({
      ...event,
      artists: JSON.parse(event.artists),
      ticketTypes: JSON.parse(event.ticketTypes),
      tags: JSON.parse(event.tags),
    }));
  });

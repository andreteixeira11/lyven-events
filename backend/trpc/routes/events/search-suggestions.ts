import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '@/backend/db';
import { events } from '@/backend/db/schema';
import { eq } from 'drizzle-orm';

export const getSearchSuggestionsProcedure = publicProcedure
  .input(
    z.object({
      query: z.string(),
      limit: z.number().default(5),
    })
  )
  .query(async ({ input }) => {
    if (!input.query || input.query.length < 2) {
      return [];
    }

    const results = await db
      .select({
        title: events.title,
        venueCity: events.venueCity,
        venueName: events.venueName,
      })
      .from(events)
      .where(
        eq(events.status, 'published')
      )
      .limit(input.limit)
      .all();

    const suggestions = new Set<string>();
    
    results.forEach((event) => {
      const queryLower = input.query.toLowerCase();
      if (event.title.toLowerCase().includes(queryLower)) {
        suggestions.add(event.title);
      }
      if (event.venueCity.toLowerCase().includes(queryLower)) {
        suggestions.add(event.venueCity);
      }
      if (event.venueName.toLowerCase().includes(queryLower)) {
        suggestions.add(event.venueName);
      }
    });

    return Array.from(suggestions).slice(0, input.limit);
  });

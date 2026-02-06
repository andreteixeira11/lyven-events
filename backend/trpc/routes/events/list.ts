import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db, events, promoters } from '@/backend/db';
import { eq, like, and } from 'drizzle-orm';

export const listEventsProcedure = publicProcedure
  .input(
    z.object({
      category: z.enum(['music', 'theater', 'comedy', 'dance', 'festival', 'other']).optional(),
      search: z.string().optional(),
      city: z.string().optional(),
      featured: z.boolean().optional(),
      promoterId: z.string().optional(),
    }).optional()
  )
  .query(async ({ input }) => {
    let query = db.select().from(events);

    const conditions = [];

    if (input?.category) {
      conditions.push(eq(events.category, input.category));
    }

    if (input?.search) {
      conditions.push(like(events.title, `%${input.search}%`));
    }

    if (input?.city) {
      conditions.push(eq(events.venueCity, input.city));
    }

    if (input?.featured !== undefined) {
      conditions.push(eq(events.isFeatured, input.featured));
    }

    if (input?.promoterId) {
      conditions.push(eq(events.promoterId, input.promoterId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const eventsList = await query;

    const eventsWithPromoters = await Promise.all(
      eventsList.map(async (event) => {
        const promoter = await db.query.promoters.findFirst({
          where: eq(promoters.id, event.promoterId),
        });

        return {
          id: event.id,
          title: event.title,
          artists: JSON.parse(event.artists),
          venue: {
            id: `v_${event.id}`,
            name: event.venueName,
            address: event.venueAddress,
            city: event.venueCity,
            capacity: event.venueCapacity,
          },
          date: new Date(event.date),
          endDate: event.endDate ? new Date(event.endDate) : undefined,
          image: event.image,
          description: event.description,
          category: event.category,
          ticketTypes: JSON.parse(event.ticketTypes),
          isSoldOut: event.isSoldOut,
          isFeatured: event.isFeatured,
          duration: event.duration,
          promoter: promoter || {
            id: event.promoterId,
            name: 'Unknown Promoter',
            image: '',
            description: '',
            verified: false,
            followersCount: 0,
          },
          tags: JSON.parse(event.tags),
          socialLinks: {
            instagram: event.instagramLink,
            facebook: event.facebookLink,
            twitter: event.twitterLink,
            website: event.websiteLink,
          },
          coordinates: event.latitude && event.longitude ? {
            latitude: event.latitude,
            longitude: event.longitude,
          } : undefined,
        };
      })
    );

    return eventsWithPromoters;
  });

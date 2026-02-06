import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db, events, promoters } from '@/backend/db';
import { eq } from 'drizzle-orm';

export const getEventProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const event = await db.query.events.findFirst({
      where: eq(events.id, input.id),
    });

    if (!event) {
      throw new Error('Event not found');
    }

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
  });

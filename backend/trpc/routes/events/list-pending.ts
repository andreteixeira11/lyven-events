import { publicProcedure } from '../../create-context';
import { db, events, promoters } from '@/backend/db';
import { eq } from 'drizzle-orm';

export const listPendingEventsProcedure = publicProcedure
  .query(async () => {
    console.log('📋 Listando eventos pendentes de aprovação');

    const pendingEvents = await db
      .select()
      .from(events)
      .where(eq(events.status, 'pending'));

    const eventsWithPromoters = await Promise.all(
      pendingEvents.map(async (event) => {
        const promoter = await db
          .select()
          .from(promoters)
          .where(eq(promoters.id, event.promoterId))
          .limit(1);

        return {
          id: event.id,
          title: event.title,
          artists: JSON.parse(event.artists),
          venue: {
            name: event.venueName,
            address: event.venueAddress,
            city: event.venueCity,
            capacity: event.venueCapacity,
          },
          date: event.date,
          endDate: event.endDate,
          image: event.image,
          description: event.description,
          category: event.category,
          ticketTypes: JSON.parse(event.ticketTypes),
          promoter: promoter && promoter.length > 0 ? {
            id: promoter[0].id,
            name: promoter[0].name,
            image: promoter[0].image,
            description: promoter[0].description,
            verified: promoter[0].verified,
            followersCount: promoter[0].followersCount,
          } : null,
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
          } : null,
          status: event.status,
          createdAt: event.createdAt,
        };
      })
    );

    console.log(`✅ Encontrados ${eventsWithPromoters.length} eventos pendentes`);
    return eventsWithPromoters;
  });

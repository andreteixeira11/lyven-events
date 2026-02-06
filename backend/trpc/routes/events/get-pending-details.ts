import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db, events, promoters, tickets, eventStatistics } from '@/backend/db';
import { eq } from 'drizzle-orm';

export const getPendingEventDetailsProcedure = publicProcedure
  .input(
    z.object({
      eventId: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log('🔍 Buscando detalhes do evento pendente:', input.eventId);

    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, input.eventId))
      .limit(1);

    if (!event || event.length === 0) {
      throw new Error('Evento não encontrado');
    }

    const eventData = event[0];

    const promoter = await db
      .select()
      .from(promoters)
      .where(eq(promoters.id, eventData.promoterId))
      .limit(1);

    const ticketsSold = await db
      .select()
      .from(tickets)
      .where(eq(tickets.eventId, input.eventId));

    const stats = await db
      .select()
      .from(eventStatistics)
      .where(eq(eventStatistics.eventId, input.eventId))
      .limit(1);

    const result = {
      id: eventData.id,
      title: eventData.title,
      artists: JSON.parse(eventData.artists),
      venue: {
        name: eventData.venueName,
        address: eventData.venueAddress,
        city: eventData.venueCity,
        capacity: eventData.venueCapacity,
      },
      date: eventData.date,
      endDate: eventData.endDate,
      image: eventData.image,
      description: eventData.description,
      category: eventData.category,
      ticketTypes: JSON.parse(eventData.ticketTypes),
      isSoldOut: eventData.isSoldOut,
      isFeatured: eventData.isFeatured,
      duration: eventData.duration,
      promoter: promoter && promoter.length > 0 ? {
        id: promoter[0].id,
        name: promoter[0].name,
        image: promoter[0].image,
        description: promoter[0].description,
        verified: promoter[0].verified,
        followersCount: promoter[0].followersCount,
      } : null,
      tags: JSON.parse(eventData.tags),
      socialLinks: {
        instagram: eventData.instagramLink,
        facebook: eventData.facebookLink,
        twitter: eventData.twitterLink,
        website: eventData.websiteLink,
      },
      coordinates: eventData.latitude && eventData.longitude ? {
        latitude: eventData.latitude,
        longitude: eventData.longitude,
      } : null,
      status: eventData.status,
      createdAt: eventData.createdAt,
      statistics: stats && stats.length > 0 ? {
        totalTicketsSold: stats[0].totalTicketsSold,
        totalRevenue: stats[0].totalRevenue,
        ticketTypeStats: JSON.parse(stats[0].ticketTypeStats),
        dailySales: JSON.parse(stats[0].dailySales),
      } : {
        totalTicketsSold: ticketsSold.length,
        totalRevenue: ticketsSold.reduce((sum, ticket) => sum + ticket.price, 0),
        ticketTypeStats: [],
        dailySales: [],
      },
    };

    console.log('✅ Detalhes do evento carregados');
    return result;
  });

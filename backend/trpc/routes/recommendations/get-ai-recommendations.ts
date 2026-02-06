import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db } from '../../../db';
import { events, tickets, users } from '../../../db/schema';
import { eq, and, gte } from 'drizzle-orm';

export const getAIRecommendationsProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      limit: z.number().default(5),
    })
  )
  .query(async ({ input }) => {
    const { userId, limit } = input;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return { recommendations: [] };
    }

    const userTickets = await db.query.tickets.findMany({
      where: eq(tickets.userId, userId),
      limit: 10,
    });

    const ticketEventIds = userTickets.map(t => t.eventId);
    const pastEventsData = ticketEventIds.length > 0
      ? await db.select().from(events).where(eq(events.id, ticketEventIds[0]))
      : [];

    const upcomingEvents = await db.query.events.findMany({
      where: and(
        eq(events.status, 'published'),
        gte(events.date, new Date().toISOString())
      ),
      limit: 50,
    });

    const userProfile = {
      interests: user.interests ? JSON.parse(user.interests) : [],
      location: user.locationCity || '',
      userType: user.userType || 'normal',
      pastEvents: pastEventsData.map((e) => ({
        title: e.title,
        category: e.category,
        tags: e.tags ? JSON.parse(e.tags) : [],
      })),
    };

    const eventsData = upcomingEvents.map((e) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      tags: e.tags ? JSON.parse(e.tags) : [],
      city: e.venueCity,
      date: e.date,
      isFeatured: e.isFeatured,
    }));

    try {
      // Dynamic import so @rork-ai/toolkit-sdk (which uses expo/fetch) is not loaded at startup in Node
      const { generateObject } = await import('@rork-ai/toolkit-sdk');
      const aiResult = await generateObject({
        messages: [
          {
            role: 'user',
            content: `Tu és um sistema de recomendação de eventos inteligente.
            
Perfil do utilizador:
- Interesses: ${Array.isArray(userProfile.interests) ? userProfile.interests.join(', ') : 'Não especificados'}
- Localização: ${userProfile.location || 'Não especificada'}
- Tipo: ${userProfile.userType}
- Eventos anteriores: ${JSON.stringify(userProfile.pastEvents)}

Eventos disponíveis:
${JSON.stringify(eventsData)}

Recomenda os ${limit} melhores eventos para este utilizador.
Para cada evento, explica porque é uma boa escolha em português.`,
          },
        ],
        schema: z.object({
          recommendations: z.array(
            z.object({
              eventId: z.string(),
              reason: z.string(),
              score: z.number().min(0).max(100),
            })
          ),
        }),
      });

      const recommendationsWithEvents = aiResult.recommendations.map((rec) => {
        const event = upcomingEvents.find((e) => e.id === rec.eventId);
        return {
          ...rec,
          event,
        };
      });

      return { 
        recommendations: recommendationsWithEvents,
        source: 'ai' as const 
      };
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      
      return {
        recommendations: upcomingEvents.slice(0, limit).map((event) => ({
          eventId: event.id,
          reason: 'Evento recomendado com base na popularidade',
          score: 50,
          event,
        })),
        source: 'fallback' as const
      };
    }
  });

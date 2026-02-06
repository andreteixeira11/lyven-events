import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db } from '../../../db';
import { events, tickets, users } from '../../../db/schema';
import { eq, and, desc, gte } from 'drizzle-orm';

export const getSmartRecommendationsProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      limit: z.number().default(10),
      includeReasons: z.boolean().default(true),
    })
  )
  .query(async ({ input }) => {
    const { userId, limit, includeReasons } = input;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return { recommendations: [] };
    }

    const userTickets = await db.query.tickets.findMany({
      where: eq(tickets.userId, userId),
    });

    const ticketEventIds = userTickets.map(t => t.eventId);
    const pastEvents = ticketEventIds.length > 0
      ? await db.select().from(events).where(eq(events.id, ticketEventIds[0]))
      : [];

    const userInterests = user.interests ? JSON.parse(user.interests) : [];
    const userLocation = user.locationCity || '';
    
    type EventCategory = 'music' | 'theater' | 'comedy' | 'dance' | 'festival' | 'other';
    const pastEventCategories: EventCategory[] = pastEvents
      .map((event) => event.category)
      .filter((cat): cat is EventCategory => Boolean(cat));

    const upcomingEvents = await db.query.events.findMany({
      where: and(
        eq(events.status, 'published'),
        gte(events.date, new Date().toISOString())
      ),
      orderBy: [desc(events.date)],
      limit: 100,
    });

    interface ScoredEvent {
      event: typeof upcomingEvents[number];
      score: number;
      reasons: string[];
    }

    const scoredEvents: ScoredEvent[] = upcomingEvents.map((event) => {
      let score = 0;
      const reasons: string[] = [];

      const eventTags = event.tags ? JSON.parse(event.tags) : [];
      if (Array.isArray(userInterests) && userInterests.some((interest) => eventTags.includes(interest))) {
        score += 30;
        reasons.push('Corresponde aos teus interesses');
      }

      if (pastEventCategories.includes(event.category)) {
        score += 20;
        reasons.push('Categoria que já assististe antes');
      }

      if (event.venueCity && userLocation && event.venueCity.toLowerCase().includes(userLocation.toLowerCase())) {
        score += 25;
        reasons.push('Perto da tua localização');
      }

      if (event.isFeatured) {
        score += 15;
        reasons.push('Evento em destaque');
      }

      const daysUntilEvent = Math.floor(
        (new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilEvent <= 7) {
        score += 10;
        reasons.push('Acontece em breve');
      }

      score += Math.random() * 10;

      return {
        event,
        score,
        reasons: includeReasons ? reasons : [],
      };
    });

    scoredEvents.sort((a, b) => b.score - a.score);

    const recommendations = scoredEvents.slice(0, limit).map((item, index) => ({
      eventId: item.event.id,
      score: item.score,
      reasons: item.reasons,
      rank: index + 1,
      basedOn: determineBasedOn(item.reasons),
      event: item.event,
    }));

    return { recommendations };
  });

function determineBasedOn(reasons: string[]): 'interests' | 'location' | 'history' | 'featured' | 'mixed' {
  if (reasons.includes('Corresponde aos teus interesses')) return 'interests';
  if (reasons.includes('Perto da tua localização')) return 'location';
  if (reasons.includes('Categoria que já assististe antes')) return 'history';
  if (reasons.includes('Evento em destaque')) return 'featured';
  return 'mixed';
}

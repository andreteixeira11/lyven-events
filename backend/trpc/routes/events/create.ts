import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db, events, promoters, following } from '@/backend/db';
import { sendEventPendingEmail } from '@/backend/lib/send-email';
import { sendNotification } from '@/backend/lib/send-notification';
import { eq } from 'drizzle-orm';

const mapCategoryToDb = (category: string): 'music' | 'theater' | 'comedy' | 'dance' | 'festival' | 'other' => {
  const mapping: Record<string, 'music' | 'theater' | 'comedy' | 'dance' | 'festival' | 'other'> = {
    'Música': 'music',
    'Teatro': 'theater',
    'Dança': 'dance',
    'Comédia': 'comedy',
    'Festival': 'festival',
    'Conferência': 'other',
    'Desporto': 'other',
    'Arte': 'other',
    'Outro': 'other',
  };
  
  return mapping[category] || 'other';
};

export const createEventProcedure = publicProcedure
  .input(
    z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      venue: z.string().min(1),
      address: z.string().min(1),
      date: z.string(),
      time: z.string().optional(),
      category: z.string(),
      ticketTypes: z.array(z.object({
        name: z.string(),
        stage: z.string(),
        price: z.string(),
        quantity: z.string(),
        description: z.string().optional(),
      })),
      imageUrl: z.string().optional(),
      imageUri: z.string().optional(),
      promoterId: z.string(),
      shouldPromote: z.boolean().optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('📝 Criando evento:', input.title);

    const promoter = await db.select().from(promoters).where(eq(promoters.id, input.promoterId)).limit(1);
    
    if (!promoter || promoter.length === 0) {
      throw new Error('Promoter não encontrado');
    }

    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const processedTickets = input.ticketTypes
      .filter(t => t.name && t.stage && t.price && t.quantity)
      .map((ticket, index) => ({
        id: `ticket_${index + 1}`,
        name: ticket.name,
        stage: ticket.stage,
        price: parseFloat(ticket.price),
        available: parseInt(ticket.quantity),
        description: ticket.description || '',
        maxPerPerson: 10,
      }));

    if (processedTickets.length === 0) {
      throw new Error('Pelo menos um bilhete válido é necessário');
    }

    const dateTimeStr = input.time 
      ? `${input.date}T${input.time}` 
      : `${input.date}T00:00:00`;

    const imageToUse = input.imageUri || input.imageUrl || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800';

    const totalCapacity = processedTickets.reduce((sum, t) => sum + t.available, 0);

    const dbCategory = mapCategoryToDb(input.category);

    const result = await db.insert(events).values({
      id: eventId,
      title: input.title,
      artists: JSON.stringify([{
        id: 'artist_1',
        name: input.title,
        genre: input.category,
        image: imageToUse,
      }]),
      venueName: input.venue,
      venueAddress: input.address,
      venueCity: input.address.split(',').pop()?.trim() || input.venue,
      venueCapacity: totalCapacity,
      date: dateTimeStr,
      endDate: undefined,
      image: imageToUse,
      description: input.description || `${input.title} - ${input.venue}`,
      category: dbCategory,
      ticketTypes: JSON.stringify(processedTickets),
      isSoldOut: false,
      isFeatured: input.shouldPromote || false,
      duration: undefined,
      promoterId: input.promoterId,
      tags: JSON.stringify([input.category]),
      instagramLink: undefined,
      facebookLink: undefined,
      twitterLink: undefined,
      websiteLink: undefined,
      latitude: undefined,
      longitude: undefined,
      status: 'pending',
    }).returning();

    console.log('✅ Evento criado com sucesso:', eventId);

    sendEventPendingEmail(input.title, eventId).catch(error => {
      console.error('Falha ao enviar email de notificação:', error);
    });

    return {
      ...result[0],
      shouldPromote: input.shouldPromote,
    };
  });

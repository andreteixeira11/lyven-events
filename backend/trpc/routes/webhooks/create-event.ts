import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db, events, promoters } from '@/backend/db';
import { sendEventPendingEmail } from '@/backend/lib/send-email';

const ticketTypeSchema = z.object({
  name: z.string().describe('Nome do tipo de bilhete (ex: Early Bird, Normal, VIP, Gratuito)'),
  price: z.number().min(0).describe('Preço do bilhete em €'),
  available: z.number().min(0).describe('Quantidade disponível'),
  description: z.string().optional().describe('Descrição opcional do bilhete'),
  maxPerPerson: z.number().min(1).default(10).describe('Máximo de bilhetes por pessoa'),
});

export const createEventWebhookProcedure = publicProcedure
  .input(
    z.object({
      apiKey: z.string().describe('API Key para autenticação'),
      event: z.object({
        title: z.string().describe('Título do evento'),
        description: z.string().describe('Descrição detalhada do evento'),
        category: z.enum(['music', 'theater', 'comedy', 'dance', 'festival', 'other'])
          .describe('Categoria do evento'),
        
        date: z.string().describe('Data e hora de início (ISO 8601)'),
        endDate: z.string().optional().describe('Data e hora de fim (ISO 8601)'),
        duration: z.number().optional().describe('Duração em minutos'),
        
        venue: z.object({
          name: z.string().describe('Nome do local'),
          address: z.string().describe('Morada completa'),
          city: z.string().describe('Cidade'),
          capacity: z.number().describe('Capacidade total do local'),
          latitude: z.number().optional().describe('Latitude'),
          longitude: z.number().optional().describe('Longitude'),
        }),
        
        images: z.object({
          cover: z.string().url().describe('URL da imagem de capa do evento'),
        }),
        
        promoter: z.object({
          name: z.string().describe('Nome do promotor'),
          image: z.string().url().describe('URL da imagem do promotor'),
          description: z.string().optional().describe('Descrição do promotor'),
        }),
        
        artists: z.array(z.object({
          name: z.string(),
          genre: z.string(),
          image: z.string().url(),
        })).optional().describe('Lista de artistas (opcional)'),
        
        ticketTypes: z.array(ticketTypeSchema)
          .min(1)
          .describe('Tipos de bilhetes disponíveis'),
        
        tags: z.array(z.string()).optional().describe('Tags para categorização'),
        
        socialLinks: z.object({
          instagram: z.string().url().optional(),
          facebook: z.string().url().optional(),
          twitter: z.string().url().optional(),
          website: z.string().url().optional(),
        }).optional(),
        
        isFeatured: z.boolean().optional().default(false)
          .describe('Se o evento deve ser destacado'),
      }),
    })
  )
  .mutation(async ({ input }) => {
    const validApiKey = process.env.WEBHOOK_API_KEY || 'default-key-change-in-production';
    
    if (input.apiKey !== validApiKey) {
      throw new Error('API Key inválida');
    }

    let promoterId: string;
    
    const existingPromoter = await db.query.promoters.findFirst({
      where: (promoters, { eq }) => eq(promoters.name, input.event.promoter.name),
    });

    if (existingPromoter) {
      promoterId = existingPromoter.id;
    } else {
      const newPromoter = await db.insert(promoters).values({
        id: `promoter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: input.event.promoter.name,
        image: input.event.promoter.image,
        description: input.event.promoter.description || '',
        verified: true,
        followersCount: 0,
      }).returning();
      
      promoterId = newPromoter[0].id;
    }

    const eventId = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const ticketTypesWithIds = input.event.ticketTypes.map(ticket => ({
      id: `ticket-type-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: ticket.name,
      price: ticket.price,
      available: ticket.available,
      description: ticket.description,
      maxPerPerson: ticket.maxPerPerson || 10,
    }));

    const artistsData = input.event.artists?.map(artist => ({
      id: `artist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: artist.name,
      genre: artist.genre,
      image: artist.image,
    })) || [];

    const result = await db.insert(events).values({
      id: eventId,
      title: input.event.title,
      artists: JSON.stringify(artistsData),
      venueName: input.event.venue.name,
      venueAddress: input.event.venue.address,
      venueCity: input.event.venue.city,
      venueCapacity: input.event.venue.capacity,
      date: input.event.date,
      endDate: input.event.endDate,
      image: input.event.images.cover,
      description: input.event.description,
      category: input.event.category,
      ticketTypes: JSON.stringify(ticketTypesWithIds),
      isSoldOut: false,
      isFeatured: input.event.isFeatured || false,
      duration: input.event.duration,
      promoterId: promoterId,
      tags: JSON.stringify(input.event.tags || []),
      instagramLink: input.event.socialLinks?.instagram,
      facebookLink: input.event.socialLinks?.facebook,
      twitterLink: input.event.socialLinks?.twitter,
      websiteLink: input.event.socialLinks?.website,
      latitude: input.event.venue.latitude,
      longitude: input.event.venue.longitude,
      status: 'published',
    }).returning();

    sendEventPendingEmail(input.event.title, eventId).catch(error => {
      console.error('Falha ao enviar email de notificação:', error);
    });

    return {
      success: true,
      eventId: result[0].id,
      message: 'Evento criado com sucesso',
    };
  });

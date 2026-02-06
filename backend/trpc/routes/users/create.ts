import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db, users } from '@/backend/db';
import { Resend } from 'resend';

const RESEND_API_KEY = 're_Hms97Gxb_Bq6YbsvhJC1DdfpETDbfRUti';

export const createUserProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
      phone: z.string().optional(),
      userType: z.enum(['normal', 'promoter']),
      interests: z.array(z.string()),
      location: z.object({
        latitude: z.number(),
        longitude: z.number(),
        city: z.string(),
        region: z.string(),
      }).optional(),
      preferences: z.object({
        notifications: z.boolean(),
        language: z.enum(['pt', 'en']),
        priceRange: z.object({
          min: z.number(),
          max: z.number(),
        }),
        eventTypes: z.array(z.string()),
      }),
    })
  )
  .mutation(async ({ input }) => {
    const result = await db.insert(users).values({
      id: input.id,
      name: input.name,
      email: input.email,
      phone: input.phone,
      userType: input.userType,
      interests: JSON.stringify(input.interests),
      locationLatitude: input.location?.latitude,
      locationLongitude: input.location?.longitude,
      locationCity: input.location?.city,
      locationRegion: input.location?.region,
      preferencesNotifications: input.preferences.notifications,
      preferencesLanguage: input.preferences.language,
      preferencesPriceMin: input.preferences.priceRange.min,
      preferencesPriceMax: input.preferences.priceRange.max,
      preferencesEventTypes: JSON.stringify(input.preferences.eventTypes),
      isOnboardingComplete: true,
    }).returning();

    try {
      const resend = new Resend(RESEND_API_KEY);
      
      await resend.emails.send({
        from: 'Lyven <noreply@lyven.pt>',
        to: 'info@lyven.pt',
        subject: 'Novo Utilizador Registado',
        html: `
          <h2>Novo utilizador criado na plataforma Lyven</h2>
          <p><strong>Nome:</strong> ${input.name}</p>
          <p><strong>Email:</strong> ${input.email}</p>
          <p><strong>Tipo de Utilizador:</strong> ${input.userType === 'promoter' ? 'Promotor' : 'Normal'}</p>
          <p><strong>Localização:</strong> ${input.location?.city || 'Não especificada'}, ${input.location?.region || ''}</p>
          <p><strong>Interesses:</strong> ${input.interests.join(', ')}</p>
          <p><strong>Data de Registo:</strong> ${new Date().toLocaleString('pt-PT')}</p>
        `,
      });
      
      console.log('Email de notificação enviado para info@lyven.pt');
    } catch (error) {
      console.error('Erro ao enviar email de notificação:', error);
    }

    return result[0];
  });

import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db, advertisements } from '@/backend/db';
import { eq } from 'drizzle-orm';
import { sendNotification } from '@/backend/lib/send-notification';

export const approveAdProcedure = publicProcedure
  .input(
    z.object({
      adId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log('✅ Aprovando anúncio:', input.adId);

    const ad = await db
      .select()
      .from(advertisements)
      .where(eq(advertisements.id, input.adId))
      .limit(1);

    if (!ad || ad.length === 0) {
      throw new Error('Anúncio não encontrado');
    }

    const result = await db
      .update(advertisements)
      .set({ isActive: true })
      .where(eq(advertisements.id, input.adId))
      .returning();

    if (ad[0].promoterId) {
      await sendNotification({
        userId: ad[0].promoterId,
        type: 'ad_approved',
        title: 'Anúncio Aprovado! 📢',
        message: `O seu anúncio "${ad[0].title}" foi aprovado e está agora ativo.`,
        data: {
          adId: input.adId,
          adTitle: ad[0].title,
        },
      });
      console.log('🔔 Notificação de aprovação de anúncio enviada');
    }

    return result[0];
  });

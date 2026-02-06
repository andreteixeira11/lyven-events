import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db, pushTokens } from '@/backend/db';
import { eq, and } from 'drizzle-orm';

export const registerPushTokenProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      token: z.string(),
      platform: z.enum(['ios', 'android', 'web']),
    })
  )
  .mutation(async ({ input }) => {
    console.log('📱 Registrando push token:', input.userId);

    const existingToken = await db
      .select()
      .from(pushTokens)
      .where(
        and(
          eq(pushTokens.userId, input.userId),
          eq(pushTokens.token, input.token)
        )
      )
      .limit(1);

    if (existingToken.length > 0) {
      const updated = await db
        .update(pushTokens)
        .set({
          isActive: true,
          lastUsed: new Date().toISOString(),
        })
        .where(eq(pushTokens.id, existingToken[0].id))
        .returning();
      
      console.log('✅ Token atualizado');
      return updated[0];
    }

    const tokenId = `pt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const result = await db.insert(pushTokens).values({
      id: tokenId,
      userId: input.userId,
      token: input.token,
      platform: input.platform,
      isActive: true,
    }).returning();

    console.log('✅ Novo token registrado');
    return result[0];
  });

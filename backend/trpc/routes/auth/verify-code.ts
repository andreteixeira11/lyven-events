import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db } from '@/backend/db';
import { verificationCodes } from '@/backend/db/schema';
import { eq, and } from 'drizzle-orm';

export const verifyCodeProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      code: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('🔍 [VERIFY] Verificando código');
    console.log('🔍 [VERIFY] Email:', input.email);
    console.log('🔍 [VERIFY] Código recebido:', input.code);

    const verificationRecord = await db
      .select()
      .from(verificationCodes)
      .where(
        and(
          eq(verificationCodes.email, input.email),
          eq(verificationCodes.code, input.code),
          eq(verificationCodes.isUsed, false)
        )
      )
      .limit(1);

    if (verificationRecord.length === 0) {
      console.error('❌ [VERIFY] Código inválido ou já usado');
      throw new Error('Código inválido ou já utilizado');
    }

    const record = verificationRecord[0];
    const now = new Date();
    const expiresAt = new Date(record.expiresAt);

    if (now > expiresAt) {
      console.error('❌ [VERIFY] Código expirado');
      throw new Error('Código expirado. Por favor, solicite um novo código.');
    }

    await db
      .update(verificationCodes)
      .set({ isUsed: true })
      .where(eq(verificationCodes.id, record.id));

    console.log('✅ [VERIFY] Código verificado com sucesso');

    return {
      success: true,
      message: 'Código verificado com sucesso',
      userData: {
        email: record.email,
        name: record.name,
        password: record.password,
      },
    };
  });

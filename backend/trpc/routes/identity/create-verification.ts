import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '@/backend/db';
import { identityVerifications } from '@/backend/db/schema';

export const createVerificationProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      documentType: z.enum(['passport', 'id_card', 'drivers_license']),
      documentNumber: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const id = `verification_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    await db
      .insert(identityVerifications)
      .values({
        id,
        userId: input.userId,
        documentType: input.documentType,
        documentNumber: input.documentNumber,
        status: 'pending',
        createdAt: new Date().toISOString(),
      })
      .run();

    return { id, success: true };
  });

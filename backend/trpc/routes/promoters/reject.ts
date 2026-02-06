import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { promoterProfiles, notifications } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const rejectPromoterProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      reason: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const promoter = await db
      .select()
      .from(promoterProfiles)
      .where(eq(promoterProfiles.id, input.id))
      .get();

    if (promoter) {
      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(notifications).values({
        id: notificationId,
        userId: promoter.userId,
        type: "system",
        title: "Perfil de Promotor Rejeitado",
        message: input.reason || "O seu perfil de promotor foi rejeitado. Por favor, contacte o suporte para mais informações.",
        isRead: false,
      });
    }

    await db
      .delete(promoterProfiles)
      .where(eq(promoterProfiles.id, input.id))
      .run();

    return { success: true };
  });

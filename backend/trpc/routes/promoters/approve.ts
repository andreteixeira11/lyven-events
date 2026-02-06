import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { promoterProfiles, notifications } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const approvePromoterProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    const approvalDate = new Date().toISOString();

    await db
      .update(promoterProfiles)
      .set({
        isApproved: true,
        approvalDate,
      })
      .where(eq(promoterProfiles.id, input.id))
      .run();

    const promoter = await db
      .select()
      .from(promoterProfiles)
      .where(eq(promoterProfiles.id, input.id))
      .get();

    if (promoter) {
      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      await db.insert(notifications).values({
        id: notificationId,
        userId: promoter.userId,
        type: "system",
        title: "Perfil de Promotor Aprovado",
        message: "O seu perfil de promotor foi aprovado! Já pode criar eventos.",
        isRead: false,
      });
    }

    return { success: true, promoter };
  });

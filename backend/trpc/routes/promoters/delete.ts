import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { promoterProfiles } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const deletePromoterProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    await db
      .delete(promoterProfiles)
      .where(eq(promoterProfiles.id, input.id))
      .run();

    return { success: true };
  });

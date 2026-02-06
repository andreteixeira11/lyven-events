import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { promoterProfiles } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const getPromoterProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const promoter = await db
      .select()
      .from(promoterProfiles)
      .where(eq(promoterProfiles.id, input.id))
      .get();

    if (!promoter) {
      throw new Error("Promoter not found");
    }

    return promoter;
  });

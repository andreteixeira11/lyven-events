import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { promoterProfiles } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const getPromoterByUserIdProcedure = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    const promoter = await db
      .select()
      .from(promoterProfiles)
      .where(eq(promoterProfiles.userId, input.userId))
      .get();

    return promoter ?? null;
  });

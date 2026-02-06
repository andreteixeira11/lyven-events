import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { promoterProfiles } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const listPendingPromotersProcedure = publicProcedure
  .input(
    z.object({
      limit: z.number().optional().default(20),
      offset: z.number().optional().default(0),
    })
  )
  .query(async ({ input }) => {
    const promoters = await db
      .select()
      .from(promoterProfiles)
      .where(eq(promoterProfiles.isApproved, false))
      .limit(input.limit)
      .offset(input.offset)
      .all();

    return {
      promoters,
      total: promoters.length,
    };
  });

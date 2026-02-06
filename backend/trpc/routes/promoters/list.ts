import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { promoterProfiles } from "../../../db/schema";
import { eq, like, or } from "drizzle-orm";

export const listPromotersProcedure = publicProcedure
  .input(
    z.object({
      limit: z.number().optional().default(20),
      offset: z.number().optional().default(0),
      approved: z.boolean().optional(),
      search: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    let query = db.select().from(promoterProfiles);

    if (input.approved !== undefined) {
      query = query.where(eq(promoterProfiles.isApproved, input.approved)) as any;
    }

    if (input.search) {
      query = query.where(
        or(
          like(promoterProfiles.companyName, `%${input.search}%`),
          like(promoterProfiles.description, `%${input.search}%`)
        )
      ) as any;
    }

    const promoters = await query.limit(input.limit + 1).offset(input.offset).all();

    const hasMore = promoters.length > input.limit;
    if (hasMore) {
      promoters.pop();
    }

    return {
      promoters,
      total: promoters.length,
      hasMore,
    };
  });

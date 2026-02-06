import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { advertisements } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const listPendingAdsProcedure = publicProcedure
  .input(
    z.object({
      limit: z.number().optional().default(20),
      offset: z.number().optional().default(0),
    })
  )
  .query(async ({ input }) => {
    const ads = await db
      .select()
      .from(advertisements)
      .where(eq(advertisements.isActive, false))
      .limit(input.limit)
      .offset(input.offset)
      .all();

    return {
      ads,
      total: ads.length,
    };
  });

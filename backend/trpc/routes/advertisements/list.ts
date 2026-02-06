import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { advertisements } from "../../../db/schema";
import { eq, and } from "drizzle-orm";

export const listAdsProcedure = publicProcedure
  .input(
    z.object({
      limit: z.number().optional().default(20),
      offset: z.number().optional().default(0),
      type: z.enum(["banner", "card", "sponsored_event"]).optional(),
      position: z.enum(["home_top", "home_middle", "search_results", "event_detail"]).optional(),
      active: z.boolean().optional(),
      promoterId: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    let query = db.select().from(advertisements);

    const conditions: any[] = [];

    if (input.type) {
      conditions.push(eq(advertisements.type, input.type));
    }
    if (input.position) {
      conditions.push(eq(advertisements.position, input.position));
    }
    if (input.active !== undefined) {
      conditions.push(eq(advertisements.isActive, input.active));
    }
    if (input.promoterId) {
      conditions.push(eq(advertisements.promoterId, input.promoterId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const ads = await query.limit(input.limit).offset(input.offset).all();

    return {
      ads,
      total: ads.length,
    };
  });

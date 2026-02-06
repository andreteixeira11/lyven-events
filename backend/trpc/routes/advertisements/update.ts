import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { advertisements } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const updateAdProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
      targetUrl: z.string().optional(),
      type: z.enum(["banner", "card", "sponsored_event"]).optional(),
      position: z.enum(["home_top", "home_middle", "search_results", "event_detail"]).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      budget: z.number().optional(),
      isActive: z.boolean().optional(),
      targetAudienceInterests: z.string().optional(),
      targetAudienceAgeMin: z.number().optional(),
      targetAudienceAgeMax: z.number().optional(),
      targetAudienceLocation: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const { id, ...updates } = input;

    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(filteredUpdates).length === 0) {
      throw new Error("No fields to update");
    }

    await db
      .update(advertisements)
      .set(filteredUpdates)
      .where(eq(advertisements.id, id))
      .run();

    const updated = await db
      .select()
      .from(advertisements)
      .where(eq(advertisements.id, id))
      .get();

    return updated;
  });

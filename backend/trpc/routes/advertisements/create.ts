import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { advertisements } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const createAdProcedure = publicProcedure
  .input(
    z.object({
      title: z.string(),
      description: z.string(),
      image: z.string(),
      targetUrl: z.string().optional(),
      type: z.enum(["banner", "card", "sponsored_event"]),
      position: z.enum(["home_top", "home_middle", "search_results", "event_detail"]),
      startDate: z.string(),
      endDate: z.string(),
      budget: z.number(),
      promoterId: z.string().optional(),
      targetAudienceInterests: z.string().optional(),
      targetAudienceAgeMin: z.number().optional(),
      targetAudienceAgeMax: z.number().optional(),
      targetAudienceLocation: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const id = `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(advertisements).values({
      id,
      title: input.title,
      description: input.description,
      image: input.image,
      targetUrl: input.targetUrl,
      type: input.type,
      position: input.position,
      startDate: input.startDate,
      endDate: input.endDate,
      budget: input.budget,
      promoterId: input.promoterId,
      targetAudienceInterests: input.targetAudienceInterests,
      targetAudienceAgeMin: input.targetAudienceAgeMin,
      targetAudienceAgeMax: input.targetAudienceAgeMax,
      targetAudienceLocation: input.targetAudienceLocation,
      isActive: false,
      impressions: 0,
      clicks: 0,
    });

    const ad = await db.select().from(advertisements).where(eq(advertisements.id, id)).get();

    return ad;
  });

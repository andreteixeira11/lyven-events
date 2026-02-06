import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { advertisements } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const getAdStatsProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const ad = await db
      .select()
      .from(advertisements)
      .where(eq(advertisements.id, input.id))
      .get();

    if (!ad) {
      throw new Error("Advertisement not found");
    }

    const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0;
    const costPerClick = ad.clicks > 0 ? ad.budget / ad.clicks : 0;
    const costPerImpression = ad.impressions > 0 ? ad.budget / ad.impressions : 0;

    return {
      impressions: ad.impressions,
      clicks: ad.clicks,
      ctr: parseFloat(ctr.toFixed(2)),
      budget: ad.budget,
      spent: ad.budget,
      costPerClick: parseFloat(costPerClick.toFixed(2)),
      costPerImpression: parseFloat(costPerImpression.toFixed(4)),
    };
  });

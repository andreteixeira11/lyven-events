import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { promoterProfiles } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const updatePromoterProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      companyName: z.string().optional(),
      description: z.string().optional(),
      website: z.string().optional(),
      instagramHandle: z.string().optional(),
      facebookHandle: z.string().optional(),
      twitterHandle: z.string().optional(),
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
      .update(promoterProfiles)
      .set(filteredUpdates)
      .where(eq(promoterProfiles.id, id))
      .run();

    const updated = await db
      .select()
      .from(promoterProfiles)
      .where(eq(promoterProfiles.id, id))
      .get();

    return updated;
  });

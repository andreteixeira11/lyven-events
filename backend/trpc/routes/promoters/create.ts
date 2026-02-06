import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { promoterProfiles } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const createPromoterProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      companyName: z.string(),
      description: z.string(),
      website: z.string().optional(),
      instagramHandle: z.string().optional(),
      facebookHandle: z.string().optional(),
      twitterHandle: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const id = `promoter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(promoterProfiles).values({
      id,
      userId: input.userId,
      companyName: input.companyName,
      description: input.description,
      website: input.website,
      instagramHandle: input.instagramHandle,
      facebookHandle: input.facebookHandle,
      twitterHandle: input.twitterHandle,
      isApproved: false,
      eventsCreated: "[]",
      followers: "[]",
      rating: 0,
      totalEvents: 0,
    });

    const promoter = await db.select().from(promoterProfiles).where(eq(promoterProfiles.id, id)).get();

    return { id, promoter };
  });

import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { events } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const updateEventProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      title: z.string().optional(),
      artists: z.string().optional(),
      venueName: z.string().optional(),
      venueAddress: z.string().optional(),
      venueCity: z.string().optional(),
      venueCapacity: z.number().optional(),
      date: z.string().optional(),
      endDate: z.string().optional(),
      image: z.string().optional(),
      description: z.string().optional(),
      category: z.enum(["music", "theater", "comedy", "dance", "festival", "other"]).optional(),
      ticketTypes: z.string().optional(),
      isSoldOut: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
      duration: z.number().optional(),
      tags: z.string().optional(),
      instagramLink: z.string().optional(),
      facebookLink: z.string().optional(),
      twitterLink: z.string().optional(),
      websiteLink: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      status: z.enum(["draft", "pending", "published", "cancelled", "completed"]).optional(),
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
      .update(events)
      .set(filteredUpdates)
      .where(eq(events.id, id))
      .run();

    const updated = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .get();

    return updated;
  });

import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const updateUserProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      email: z.string().optional(),
      interests: z.string().optional(),
      locationLatitude: z.number().optional(),
      locationLongitude: z.number().optional(),
      locationCity: z.string().optional(),
      locationRegion: z.string().optional(),
      preferencesNotifications: z.boolean().optional(),
      preferencesLanguage: z.enum(["pt", "en"]).optional(),
      preferencesPriceMin: z.number().optional(),
      preferencesPriceMax: z.number().optional(),
      preferencesEventTypes: z.string().optional(),
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
      .update(users)
      .set(filteredUpdates)
      .where(eq(users.id, id))
      .run();

    const updated = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .get();

    return updated;
  });

import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const updateOnboardingProcedure = publicProcedure
  .input(z.object({ 
    id: z.string(),
    phone: z.string().optional(),
    interests: z.array(z.string()).optional(),
    locationCity: z.string().optional(),
    locationRegion: z.string().optional(),
    locationLatitude: z.number().optional(),
    locationLongitude: z.number().optional(),
    preferencesNotifications: z.boolean().optional(),
    preferencesLanguage: z.enum(['pt', 'en']).optional(),
    preferencesPriceMin: z.number().optional(),
    preferencesPriceMax: z.number().optional(),
    preferencesEventTypes: z.array(z.string()).optional(),
  }))
  .mutation(async ({ input }) => {
    const { id, interests, preferencesEventTypes, ...rest } = input;
    
    const updateData: any = {
      ...rest,
      interests: interests ? JSON.stringify(interests) : undefined,
      preferencesEventTypes: preferencesEventTypes ? JSON.stringify(preferencesEventTypes) : undefined,
      isOnboardingComplete: true,
    };

    const cleanedData = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined)
    );

    await db
      .update(users)
      .set(cleanedData)
      .where(eq(users.id, id))
      .run();

    return { success: true };
  });

import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { advertisements } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const recordClickProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    const ad = await db
      .select()
      .from(advertisements)
      .where(eq(advertisements.id, input.id))
      .get();

    if (!ad) {
      throw new Error("Advertisement not found");
    }

    await db
      .update(advertisements)
      .set({ clicks: ad.clicks + 1 })
      .where(eq(advertisements.id, input.id))
      .run();

    return { success: true };
  });

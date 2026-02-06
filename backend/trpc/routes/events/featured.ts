import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { events } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const setEventFeaturedProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      featured: z.boolean(),
    })
  )
  .mutation(async ({ input }) => {
    await db
      .update(events)
      .set({ isFeatured: input.featured })
      .where(eq(events.id, input.id))
      .run();

    const updated = await db
      .select()
      .from(events)
      .where(eq(events.id, input.id))
      .get();

    return updated;
  });

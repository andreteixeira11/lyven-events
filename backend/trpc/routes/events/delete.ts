import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { events } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const deleteEventProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    await db
      .delete(events)
      .where(eq(events.id, input.id))
      .run();

    return { success: true };
  });

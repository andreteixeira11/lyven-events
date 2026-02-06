import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { tickets } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const addToCalendarProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    await db
      .update(tickets)
      .set({ addedToCalendar: true })
      .where(eq(tickets.id, input.id))
      .run();

    return { success: true };
  });

import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { advertisements } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const deleteAdProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    await db
      .delete(advertisements)
      .where(eq(advertisements.id, input.id))
      .run();

    return { success: true };
  });

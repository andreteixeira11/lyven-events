import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { advertisements } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const getAdProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const ad = await db
      .select()
      .from(advertisements)
      .where(eq(advertisements.id, input.id))
      .get();

    if (!ad) {
      throw new Error("Advertisement not found");
    }

    return ad;
  });

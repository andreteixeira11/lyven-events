import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { tickets } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const getTicketProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const ticket = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, input.id))
      .get();

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    return ticket;
  });

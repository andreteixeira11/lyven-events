import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { tickets } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const cancelTicketProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    const ticket = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, input.id))
      .get();

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    if (ticket.isUsed) {
      throw new Error("Cannot cancel a used ticket");
    }

    await db
      .delete(tickets)
      .where(eq(tickets.id, input.id))
      .run();

    const refund = ticket.price * ticket.quantity * 0.9;

    return { success: true, refund };
  });

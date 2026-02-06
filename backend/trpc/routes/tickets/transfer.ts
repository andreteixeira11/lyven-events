import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { tickets } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const transferTicketProcedure = publicProcedure
  .input(
    z.object({
      ticketId: z.string(),
      fromUserId: z.string(),
      toUserId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const ticket = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, input.ticketId))
      .get();

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    if (ticket.userId !== input.fromUserId) {
      throw new Error("Unauthorized: You don't own this ticket");
    }

    if (ticket.isUsed) {
      throw new Error("Cannot transfer a used ticket");
    }

    await db
      .update(tickets)
      .set({ userId: input.toUserId })
      .where(eq(tickets.id, input.ticketId))
      .run();

    const updated = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, input.ticketId))
      .get();

    return { success: true, ticket: updated };
  });

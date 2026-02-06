import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { promoterProfiles, events, tickets, following } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const getPromoterStatsProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const promoter = await db
      .select()
      .from(promoterProfiles)
      .where(eq(promoterProfiles.id, input.id))
      .get();

    if (!promoter) {
      throw new Error("Promoter not found");
    }

    const promoterEvents = await db
      .select()
      .from(events)
      .where(eq(events.promoterId, input.id))
      .all();

    let totalTicketsSold = 0;
    let totalRevenue = 0;

    for (const event of promoterEvents) {
      const eventTickets = await db
        .select()
        .from(tickets)
        .where(eq(tickets.eventId, event.id))
        .all();

      totalTicketsSold += eventTickets.reduce((sum, t) => sum + t.quantity, 0);
      totalRevenue += eventTickets.reduce((sum, t) => sum + t.price * t.quantity, 0);
    }

    const followers = await db
      .select()
      .from(following)
      .where(eq(following.promoterId, input.id))
      .all();

    const upcomingEvents = promoterEvents.filter(
      (e) => new Date(e.date) > new Date() && e.status === "published"
    ).length;

    return {
      totalEvents: promoterEvents.length,
      totalTicketsSold,
      totalRevenue,
      averageRating: promoter.rating,
      followersCount: followers.length,
      upcomingEvents,
    };
  });

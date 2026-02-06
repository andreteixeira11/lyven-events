import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { promoterProfiles, events, tickets } from "../../../db/schema";


export const getPromotersAnalyticsProcedure = publicProcedure
  .input(
    z.object({
      promoterId: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    let allPromoters = await db.select().from(promoterProfiles).all();

    if (input.promoterId) {
      allPromoters = allPromoters.filter((p) => p.id === input.promoterId);
    }

    const allEvents = await db.select().from(events).all();
    const allTickets = await db.select().from(tickets).all();

    let filteredTickets = allTickets;
    if (input.startDate && input.endDate) {
      filteredTickets = allTickets.filter(
        (t) => t.purchaseDate >= input.startDate! && t.purchaseDate <= input.endDate!
      );
    }

    const promoterAnalytics = allPromoters.map((promoter) => {
      const promoterEvents = allEvents.filter((e) => e.promoterId === promoter.id);
      const totalEvents = promoterEvents.length;

      let totalTicketsSold = 0;
      let totalRevenue = 0;
      let totalCapacity = 0;

      promoterEvents.forEach((event) => {
        const eventTickets = filteredTickets.filter((t) => t.eventId === event.id);
        totalTicketsSold += eventTickets.reduce((sum, t) => sum + t.quantity, 0);
        totalRevenue += eventTickets.reduce((sum, t) => sum + t.price * t.quantity, 0);
        totalCapacity += event.venueCapacity;
      });

      const averageOccupancy = totalCapacity > 0 ? (totalTicketsSold / totalCapacity) * 100 : 0;

      return {
        promoterId: promoter.id,
        name: promoter.companyName,
        totalEvents,
        totalTicketsSold,
        totalRevenue,
        averageOccupancy: parseFloat(averageOccupancy.toFixed(2)),
      };
    });

    return {
      promoters: promoterAnalytics,
    };
  });

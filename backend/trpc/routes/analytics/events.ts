import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { events, tickets } from "../../../db/schema";


export const getEventsAnalyticsProcedure = publicProcedure
  .input(
    z.object({
      eventId: z.string().optional(),
      promoterId: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    let allEvents = await db.select().from(events).all();

    if (input.eventId) {
      allEvents = allEvents.filter((e) => e.id === input.eventId);
    }

    if (input.promoterId) {
      allEvents = allEvents.filter((e) => e.promoterId === input.promoterId);
    }

    const allTickets = await db.select().from(tickets).all();

    let filteredTickets = allTickets;
    if (input.startDate && input.endDate) {
      filteredTickets = allTickets.filter(
        (t) => t.purchaseDate >= input.startDate! && t.purchaseDate <= input.endDate!
      );
    }

    const eventAnalytics = allEvents.map((event) => {
      const eventTickets = filteredTickets.filter((t) => t.eventId === event.id);
      const ticketsSold = eventTickets.reduce((sum, t) => sum + t.quantity, 0);
      const revenue = eventTickets.reduce((sum, t) => sum + t.price * t.quantity, 0);
      const capacity = event.venueCapacity;
      const occupancyRate = capacity > 0 ? (ticketsSold / capacity) * 100 : 0;

      return {
        eventId: event.id,
        title: event.title,
        ticketsSold,
        revenue,
        capacity,
        occupancyRate: parseFloat(occupancyRate.toFixed(2)),
      };
    });

    return {
      events: eventAnalytics,
    };
  });

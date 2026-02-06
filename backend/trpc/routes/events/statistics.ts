import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { events, tickets, eventStatistics } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const getEventStatisticsProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, input.id))
      .get();

    if (!event) {
      throw new Error("Event not found");
    }

    let existingStats = await db
      .select()
      .from(eventStatistics)
      .where(eq(eventStatistics.eventId, input.id))
      .get();

    if (!existingStats) {
      const statsId = `stats_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(eventStatistics).values({
        id: statsId,
        eventId: input.id,
        totalTicketsSold: 0,
        totalRevenue: 0,
        ticketTypeStats: "[]",
        dailySales: "[]",
      });

      existingStats = await db
        .select()
        .from(eventStatistics)
        .where(eq(eventStatistics.eventId, input.id))
        .get();
    }

    const eventTickets = await db
      .select()
      .from(tickets)
      .where(eq(tickets.eventId, input.id))
      .all();

    const totalTicketsSold = eventTickets.reduce((sum, t) => sum + t.quantity, 0);
    const totalRevenue = eventTickets.reduce((sum, t) => sum + t.price * t.quantity, 0);

    const ticketTypeMap = new Map<string, { sold: number; revenue: number }>();
    
    eventTickets.forEach(ticket => {
      const current = ticketTypeMap.get(ticket.ticketTypeId) || { sold: 0, revenue: 0 };
      current.sold += ticket.quantity;
      current.revenue += ticket.price * ticket.quantity;
      ticketTypeMap.set(ticket.ticketTypeId, current);
    });

    const ticketTypeStats = Array.from(ticketTypeMap.entries()).map(([ticketTypeId, stats]) => ({
      ticketTypeId,
      sold: stats.sold,
      revenue: stats.revenue,
      percentage: totalTicketsSold > 0 ? (stats.sold / totalTicketsSold) * 100 : 0,
    }));

    const dailySalesMap = new Map<string, { tickets: number; revenue: number }>();
    
    eventTickets.forEach(ticket => {
      const date = ticket.purchaseDate.split('T')[0];
      const current = dailySalesMap.get(date) || { tickets: 0, revenue: 0 };
      current.tickets += ticket.quantity;
      current.revenue += ticket.price * ticket.quantity;
      dailySalesMap.set(date, current);
    });

    const dailySales = Array.from(dailySalesMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    await db
      .update(eventStatistics)
      .set({
        totalTicketsSold,
        totalRevenue,
        ticketTypeStats: JSON.stringify(ticketTypeStats),
        dailySales: JSON.stringify(dailySales),
        lastUpdated: new Date().toISOString(),
      })
      .where(eq(eventStatistics.eventId, input.id))
      .run();

    return {
      eventId: input.id,
      totalTicketsSold,
      totalRevenue,
      ticketTypeStats,
      dailySales,
      lastUpdated: new Date(),
    };
  });

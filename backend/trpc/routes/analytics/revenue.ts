import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { tickets, events } from "../../../db/schema";

export const getRevenueAnalyticsProcedure = publicProcedure
  .input(
    z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      groupBy: z.enum(["day", "week", "month"]).optional().default("day"),
    })
  )
  .query(async ({ input }) => {
    let allTickets = await db.select().from(tickets).all();

    if (input.startDate && input.endDate) {
      allTickets = allTickets.filter(
        (t) => t.purchaseDate >= input.startDate! && t.purchaseDate <= input.endDate!
      );
    }

    const total = allTickets.reduce((sum, t) => sum + t.price * t.quantity, 0);

    const periodMap = new Map<string, { revenue: number; tickets: number }>();

    allTickets.forEach((ticket) => {
      let period = ticket.purchaseDate.split("T")[0];

      if (input.groupBy === "week") {
        const date = new Date(ticket.purchaseDate);
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        period = startOfWeek.toISOString().split("T")[0];
      } else if (input.groupBy === "month") {
        period = ticket.purchaseDate.substring(0, 7);
      }

      const current = periodMap.get(period) || { revenue: 0, tickets: 0 };
      current.revenue += ticket.price * ticket.quantity;
      current.tickets += ticket.quantity;
      periodMap.set(period, current);
    });

    const byPeriod = Array.from(periodMap.entries())
      .map(([period, data]) => ({ period, ...data }))
      .sort((a, b) => a.period.localeCompare(b.period));

    const allEvents = await db.select().from(events).all();
    const categoryMap = new Map<string, number>();

    allTickets.forEach((ticket) => {
      const event = allEvents.find((e) => e.id === ticket.eventId);
      if (event) {
        const revenue = ticket.price * ticket.quantity;
        categoryMap.set(event.category, (categoryMap.get(event.category) || 0) + revenue);
      }
    });

    const byCategory = Array.from(categoryMap.entries()).map(([category, revenue]) => ({
      category,
      revenue,
      percentage: total > 0 ? parseFloat(((revenue / total) * 100).toFixed(2)) : 0,
    }));

    return {
      total,
      byPeriod,
      byCategory,
    };
  });

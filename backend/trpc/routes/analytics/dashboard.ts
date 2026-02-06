import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { users, events, tickets, promoterProfiles, advertisements } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const getDashboardAnalyticsProcedure = publicProcedure
  .input(
    z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    const allUsers = await db.select().from(users).all();
    const allEvents = await db.select().from(events).all();
    const allTickets = await db.select().from(tickets).all();

    let filteredTickets = allTickets;
    if (input.startDate && input.endDate) {
      filteredTickets = allTickets.filter(
        (t) => t.purchaseDate >= input.startDate! && t.purchaseDate <= input.endDate!
      );
    }

    const totalUsers = allUsers.length;
    const totalEvents = allEvents.length;
    const totalTicketsSold = filteredTickets.reduce((sum, t) => sum + t.quantity, 0);
    const totalRevenue = filteredTickets.reduce((sum, t) => sum + t.price * t.quantity, 0);

    const activePromoters = await db
      .select()
      .from(promoterProfiles)
      .where(eq(promoterProfiles.isApproved, true))
      .all();

    const pendingEvents = await db
      .select()
      .from(events)
      .where(eq(events.status, "pending"))
      .all();

    const pendingPromoters = await db
      .select()
      .from(promoterProfiles)
      .where(eq(promoterProfiles.isApproved, false))
      .all();

    const pendingAds = await db
      .select()
      .from(advertisements)
      .where(eq(advertisements.isActive, false))
      .all();

    const revenueByDay = new Map<string, number>();
    filteredTickets.forEach((ticket) => {
      const date = ticket.purchaseDate.split("T")[0];
      const revenue = ticket.price * ticket.quantity;
      revenueByDay.set(date, (revenueByDay.get(date) || 0) + revenue);
    });

    const revenueByDayArray = Array.from(revenueByDay.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const eventSales = new Map<string, { tickets: number; revenue: number; title: string }>();
    filteredTickets.forEach((ticket) => {
      const event = allEvents.find((e) => e.id === ticket.eventId);
      if (event) {
        const current = eventSales.get(ticket.eventId) || {
          tickets: 0,
          revenue: 0,
          title: event.title,
        };
        current.tickets += ticket.quantity;
        current.revenue += ticket.price * ticket.quantity;
        eventSales.set(ticket.eventId, current);
      }
    });

    const topEvents = Array.from(eventSales.entries())
      .map(([eventId, data]) => ({ eventId, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalUsers,
      totalEvents,
      totalTicketsSold,
      totalRevenue,
      activePromoters: activePromoters.length,
      pendingApprovals: {
        events: pendingEvents.length,
        promoters: pendingPromoters.length,
        ads: pendingAds.length,
      },
      revenueByDay: revenueByDayArray,
      topEvents,
    };
  });

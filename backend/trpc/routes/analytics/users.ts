import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { users, tickets } from "../../../db/schema";

export const getUsersAnalyticsProcedure = publicProcedure
  .input(
    z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    const allUsers = await db.select().from(users).all();
    const totalUsers = allUsers.length;

    let newUsers = allUsers;
    if (input.startDate && input.endDate) {
      newUsers = allUsers.filter(
        (u) => u.createdAt >= input.startDate! && u.createdAt <= input.endDate!
      );
    }

    const allTickets = await db.select().from(tickets).all();
    
    let activeUserIds = new Set<string>();
    if (input.startDate && input.endDate) {
      const recentTickets = allTickets.filter(
        (t) => t.purchaseDate >= input.startDate! && t.purchaseDate <= input.endDate!
      );
      recentTickets.forEach((t) => activeUserIds.add(t.userId));
    } else {
      allTickets.forEach((t) => activeUserIds.add(t.userId));
    }

    const usersByType = {
      normal: allUsers.filter((u) => u.userType === "normal").length,
      promoter: allUsers.filter((u) => u.userType === "promoter").length,
      admin: allUsers.filter((u) => u.userType === "admin").length,
    };

    const usersWithPurchases = new Set(allTickets.map((t) => t.userId));
    const retentionRate = totalUsers > 0 ? (usersWithPurchases.size / totalUsers) * 100 : 0;

    return {
      totalUsers,
      newUsers: newUsers.length,
      activeUsers: activeUserIds.size,
      usersByType,
      retentionRate: parseFloat(retentionRate.toFixed(2)),
    };
  });

import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { users } from "../../../db/schema";
import { eq, like, or } from "drizzle-orm";

export const listUsersProcedure = publicProcedure
  .input(
    z.object({
      limit: z.number().optional().default(20),
      offset: z.number().optional().default(0),
      userType: z.enum(["normal", "promoter", "admin"]).optional(),
      search: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    let query = db.select().from(users);

    if (input.userType) {
      query = query.where(eq(users.userType, input.userType)) as any;
    }

    if (input.search) {
      query = query.where(
        or(
          like(users.name, `%${input.search}%`),
          like(users.email, `%${input.search}%`)
        )
      ) as any;
    }

    const allUsers = await query.limit(input.limit + 1).offset(input.offset).all();

    const hasMore = allUsers.length > input.limit;
    if (hasMore) {
      allUsers.pop();
    }

    return {
      users: allUsers,
      total: allUsers.length,
      hasMore,
    };
  });

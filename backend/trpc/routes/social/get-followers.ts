import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { following, users } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const getFollowersProcedure = publicProcedure
  .input(
    z.object({
      targetId: z.string(),
      targetType: z.enum(["promoter", "artist", "user"]),
      limit: z.number().optional().default(20),
      offset: z.number().optional().default(0),
    })
  )
  .query(async ({ input }) => {
    let followRecords;

    if (input.targetType === "promoter") {
      followRecords = await db
        .select()
        .from(following)
        .where(eq(following.promoterId, input.targetId))
        .limit(input.limit)
        .offset(input.offset)
        .all();
    } else if (input.targetType === "artist") {
      followRecords = await db
        .select()
        .from(following)
        .where(eq(following.artistId, input.targetId))
        .limit(input.limit)
        .offset(input.offset)
        .all();
    } else {
      followRecords = await db
        .select()
        .from(following)
        .where(eq(following.friendId, input.targetId))
        .limit(input.limit)
        .offset(input.offset)
        .all();
    }

    const userIds = followRecords.map((f) => f.userId);
    const allUsers = await db.select().from(users).all();
    const followers = allUsers.filter((u) => userIds.includes(u.id));

    return {
      followers,
      total: followers.length,
    };
  });

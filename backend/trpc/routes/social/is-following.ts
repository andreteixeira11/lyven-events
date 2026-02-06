import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { following } from "../../../db/schema";
import { eq, and } from "drizzle-orm";

export const isFollowingProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      targetId: z.string(),
      targetType: z.enum(["promoter", "artist", "friend"]),
    })
  )
  .query(async ({ input }) => {
    let condition;

    if (input.targetType === "promoter") {
      condition = and(
        eq(following.userId, input.userId),
        eq(following.promoterId, input.targetId)
      );
    } else if (input.targetType === "artist") {
      condition = and(
        eq(following.userId, input.userId),
        eq(following.artistId, input.targetId)
      );
    } else {
      condition = and(
        eq(following.userId, input.userId),
        eq(following.friendId, input.targetId)
      );
    }

    const record = await db
      .select()
      .from(following)
      .where(condition)
      .get();

    return { isFollowing: !!record };
  });

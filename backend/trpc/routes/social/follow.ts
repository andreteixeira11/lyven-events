import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { following } from "../../../db/schema";

export const followProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      targetId: z.string(),
      targetType: z.enum(["promoter", "artist", "friend"]),
    })
  )
  .mutation(async ({ input }) => {
    const id = `follow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const values: any = {
      id,
      userId: input.userId,
    };

    if (input.targetType === "promoter") {
      values.promoterId = input.targetId;
    } else if (input.targetType === "artist") {
      values.artistId = input.targetId;
    } else if (input.targetType === "friend") {
      values.friendId = input.targetId;
    }

    await db.insert(following).values(values);

    return { success: true };
  });

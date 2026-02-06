import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { following, promoterProfiles, promoters, users } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const getFollowingProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      type: z.enum(["promoter", "artist", "friend"]).optional(),
      limit: z.number().optional().default(20),
      offset: z.number().optional().default(0),
    })
  )
  .query(async ({ input }) => {
    let followRecords = await db
      .select()
      .from(following)
      .where(eq(following.userId, input.userId))
      .limit(input.limit)
      .offset(input.offset)
      .all();

    if (input.type === "promoter") {
      followRecords = followRecords.filter((r) => r.promoterId !== null);
    } else if (input.type === "artist") {
      followRecords = followRecords.filter((r) => r.artistId !== null);
    } else if (input.type === "friend") {
      followRecords = followRecords.filter((r) => r.friendId !== null);
    }

    const allPromoters = await db.select().from(promoters).all();
    const allPromoterProfiles = await db.select().from(promoterProfiles).all();
    const allUsers = await db.select().from(users).all();

    const followingList = followRecords.map((record) => {
      if (record.promoterId) {
        const promoter = allPromoters.find((p) => p.id === record.promoterId);
        const promoterProfile = allPromoterProfiles.find((p) => p.id === record.promoterId);
        
        return {
          id: record.promoterId,
          type: "promoter" as const,
          data: {
            ...promoter,
            ...(promoterProfile || {}),
            businessName: promoterProfile?.companyName || promoter?.name,
            followersCount: promoter?.followersCount || 0,
          },
        };
      } else if (record.artistId) {
        return {
          id: record.artistId,
          type: "artist" as const,
          data: { id: record.artistId, name: "Artist Name" },
        };
      } else if (record.friendId) {
        const friend = allUsers.find((u) => u.id === record.friendId);
        return {
          id: record.friendId,
          type: "friend" as const,
          data: friend,
        };
      }
      return null;
    }).filter((item) => item !== null);

    return {
      following: followingList,
      total: followingList.length,
    };
  });

import { publicProcedure } from '../../create-context';
import { z } from 'zod';
import { db, users } from '@/backend/db';
import { eq } from 'drizzle-orm';

export const getUserProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.id, input.id),
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      interests: JSON.parse(user.interests),
      location: user.locationLatitude ? {
        latitude: user.locationLatitude,
        longitude: user.locationLongitude!,
        city: user.locationCity!,
        region: user.locationRegion!,
      } : undefined,
      preferences: {
        notifications: user.preferencesNotifications,
        language: user.preferencesLanguage,
        priceRange: {
          min: user.preferencesPriceMin,
          max: user.preferencesPriceMax,
        },
        eventTypes: JSON.parse(user.preferencesEventTypes),
      },
      following: {
        promoters: [],
        artists: [],
        friends: [],
      },
      favoriteEvents: JSON.parse(user.favoriteEvents),
      eventHistory: JSON.parse(user.eventHistory),
      createdAt: user.createdAt,
      isOnboardingComplete: user.isOnboardingComplete,
    };
  });

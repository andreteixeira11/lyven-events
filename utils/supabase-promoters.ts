import { supabase } from './supabase';
import { DbPromoter, DbPromoterProfile, DbPromoterAuth, DbFollowing } from '@/types/database';
import { Promoter, PromoterEvent } from '@/types/event';
import { PromoterProfile } from '@/types/user';

function parseJsonSafe<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export function mapDbPromoterToPromoter(dbPromoter: DbPromoter): Promoter {
  return {
    id: dbPromoter.id,
    name: dbPromoter.name,
    image: dbPromoter.image,
    description: dbPromoter.description,
    verified: dbPromoter.verified,
    followersCount: dbPromoter.followers_count,
  };
}

export function mapDbProfileToPromoterProfile(dbProfile: DbPromoterProfile): PromoterProfile {
  return {
    id: dbProfile.id,
    userId: dbProfile.user_id,
    companyName: dbProfile.company_name,
    description: dbProfile.description,
    website: dbProfile.website ?? undefined,
    socialMedia: {
      instagram: dbProfile.instagram_handle ?? undefined,
      facebook: dbProfile.facebook_handle ?? undefined,
      twitter: dbProfile.twitter_handle ?? undefined,
    },
    isApproved: dbProfile.is_approved,
    approvalDate: dbProfile.approval_date ?? undefined,
    eventsCreated: parseJsonSafe(dbProfile.events_created, []),
    followers: parseJsonSafe(dbProfile.followers, []),
    rating: dbProfile.rating,
    totalEvents: dbProfile.total_events,
  };
}

export async function fetchAllPromoters(): Promise<Promoter[]> {
  try {
    console.log('📡 Fetching all promoters...');
    const { data, error } = await supabase
      .from('promoters')
      .select('*')
      .order('followers_count', { ascending: false });

    if (error || !data) {
      console.error('❌ Error fetching promoters:', error);
      return [];
    }

    console.log(`✅ Fetched ${data.length} promoters`);
    return (data as DbPromoter[]).map(mapDbPromoterToPromoter);
  } catch (error) {
    console.error('❌ Error in fetchAllPromoters:', error);
    return [];
  }
}

export async function fetchPromoterById(promoterId: string): Promise<Promoter | null> {
  try {
    console.log('📡 Fetching promoter:', promoterId);
    const { data, error } = await supabase
      .from('promoters')
      .select('*')
      .eq('id', promoterId)
      .single();

    if (error || !data) {
      console.error('❌ Error fetching promoter:', error);
      return null;
    }

    return mapDbPromoterToPromoter(data as DbPromoter);
  } catch (error) {
    console.error('❌ Error in fetchPromoterById:', error);
    return null;
  }
}

export async function createPromoter(promoter: {
  name: string;
  image?: string;
  description?: string;
  verified?: boolean;
}): Promise<Promoter | null> {
  try {
    console.log('📡 Creating promoter:', promoter.name);
    const id = generateId();
    const { data, error } = await supabase
      .from('promoters')
      .insert({
        id,
        name: promoter.name,
        image: promoter.image ?? '',
        description: promoter.description ?? '',
        verified: promoter.verified ?? false,
        followers_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating promoter:', error);
      return null;
    }

    console.log('✅ Promoter created:', id);
    return mapDbPromoterToPromoter(data as DbPromoter);
  } catch (error) {
    console.error('❌ Error in createPromoter:', error);
    return null;
  }
}

export async function updatePromoter(
  promoterId: string,
  updates: Partial<Record<string, unknown>>
): Promise<boolean> {
  try {
    console.log('📡 Updating promoter:', promoterId);
    const { error } = await supabase.from('promoters').update(updates).eq('id', promoterId);

    if (error) {
      console.error('❌ Error updating promoter:', error);
      return false;
    }

    console.log('✅ Promoter updated:', promoterId);
    return true;
  } catch (error) {
    console.error('❌ Error in updatePromoter:', error);
    return false;
  }
}

export async function fetchPromoterProfileByUserId(userId: string): Promise<PromoterProfile | null> {
  try {
    console.log('📡 Fetching promoter profile for user:', userId);
    const { data, error } = await supabase
      .from('promoter_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.error('❌ Error fetching promoter profile:', error);
      return null;
    }

    return mapDbProfileToPromoterProfile(data as DbPromoterProfile);
  } catch (error) {
    console.error('❌ Error in fetchPromoterProfileByUserId:', error);
    return null;
  }
}

export async function createPromoterProfile(profile: {
  userId: string;
  companyName: string;
  description?: string;
  website?: string;
  instagramHandle?: string;
  facebookHandle?: string;
  twitterHandle?: string;
}): Promise<PromoterProfile | null> {
  try {
    console.log('📡 Creating promoter profile for user:', profile.userId);
    const id = generateId();
    const { data, error } = await supabase
      .from('promoter_profiles')
      .insert({
        id,
        user_id: profile.userId,
        company_name: profile.companyName,
        description: profile.description ?? '',
        website: profile.website ?? null,
        instagram_handle: profile.instagramHandle ?? null,
        facebook_handle: profile.facebookHandle ?? null,
        twitter_handle: profile.twitterHandle ?? null,
        is_approved: false,
        events_created: '[]',
        followers: '[]',
        rating: 0,
        total_events: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating promoter profile:', error);
      return null;
    }

    console.log('✅ Promoter profile created:', id);
    return mapDbProfileToPromoterProfile(data as DbPromoterProfile);
  } catch (error) {
    console.error('❌ Error in createPromoterProfile:', error);
    return null;
  }
}

export async function updatePromoterProfile(
  profileId: string,
  updates: Partial<Record<string, unknown>>
): Promise<boolean> {
  try {
    console.log('📡 Updating promoter profile:', profileId);
    const { error } = await supabase
      .from('promoter_profiles')
      .update(updates)
      .eq('id', profileId);

    if (error) {
      console.error('❌ Error updating promoter profile:', error);
      return false;
    }

    console.log('✅ Promoter profile updated:', profileId);
    return true;
  } catch (error) {
    console.error('❌ Error in updatePromoterProfile:', error);
    return false;
  }
}

export async function approvePromoterProfile(profileId: string): Promise<boolean> {
  return updatePromoterProfile(profileId, {
    is_approved: true,
    approval_date: new Date().toISOString(),
  });
}

export async function fetchPromoterEvents(promoterId: string): Promise<PromoterEvent[]> {
  try {
    console.log('📡 Fetching promoter events:', promoterId);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('promoter_id', promoterId)
      .order('date', { ascending: false });

    if (error || !data) {
      console.error('❌ Error fetching promoter events:', error);
      return [];
    }

    const eventIds = data.map((e: Record<string, unknown>) => e.id as string);

    let ticketCounts: Record<string, number> = {};
    let revenueTotals: Record<string, number> = {};

    if (eventIds.length > 0) {
      const { data: tickets } = await supabase
        .from('tickets')
        .select('event_id, quantity, price')
        .in('event_id', eventIds);

      if (tickets) {
        for (const ticket of tickets as { event_id: string; quantity: number; price: number }[]) {
          ticketCounts[ticket.event_id] = (ticketCounts[ticket.event_id] ?? 0) + ticket.quantity;
          revenueTotals[ticket.event_id] =
            (revenueTotals[ticket.event_id] ?? 0) + ticket.price * ticket.quantity;
        }
      }
    }

    return data.map((e: Record<string, unknown>) => {
      const ticketTypes = (() => {
        try {
          return JSON.parse(e.ticket_types as string);
        } catch {
          return [];
        }
      })();
      const totalTickets = ticketTypes.reduce(
        (sum: number, t: { available: number }) => sum + (t.available ?? 0),
        0
      );

      return {
        id: e.id as string,
        title: e.title as string,
        date: new Date(e.date as string),
        venue: e.venue_name as string,
        status: e.status as PromoterEvent['status'],
        ticketsSold: ticketCounts[e.id as string] ?? 0,
        totalTickets,
        revenue: revenueTotals[e.id as string] ?? 0,
        image: e.image as string,
      };
    });
  } catch (error) {
    console.error('❌ Error in fetchPromoterEvents:', error);
    return [];
  }
}

export async function followPromoter(userId: string, promoterId: string): Promise<boolean> {
  try {
    console.log('📡 Following promoter:', promoterId);
    const { data: existing } = await supabase
      .from('following')
      .select('id')
      .eq('user_id', userId)
      .eq('promoter_id', promoterId)
      .maybeSingle();

    if (existing) {
      console.log('ℹ️ Already following promoter');
      return true;
    }

    const { error } = await supabase.from('following').insert({
      id: generateId(),
      user_id: userId,
      promoter_id: promoterId,
    });

    if (error) {
      console.error('❌ Error following promoter:', error);
      return false;
    }

    try {
      await supabase.rpc('increment_followers_count', { p_promoter_id: promoterId });
    } catch {
      const { data: pData } = await supabase
        .from('promoters')
        .select('followers_count')
        .eq('id', promoterId)
        .single();
      if (pData) {
        await supabase
          .from('promoters')
          .update({ followers_count: ((pData as DbPromoter).followers_count ?? 0) + 1 })
          .eq('id', promoterId);
      }
    }

    console.log('✅ Now following promoter:', promoterId);
    return true;
  } catch (error) {
    console.error('❌ Error in followPromoter:', error);
    return false;
  }
}

export async function unfollowPromoter(userId: string, promoterId: string): Promise<boolean> {
  try {
    console.log('📡 Unfollowing promoter:', promoterId);
    const { error } = await supabase
      .from('following')
      .delete()
      .eq('user_id', userId)
      .eq('promoter_id', promoterId);

    if (error) {
      console.error('❌ Error unfollowing promoter:', error);
      return false;
    }

    try {
      const { data: pData } = await supabase
        .from('promoters')
        .select('followers_count')
        .eq('id', promoterId)
        .single();
      if (pData) {
        const count = Math.max(0, ((pData as DbPromoter).followers_count ?? 1) - 1);
        await supabase.from('promoters').update({ followers_count: count }).eq('id', promoterId);
      }
    } catch {
      // ignore
    }

    console.log('✅ Unfollowed promoter:', promoterId);
    return true;
  } catch (error) {
    console.error('❌ Error in unfollowPromoter:', error);
    return false;
  }
}

export async function isFollowingPromoter(userId: string, promoterId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('following')
      .select('id')
      .eq('user_id', userId)
      .eq('promoter_id', promoterId)
      .maybeSingle();

    return !!data;
  } catch {
    return false;
  }
}

export async function fetchUserFollowingPromoters(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('following')
      .select('promoter_id')
      .eq('user_id', userId)
      .not('promoter_id', 'is', null);

    if (error || !data) return [];

    return (data as { promoter_id: string }[])
      .map((f) => f.promoter_id)
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function fetchPendingPromoterProfiles(): Promise<PromoterProfile[]> {
  try {
    console.log('📡 Fetching pending promoter profiles...');
    const { data, error } = await supabase
      .from('promoter_profiles')
      .select('*')
      .eq('is_approved', false)
      .order('total_events', { ascending: false });

    if (error || !data) {
      console.error('❌ Error fetching pending profiles:', error);
      return [];
    }

    return (data as DbPromoterProfile[]).map(mapDbProfileToPromoterProfile);
  } catch (error) {
    console.error('❌ Error in fetchPendingPromoterProfiles:', error);
    return [];
  }
}

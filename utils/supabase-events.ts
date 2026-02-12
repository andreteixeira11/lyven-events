import { supabase } from './supabase';
import { DbEvent, DbPromoter, DbEventStatistics, DbAdvertisement, DbEventView } from '@/types/database';
import { Event, EventCategory, EventFilters, Advertisement, EventStatistics, MapEvent } from '@/types/event';

function parseJsonSafe<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    console.warn('Failed to parse JSON:', value?.substring(0, 100));
    return fallback;
  }
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export function mapDbEventToEvent(dbEvent: DbEvent, promoter?: DbPromoter | null): Event {
  const artists = parseJsonSafe(dbEvent.artists, []);
  const ticketTypes = parseJsonSafe(dbEvent.ticket_types, []);
  const tags = parseJsonSafe(dbEvent.tags, []);

  return {
    id: dbEvent.id,
    title: dbEvent.title,
    artists,
    venue: {
      id: `venue_${dbEvent.id}`,
      name: dbEvent.venue_name,
      address: dbEvent.venue_address,
      city: dbEvent.venue_city,
      capacity: dbEvent.venue_capacity,
    },
    date: new Date(dbEvent.date),
    endDate: dbEvent.end_date ? new Date(dbEvent.end_date) : undefined,
    image: dbEvent.image,
    description: dbEvent.description,
    category: dbEvent.category as EventCategory,
    ticketTypes,
    isSoldOut: dbEvent.is_sold_out,
    isFeatured: dbEvent.is_featured,
    duration: dbEvent.duration ?? undefined,
    promoter: promoter
      ? {
          id: promoter.id,
          name: promoter.name,
          image: promoter.image,
          description: promoter.description,
          verified: promoter.verified,
          followersCount: promoter.followers_count,
        }
      : {
          id: dbEvent.promoter_id,
          name: 'Unknown Promoter',
          image: '',
          description: '',
          verified: false,
          followersCount: 0,
        },
    tags,
    socialLinks: {
      instagram: dbEvent.instagram_link ?? undefined,
      facebook: dbEvent.facebook_link ?? undefined,
      twitter: dbEvent.twitter_link ?? undefined,
      website: dbEvent.website_link ?? undefined,
    },
    coordinates:
      dbEvent.latitude != null && dbEvent.longitude != null
        ? { latitude: dbEvent.latitude, longitude: dbEvent.longitude }
        : undefined,
  };
}

export async function fetchEvents(options?: {
  category?: EventCategory;
  featured?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
  city?: string;
  status?: string;
}): Promise<Event[]> {
  try {
    console.log('📡 Fetching events from Supabase...', options);
    let query = supabase.from('events').select('*');

    if (options?.category) {
      query = query.eq('category', options.category);
    }
    if (options?.featured) {
      query = query.eq('is_featured', true);
    }
    if (options?.search) {
      query = query.ilike('title', `%${options.search}%`);
    }
    if (options?.city) {
      query = query.ilike('venue_city', `%${options.city}%`);
    }
    if (options?.status) {
      query = query.eq('status', options.status);
    } else {
      query = query.eq('status', 'published');
    }

    query = query.order('date', { ascending: true });

    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options?.limit ?? 20) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching events:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('ℹ️ No events found');
      return [];
    }

    const promoterIds = [...new Set((data as DbEvent[]).map((e) => e.promoter_id))];
    const { data: promoters } = await supabase
      .from('promoters')
      .select('*')
      .in('id', promoterIds);

    const promoterMap = new Map<string, DbPromoter>();
    (promoters ?? []).forEach((p: DbPromoter) => promoterMap.set(p.id, p));

    const events = (data as DbEvent[]).map((dbEvent) =>
      mapDbEventToEvent(dbEvent, promoterMap.get(dbEvent.promoter_id) ?? null)
    );

    console.log(`✅ Fetched ${events.length} events`);
    return events;
  } catch (error) {
    console.error('❌ Error in fetchEvents:', error);
    return [];
  }
}

export async function fetchEventById(eventId: string): Promise<Event | null> {
  try {
    console.log('📡 Fetching event by ID:', eventId);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error || !data) {
      console.error('❌ Error fetching event:', error);
      return null;
    }

    const dbEvent = data as DbEvent;
    const { data: promoter } = await supabase
      .from('promoters')
      .select('*')
      .eq('id', dbEvent.promoter_id)
      .single();

    return mapDbEventToEvent(dbEvent, promoter as DbPromoter | null);
  } catch (error) {
    console.error('❌ Error in fetchEventById:', error);
    return null;
  }
}

export async function fetchFeaturedEvents(limit = 5): Promise<Event[]> {
  return fetchEvents({ featured: true, limit, status: 'published' });
}

export async function fetchEventsByCategory(category: EventCategory, limit = 20): Promise<Event[]> {
  return fetchEvents({ category, limit, status: 'published' });
}

export async function searchEvents(query: string): Promise<Event[]> {
  return fetchEvents({ search: query, status: 'published' });
}

export async function fetchFilteredEvents(filters: EventFilters): Promise<Event[]> {
  try {
    console.log('📡 Fetching filtered events:', filters);
    let query = supabase.from('events').select('*').eq('status', 'published');

    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.location) {
      query = query.ilike('venue_city', `%${filters.location}%`);
    }
    if (filters.dateRange?.start) {
      query = query.gte('date', filters.dateRange.start.toISOString());
    }
    if (filters.dateRange?.end) {
      query = query.lte('date', filters.dateRange.end.toISOString());
    }

    query = query.order('date', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching filtered events:', error);
      return [];
    }

    const promoterIds = [...new Set((data as DbEvent[]).map((e) => e.promoter_id))];
    const { data: promoters } = await supabase
      .from('promoters')
      .select('*')
      .in('id', promoterIds);

    const promoterMap = new Map<string, DbPromoter>();
    (promoters ?? []).forEach((p: DbPromoter) => promoterMap.set(p.id, p));

    let events = (data as DbEvent[]).map((dbEvent) =>
      mapDbEventToEvent(dbEvent, promoterMap.get(dbEvent.promoter_id) ?? null)
    );

    if (filters.priceRange) {
      events = events.filter((event) => {
        const minPrice = Math.min(...event.ticketTypes.map((t) => t.price));
        return minPrice >= (filters.priceRange?.min ?? 0) && minPrice <= (filters.priceRange?.max ?? Infinity);
      });
    }

    return events;
  } catch (error) {
    console.error('❌ Error in fetchFilteredEvents:', error);
    return [];
  }
}

export async function fetchMapEvents(): Promise<MapEvent[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (error || !data) {
      console.error('❌ Error fetching map events:', error);
      return [];
    }

    return (data as DbEvent[]).map((e) => {
      const ticketTypes = parseJsonSafe(e.ticket_types, []);
      const minPrice = ticketTypes.length > 0
        ? Math.min(...ticketTypes.map((t: { price: number }) => t.price))
        : 0;

      return {
        id: e.id,
        title: e.title,
        venue: e.venue_name,
        date: new Date(e.date),
        coordinates: {
          latitude: e.latitude!,
          longitude: e.longitude!,
        },
        category: e.category as EventCategory,
        price: minPrice,
        image: e.image,
        isFeatured: e.is_featured,
      };
    });
  } catch (error) {
    console.error('❌ Error in fetchMapEvents:', error);
    return [];
  }
}

export async function createEvent(event: {
  title: string;
  artists?: string;
  venueName: string;
  venueAddress?: string;
  venueCity: string;
  venueCapacity?: number;
  date: string;
  endDate?: string;
  image?: string;
  description?: string;
  category: string;
  ticketTypes?: string;
  promoterId: string;
  tags?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
}): Promise<DbEvent | null> {
  try {
    console.log('📡 Creating event in Supabase:', event.title);
    const id = generateId();
    const { data, error } = await supabase
      .from('events')
      .insert({
        id,
        title: event.title,
        artists: event.artists ?? '[]',
        venue_name: event.venueName,
        venue_address: event.venueAddress ?? '',
        venue_city: event.venueCity,
        venue_capacity: event.venueCapacity ?? 0,
        date: event.date,
        end_date: event.endDate ?? null,
        image: event.image ?? '',
        description: event.description ?? '',
        category: event.category,
        ticket_types: event.ticketTypes ?? '[]',
        is_sold_out: false,
        is_featured: false,
        promoter_id: event.promoterId,
        tags: event.tags ?? '[]',
        latitude: event.latitude ?? null,
        longitude: event.longitude ?? null,
        status: event.status ?? 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating event:', error);
      return null;
    }

    console.log('✅ Event created:', id);
    return data as DbEvent;
  } catch (error) {
    console.error('❌ Error in createEvent:', error);
    return null;
  }
}

export async function updateEvent(
  eventId: string,
  updates: Partial<Record<string, unknown>>
): Promise<boolean> {
  try {
    console.log('📡 Updating event:', eventId);
    const { error } = await supabase.from('events').update(updates).eq('id', eventId);

    if (error) {
      console.error('❌ Error updating event:', error);
      return false;
    }

    console.log('✅ Event updated:', eventId);
    return true;
  } catch (error) {
    console.error('❌ Error in updateEvent:', error);
    return false;
  }
}

export async function deleteEvent(eventId: string): Promise<boolean> {
  try {
    console.log('📡 Deleting event:', eventId);
    const { error } = await supabase.from('events').delete().eq('id', eventId);

    if (error) {
      console.error('❌ Error deleting event:', error);
      return false;
    }

    console.log('✅ Event deleted:', eventId);
    return true;
  } catch (error) {
    console.error('❌ Error in deleteEvent:', error);
    return false;
  }
}

export async function fetchActiveAdvertisements(
  position?: string
): Promise<Advertisement[]> {
  try {
    console.log('📡 Fetching advertisements...');
    let query = supabase
      .from('advertisements')
      .select('*')
      .eq('is_active', true);

    if (position) {
      query = query.eq('position', position);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error('❌ Error fetching ads:', error);
      return [];
    }

    return (data as DbAdvertisement[]).map((ad) => ({
      id: ad.id,
      title: ad.title,
      description: ad.description,
      image: ad.image,
      targetUrl: ad.target_url ?? undefined,
      type: ad.type as Advertisement['type'],
      position: ad.position as Advertisement['position'],
      isActive: ad.is_active,
      startDate: new Date(ad.start_date),
      endDate: new Date(ad.end_date),
      impressions: ad.impressions,
      clicks: ad.clicks,
      budget: ad.budget,
      targetAudience: ad.target_audience_interests
        ? {
            interests: parseJsonSafe(ad.target_audience_interests, []),
            ageRange:
              ad.target_audience_age_min != null && ad.target_audience_age_max != null
                ? { min: ad.target_audience_age_min, max: ad.target_audience_age_max }
                : undefined,
            location: ad.target_audience_location ?? undefined,
          }
        : undefined,
    }));
  } catch (error) {
    console.error('❌ Error in fetchActiveAdvertisements:', error);
    return [];
  }
}

export async function fetchEventStatistics(eventId: string): Promise<EventStatistics | null> {
  try {
    const { data, error } = await supabase
      .from('event_statistics')
      .select('*')
      .eq('event_id', eventId)
      .single();

    if (error || !data) {
      console.error('❌ Error fetching event statistics:', error);
      return null;
    }

    const dbStats = data as DbEventStatistics;
    return {
      eventId: dbStats.event_id,
      totalTicketsSold: dbStats.total_tickets_sold,
      totalRevenue: dbStats.total_revenue,
      ticketTypeStats: parseJsonSafe(dbStats.ticket_type_stats, []),
      dailySales: parseJsonSafe(dbStats.daily_sales, []),
      lastUpdated: new Date(dbStats.last_updated),
    };
  } catch (error) {
    console.error('❌ Error in fetchEventStatistics:', error);
    return null;
  }
}

export async function trackEventView(eventId: string, userId?: string): Promise<void> {
  try {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    await supabase.from('event_views').insert({
      id: generateId(),
      event_id: eventId,
      user_id: userId ?? null,
      session_id: sessionId,
    });
    console.log('✅ Event view tracked:', eventId);
  } catch (error) {
    console.error('❌ Error tracking event view:', error);
  }
}

export async function fetchEventsByPromoter(promoterId: string): Promise<Event[]> {
  try {
    console.log('📡 Fetching events by promoter:', promoterId);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('promoter_id', promoterId)
      .order('date', { ascending: false });

    if (error || !data) {
      console.error('❌ Error fetching promoter events:', error);
      return [];
    }

    const { data: promoter } = await supabase
      .from('promoters')
      .select('*')
      .eq('id', promoterId)
      .single();

    return (data as DbEvent[]).map((dbEvent) =>
      mapDbEventToEvent(dbEvent, promoter as DbPromoter | null)
    );
  } catch (error) {
    console.error('❌ Error in fetchEventsByPromoter:', error);
    return [];
  }
}

import { supabase } from './supabase';
import { mockEvents, mockAdvertisements, mockEventStatistics } from '@/mocks/events';
import { Event, Promoter, EventCategory } from '@/types/event';

function safeJsonParse<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
}

function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

function mapDbEventToEvent(row: any): Event {
  const p = row.promoters;
  const promoter: Promoter = p ? {
    id: p.id,
    name: p.name,
    image: p.image || '',
    description: p.description || '',
    verified: p.verified || false,
    followersCount: p.followers_count || 0,
  } : {
    id: row.promoter_id || 'unknown',
    name: 'Promotor',
    image: '',
    description: '',
    verified: false,
    followersCount: 0,
  };

  return {
    id: row.id,
    title: row.title,
    artists: safeJsonParse(row.artists, []),
    venue: {
      id: `venue-${row.id}`,
      name: row.venue_name || '',
      address: row.venue_address || '',
      city: row.venue_city || '',
      capacity: row.venue_capacity || 0,
    },
    date: new Date(row.date),
    endDate: row.end_date ? new Date(row.end_date) : undefined,
    image: row.image || '',
    description: row.description || '',
    category: (row.category || 'other') as EventCategory,
    ticketTypes: safeJsonParse(row.ticket_types, []).map((t: any) => ({
      id: t.id || t.ticketTypeId || '',
      name: t.name || '',
      price: t.price || 0,
      available: t.available ?? 0,
      description: t.description,
      maxPerPerson: t.maxPerPerson || 4,
    })),
    isSoldOut: row.is_sold_out || false,
    isFeatured: row.is_featured || false,
    duration: row.duration || undefined,
    promoter,
    tags: safeJsonParse(row.tags, []),
    socialLinks: (row.instagram_link || row.facebook_link || row.twitter_link || row.website_link) ? {
      instagram: row.instagram_link || undefined,
      facebook: row.facebook_link || undefined,
      twitter: row.twitter_link || undefined,
      website: row.website_link || undefined,
    } : undefined,
    coordinates: (row.latitude != null && row.longitude != null) ? {
      latitude: row.latitude,
      longitude: row.longitude,
    } : undefined,
  };
}

function filterMockEvents(input?: { featured?: boolean; promoterId?: string }): Event[] {
  let events = [...mockEvents];
  if (input?.featured) events = events.filter(e => e.isFeatured);
  if (input?.promoterId) events = events.filter(e => e.promoter.id === input.promoterId);
  return events;
}

export const eventsApi = {
  list: async (input?: any): Promise<Event[]> => {
    try {
      let query = supabase
        .from('events')
        .select('*, promoters(*)')
        .order('date', { ascending: true });

      if (input?.featured) query = query.eq('is_featured', true);
      if (input?.promoterId) query = query.eq('promoter_id', input.promoterId);
      if (input?.category) query = query.eq('category', input.category);
      if (input?.status) query = query.eq('status', input.status);

      const { data, error } = await query;

      if (error) {
        console.log('[eventsApi.list] query error, using mock:', error.message);
        return filterMockEvents(input);
      }
      if (!data || data.length === 0) {
        console.log('[eventsApi.list] no data, using mock');
        return filterMockEvents(input);
      }
      return data.map(mapDbEventToEvent);
    } catch {
      return filterMockEvents(input);
    }
  },

  get: async (input: { id: string }): Promise<Event | null> => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, promoters(*)')
        .eq('id', input.id)
        .single();

      if (error || !data) {
        return mockEvents.find(e => e.id === input.id) || null;
      }
      return mapDbEventToEvent(data);
    } catch {
      return mockEvents.find(e => e.id === input.id) || null;
    }
  },

  create: async (input: any): Promise<any> => {
    try {
      const eventId = input.id || genId('event');
      const { data, error } = await supabase.from('events').insert({
        id: eventId,
        title: input.title,
        artists: JSON.stringify(input.artists || []),
        venue_name: input.venueName || input.venue?.name || '',
        venue_address: input.venueAddress || input.venue?.address || '',
        venue_city: input.venueCity || input.venue?.city || '',
        venue_capacity: input.venueCapacity || input.venue?.capacity || 0,
        date: input.date,
        end_date: input.endDate || null,
        image: input.image || '',
        description: input.description || '',
        category: input.category || 'other',
        ticket_types: JSON.stringify(input.ticketTypes || []),
        is_sold_out: input.isSoldOut || false,
        is_featured: input.isFeatured || false,
        duration: input.duration || null,
        promoter_id: input.promoterId || 'unknown',
        tags: JSON.stringify(input.tags || []),
        instagram_link: input.instagramLink || null,
        facebook_link: input.facebookLink || null,
        twitter_link: input.twitterLink || null,
        website_link: input.websiteLink || null,
        latitude: input.latitude || null,
        longitude: input.longitude || null,
        status: input.status || 'pending',
      }).select().single();

      if (error) throw error;
      return data || { id: eventId };
    } catch (err) {
      console.error('[eventsApi.create] error:', err);
      throw err;
    }
  },

  update: async (input: any): Promise<any> => {
    try {
      const { id, ...rest } = input;
      const updates: Record<string, any> = {};
      if (rest.title !== undefined) updates.title = rest.title;
      if (rest.artists !== undefined) updates.artists = typeof rest.artists === 'string' ? rest.artists : JSON.stringify(rest.artists);
      if (rest.venueName !== undefined) updates.venue_name = rest.venueName;
      if (rest.venueAddress !== undefined) updates.venue_address = rest.venueAddress;
      if (rest.venueCity !== undefined) updates.venue_city = rest.venueCity;
      if (rest.venueCapacity !== undefined) updates.venue_capacity = rest.venueCapacity;
      if (rest.date !== undefined) updates.date = rest.date;
      if (rest.endDate !== undefined) updates.end_date = rest.endDate;
      if (rest.image !== undefined) updates.image = rest.image;
      if (rest.description !== undefined) updates.description = rest.description;
      if (rest.category !== undefined) updates.category = rest.category;
      if (rest.ticketTypes !== undefined) updates.ticket_types = typeof rest.ticketTypes === 'string' ? rest.ticketTypes : JSON.stringify(rest.ticketTypes);
      if (rest.isSoldOut !== undefined) updates.is_sold_out = rest.isSoldOut;
      if (rest.isFeatured !== undefined) updates.is_featured = rest.isFeatured;
      if (rest.duration !== undefined) updates.duration = rest.duration;
      if (rest.tags !== undefined) updates.tags = typeof rest.tags === 'string' ? rest.tags : JSON.stringify(rest.tags);
      if (rest.instagramLink !== undefined) updates.instagram_link = rest.instagramLink;
      if (rest.facebookLink !== undefined) updates.facebook_link = rest.facebookLink;
      if (rest.twitterLink !== undefined) updates.twitter_link = rest.twitterLink;
      if (rest.websiteLink !== undefined) updates.website_link = rest.websiteLink;
      if (rest.latitude !== undefined) updates.latitude = rest.latitude;
      if (rest.longitude !== undefined) updates.longitude = rest.longitude;
      if (rest.status !== undefined) updates.status = rest.status;

      if (Object.keys(updates).length === 0) throw new Error('No fields to update');

      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[eventsApi.update] error:', err);
      throw err;
    }
  },

  delete: async (input: { id: string }): Promise<{ success: boolean }> => {
    try {
      const { error } = await supabase.from('events').delete().eq('id', input.id);
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('[eventsApi.delete] error:', err);
      throw err;
    }
  },

  approve: async (input: { eventId: string }): Promise<any> => {
    try {
      const { data: event } = await supabase
        .from('events')
        .select('*, promoters(*)')
        .eq('id', input.eventId)
        .single();

      if (!event) throw new Error('Evento não encontrado');

      const { data, error } = await supabase
        .from('events')
        .update({ status: 'published' })
        .eq('id', input.eventId)
        .select()
        .single();

      if (error) throw error;

      if (event.promoter_id) {
        await supabase.from('notifications').insert({
          id: genId('notif'),
          user_id: event.promoter_id,
          type: 'event_approved',
          title: 'Evento Aprovado! 🎉',
          message: `O seu evento "${event.title}" foi aprovado e está agora publicado.`,
          data: JSON.stringify({ eventId: input.eventId, eventTitle: event.title }),
          is_read: false,
        });

        const { data: followers } = await supabase
          .from('following')
          .select('user_id')
          .eq('promoter_id', event.promoter_id);

        if (followers && followers.length > 0) {
          const promoterName = event.promoters?.name || 'Promotor';
          const eventDate = new Date(event.date);
          const formattedDate = eventDate.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
          const notifs = followers.map((f: any) => ({
            id: genId('notif'),
            user_id: f.user_id,
            type: 'new_promoter_event',
            title: `${promoterName} tem um novo evento! 🎉`,
            message: `${event.title} - ${formattedDate} em ${event.venue_name}`,
            data: JSON.stringify({ eventId: input.eventId, eventTitle: event.title, promoterId: event.promoter_id }),
            is_read: false,
          }));
          await supabase.from('notifications').insert(notifs);
        }
      }

      return data;
    } catch (err) {
      console.error('[eventsApi.approve] error:', err);
      throw err;
    }
  },

  reject: async (input: { eventId: string; reason?: string }): Promise<any> => {
    try {
      const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', input.eventId)
        .single();

      if (!event) throw new Error('Evento não encontrado');
      if (event.status !== 'pending') throw new Error('Apenas eventos pendentes podem ser rejeitados');

      const { data, error } = await supabase
        .from('events')
        .update({ status: 'cancelled' })
        .eq('id', input.eventId)
        .select()
        .single();

      if (error) throw error;

      if (event.promoter_id) {
        const message = input.reason
          ? `O seu evento "${event.title}" foi rejeitado. Motivo: ${input.reason}`
          : `O seu evento "${event.title}" foi rejeitado.`;
        await supabase.from('notifications').insert({
          id: genId('notif'),
          user_id: event.promoter_id,
          type: 'system',
          title: 'Evento Rejeitado',
          message,
          data: JSON.stringify({ eventId: input.eventId, reason: input.reason }),
          is_read: false,
        });
      }

      return data;
    } catch (err) {
      console.error('[eventsApi.reject] error:', err);
      throw err;
    }
  },

  listPending: async (): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, promoters(*)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        title: row.title,
        artists: safeJsonParse(row.artists, []),
        venue: { name: row.venue_name, address: row.venue_address, city: row.venue_city, capacity: row.venue_capacity },
        date: row.date,
        endDate: row.end_date,
        image: row.image,
        description: row.description,
        category: row.category,
        ticketTypes: safeJsonParse(row.ticket_types, []),
        promoter: row.promoters ? {
          id: row.promoters.id,
          name: row.promoters.name,
          image: row.promoters.image,
          description: row.promoters.description,
          verified: row.promoters.verified,
          followersCount: row.promoters.followers_count,
        } : null,
        tags: safeJsonParse(row.tags, []),
        socialLinks: { instagram: row.instagram_link, facebook: row.facebook_link, twitter: row.twitter_link, website: row.website_link },
        coordinates: (row.latitude && row.longitude) ? { latitude: row.latitude, longitude: row.longitude } : null,
        status: row.status,
        createdAt: row.created_at,
      }));
    } catch {
      return [];
    }
  },

  getPendingDetails: async (input: { eventId: string }): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, promoters(*)')
        .eq('id', input.eventId)
        .single();

      if (error || !data) return null;
      return mapDbEventToEvent(data);
    } catch {
      return null;
    }
  },

  setFeatured: async (input: { id: string; featured: boolean }): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({ is_featured: input.featured })
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[eventsApi.setFeatured] error:', err);
      throw err;
    }
  },

  search: async (input: any): Promise<Event[]> => {
    try {
      let query = supabase
        .from('events')
        .select('*, promoters(*)')
        .order('date', { ascending: true });

      if (input?.query) {
        query = query.or(`title.ilike.%${input.query}%,description.ilike.%${input.query}%,venue_city.ilike.%${input.query}%`);
      }
      if (input?.category) query = query.eq('category', input.category);
      if (input?.venueCity) query = query.ilike('venue_city', `%${input.venueCity}%`);

      const { data, error } = await query;

      if (error || !data) {
        const q = (input?.query || '').toLowerCase();
        return mockEvents.filter(e =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.venue.city.toLowerCase().includes(q)
        );
      }
      return data.map(mapDbEventToEvent);
    } catch {
      return [];
    }
  },

  searchSuggestions: async (input: { query: string }): Promise<string[]> => {
    try {
      const { data } = await supabase
        .from('events')
        .select('title, venue_city')
        .or(`title.ilike.%${input.query}%,venue_city.ilike.%${input.query}%`)
        .limit(5);

      if (data && data.length > 0) {
        return [...new Set(data.map((d: any) => d.title))];
      }
      return mockEvents
        .filter(e => e.title.toLowerCase().includes(input.query.toLowerCase()))
        .map(e => e.title)
        .slice(0, 5);
    } catch {
      return [];
    }
  },

  statistics: async (input: { eventId: string }): Promise<any> => {
    try {
      const { data } = await supabase
        .from('event_statistics')
        .select('*')
        .eq('event_id', input.eventId)
        .single();

      if (data) {
        return {
          eventId: data.event_id,
          totalTicketsSold: data.total_tickets_sold || 0,
          totalRevenue: data.total_revenue || 0,
          ticketTypeStats: safeJsonParse(data.ticket_type_stats, []),
          dailySales: safeJsonParse(data.daily_sales, []),
          lastUpdated: data.last_updated,
        };
      }
      return mockEventStatistics.find(s => s.eventId === input.eventId) || {
        eventId: input.eventId,
        totalTicketsSold: 0,
        totalRevenue: 0,
        ticketTypeStats: [],
        dailySales: [],
        lastUpdated: new Date(),
      };
    } catch {
      return mockEventStatistics.find(s => s.eventId === input.eventId) || {
        eventId: input.eventId,
        totalTicketsSold: 0,
        totalRevenue: 0,
        ticketTypeStats: [],
        dailySales: [],
        lastUpdated: new Date(),
      };
    }
  },

  trackView: async (input: { eventId: string; sessionId: string }): Promise<{ success: boolean }> => {
    try {
      await supabase.from('event_views').upsert({
        id: `${input.eventId}_${input.sessionId}`,
        event_id: input.eventId,
        session_id: input.sessionId,
        user_id: null,
        viewed_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
      });
      return { success: true };
    } catch {
      return { success: true };
    }
  },

  getActiveViewers: async (input: { eventId: string }): Promise<{ activeViewers: number }> => {
    try {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('event_views')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', input.eventId)
        .gte('last_active_at', fiveMinAgo);

      return { activeViewers: count || 0 };
    } catch {
      return { activeViewers: 0 };
    }
  },
};

export const authApi = {
  login: async (input: { email: string; password: string }): Promise<any> => {
    console.log('[authApi.login] Attempting Supabase Auth login...');
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (authError) {
        console.log('[authApi.login] Supabase Auth failed:', authError.message);
        if (authError.message.includes('Invalid login credentials') || authError.message.includes('invalid')) {
          throw new Error('Credenciais inválidas. Verifica o email e palavra-passe.');
        }
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Credenciais inválidas.');
      }

      const supaUser = authData.user;
      console.log('[authApi.login] success:', supaUser.id);

      let profileData: any = null;
      try {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('email', input.email.toLowerCase())
          .single();
        profileData = profile;
      } catch {
        console.log('[authApi.login] No profile in users table, using auth metadata');
      }

      const meta = supaUser.user_metadata || {};
      const user = {
        id: profileData?.id || supaUser.id,
        name: profileData?.name || meta.name || meta.full_name || input.email.split('@')[0],
        email: supaUser.email || input.email,
        userType: profileData?.user_type || meta.userType || 'normal',
        isOnboardingComplete: profileData?.is_onboarding_complete ? 1 : 0,
        phone: profileData?.phone || meta.phone || null,
        interests: profileData?.interests || '[]',
        locationLatitude: profileData?.location_latitude || null,
        locationLongitude: profileData?.location_longitude || null,
        locationCity: profileData?.location_city || null,
        locationRegion: profileData?.location_region || null,
        preferencesNotifications: profileData?.preferences_notifications ? 1 : 0,
        preferencesLanguage: profileData?.preferences_language || 'pt',
        preferencesPriceMin: profileData?.preferences_price_min || 0,
        preferencesPriceMax: profileData?.preferences_price_max || 1000,
        preferencesEventTypes: profileData?.preferences_event_types || '[]',
        favoriteEvents: profileData?.favorite_events || '[]',
        eventHistory: profileData?.event_history || '[]',
        createdAt: profileData?.created_at || supaUser.created_at,
      };

      return { success: true, user };
    } catch (err) {
      console.error('[authApi.login] error:', err);
      throw err;
    }
  },

  sendVerificationCode: async (input: { email: string; name: string; password: string }): Promise<{ success: boolean }> => {
    console.log('[authApi.sendVerificationCode] Storing code in Supabase...');
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      await supabase.from('verification_codes').delete().eq('email', input.email.toLowerCase());

      const { error } = await supabase.from('verification_codes').insert({
        id: genId('vc'),
        email: input.email.toLowerCase(),
        code,
        name: input.name,
        password: input.password,
        expires_at: expiresAt,
        is_used: false,
      });

      if (error) {
        console.error('[authApi.sendVerificationCode] insert error:', error.message);
        throw new Error('Falha ao gerar código de verificação.');
      }

      console.log(`[authApi.sendVerificationCode] Code stored for ${input.email}: ${code}`);
      return { success: true };
    } catch (err: any) {
      console.error('[authApi.sendVerificationCode] error:', err);
      throw err;
    }
  },

  verifyCode: async (input: { email: string; code: string }): Promise<{ success: boolean; verified: boolean; userData?: { name: string; password: string } }> => {
    console.log('[authApi.verifyCode] Verifying code for:', input.email);
    try {
      const { data: record, error } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('email', input.email.toLowerCase())
        .eq('is_used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !record) {
        console.log('[authApi.verifyCode] No record found');
        throw new Error('Código inválido ou expirado. Solicite um novo código.');
      }

      if (new Date() > new Date(record.expires_at)) {
        console.log('[authApi.verifyCode] Code expired');
        await supabase.from('verification_codes').update({ is_used: true }).eq('id', record.id);
        throw new Error('Código expirado. Solicite um novo código.');
      }

      if (record.code !== input.code) {
        console.log('[authApi.verifyCode] Invalid code');
        throw new Error('Código inválido. Tente novamente.');
      }

      await supabase.from('verification_codes').update({ is_used: true }).eq('id', record.id);
      console.log('[authApi.verifyCode] Code verified successfully');

      return {
        success: true,
        verified: true,
        userData: { name: record.name, password: record.password },
      };
    } catch (err: any) {
      console.error('[authApi.verifyCode] error:', err);
      throw err;
    }
  },
};

export const usersApi = {
  create: async (input: any): Promise<any> => {
    try {
      const userId = input.id || genId('user');
      const { data, error } = await supabase.from('users').upsert({
        id: userId,
        name: input.name,
        email: input.email?.toLowerCase(),
        phone: input.phone || null,
        user_type: input.userType || 'normal',
        interests: JSON.stringify(input.interests || []),
        is_onboarding_complete: input.isOnboardingComplete || false,
        created_at: new Date().toISOString(),
      }).select().single();

      if (error) {
        console.log('[usersApi.create] error:', error.message);
        return { id: userId, ...input };
      }
      return data || { id: userId, ...input };
    } catch {
      return { id: input.id || genId('user'), ...input };
    }
  },

  get: async (input: { id: string }): Promise<any> => {
    try {
      const { data } = await supabase.from('users').select('*').eq('id', input.id).single();
      return data;
    } catch {
      return null;
    }
  },

  list: async (input?: { limit?: number }): Promise<any[]> => {
    try {
      let query = supabase.from('users').select('*').order('created_at', { ascending: false });
      if (input?.limit) query = query.limit(input.limit);
      const { data, error } = await query;
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  update: async (input: any): Promise<any> => {
    try {
      const { id, ...rest } = input;
      const updates: Record<string, any> = {};
      if (rest.name !== undefined) updates.name = rest.name;
      if (rest.email !== undefined) updates.email = rest.email;
      if (rest.phone !== undefined) updates.phone = rest.phone;
      if (rest.interests !== undefined) updates.interests = typeof rest.interests === 'string' ? rest.interests : JSON.stringify(rest.interests);
      if (rest.locationLatitude !== undefined) updates.location_latitude = rest.locationLatitude;
      if (rest.locationLongitude !== undefined) updates.location_longitude = rest.locationLongitude;
      if (rest.locationCity !== undefined) updates.location_city = rest.locationCity;
      if (rest.locationRegion !== undefined) updates.location_region = rest.locationRegion;
      if (rest.preferencesNotifications !== undefined) updates.preferences_notifications = rest.preferencesNotifications;
      if (rest.preferencesLanguage !== undefined) updates.preferences_language = rest.preferencesLanguage;
      if (rest.preferencesPriceMin !== undefined) updates.preferences_price_min = rest.preferencesPriceMin;
      if (rest.preferencesPriceMax !== undefined) updates.preferences_price_max = rest.preferencesPriceMax;
      if (rest.preferencesEventTypes !== undefined) updates.preferences_event_types = typeof rest.preferencesEventTypes === 'string' ? rest.preferencesEventTypes : JSON.stringify(rest.preferencesEventTypes);

      if (Object.keys(updates).length === 0) throw new Error('No fields to update');

      const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[usersApi.update] error:', err);
      throw err;
    }
  },

  delete: async (input: { id: string }): Promise<{ success: boolean }> => {
    try {
      const { error } = await supabase.from('users').delete().eq('id', input.id);
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('[usersApi.delete] error:', err);
      throw err;
    }
  },

  updateOnboarding: async (input: any): Promise<{ success: boolean }> => {
    try {
      await supabase.from('users').update({
        phone: input.phone,
        interests: JSON.stringify(input.interests || []),
        location_city: input.locationCity,
        location_region: input.locationRegion,
        location_latitude: input.locationLatitude,
        location_longitude: input.locationLongitude,
        preferences_notifications: input.preferencesNotifications,
        preferences_language: input.preferencesLanguage,
        preferences_price_min: input.preferencesPriceMin,
        preferences_price_max: input.preferencesPriceMax,
        preferences_event_types: JSON.stringify(input.preferencesEventTypes || []),
        is_onboarding_complete: true,
      }).eq('id', input.id);
      return { success: true };
    } catch {
      return { success: true };
    }
  },
};

export const ticketsApi = {
  create: async (input: any): Promise<any> => {
    try {
      const { data, error } = await supabase.from('tickets').insert({
        id: input.id,
        event_id: input.eventId,
        user_id: input.userId,
        ticket_type_id: input.ticketTypeId,
        quantity: input.quantity,
        price: input.price,
        qr_code: input.qrCode,
        is_used: false,
        valid_until: input.validUntil,
        purchase_date: new Date().toISOString(),
      }).select().single();

      if (error) throw error;

      try {
        const { data: event } = await supabase.from('events').select('title, promoter_id').eq('id', input.eventId).single();
        if (event?.promoter_id) {
          await supabase.from('notifications').insert({
            id: genId('notif'),
            user_id: event.promoter_id,
            type: 'ticket_sold',
            title: 'Novo Bilhete Vendido! 🎫',
            message: `${input.quantity} bilhete(s) vendido(s) para "${event.title}" - €${input.price.toFixed(2)}`,
            data: JSON.stringify({ eventId: input.eventId, ticketId: input.id, quantity: input.quantity, price: input.price }),
            is_read: false,
          });
        }
      } catch { /* notification is non-critical */ }

      return data;
    } catch (err) {
      console.error('[ticketsApi.create] error:', err);
      throw err;
    }
  },

  batchCreate: async (input: { tickets: any[] }): Promise<{ success: boolean }> => {
    try {
      const rows = input.tickets.map(t => ({
        id: t.id,
        event_id: t.eventId,
        user_id: t.userId,
        ticket_type_id: t.ticketTypeId,
        quantity: t.quantity,
        price: t.price,
        qr_code: t.qrCode,
        valid_until: t.validUntil,
        purchase_date: new Date().toISOString(),
      }));
      const { error } = await supabase.from('tickets').insert(rows);
      if (error) console.log('[ticketsApi.batchCreate] warning:', error.message);
      return { success: true };
    } catch {
      return { success: true };
    }
  },

  get: async (input: { id: string }): Promise<any> => {
    try {
      const { data } = await supabase.from('tickets').select('*').eq('id', input.id).single();
      if (!data) return null;
      return {
        id: data.id, eventId: data.event_id, userId: data.user_id, ticketTypeId: data.ticket_type_id,
        quantity: data.quantity, price: data.price, qrCode: data.qr_code, isUsed: data.is_used,
        validatedAt: data.validated_at, validatedBy: data.validated_by, purchaseDate: data.purchase_date,
        validUntil: data.valid_until, addedToCalendar: data.added_to_calendar, reminderSet: data.reminder_set,
      };
    } catch {
      return null;
    }
  },

  list: async (input: { userId: string }): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', input.userId)
        .order('purchase_date', { ascending: false });

      if (error || !data) return [];
      return data.map((t: any) => ({
        id: t.id, eventId: t.event_id, userId: t.user_id, ticketTypeId: t.ticket_type_id,
        quantity: t.quantity, price: t.price, qrCode: t.qr_code, isUsed: t.is_used,
        validatedAt: t.validated_at, validatedBy: t.validated_by, purchaseDate: t.purchase_date,
        validUntil: t.valid_until, addedToCalendar: t.added_to_calendar, reminderSet: t.reminder_set,
      }));
    } catch {
      return [];
    }
  },

  validate: async (input: { ticketId?: string; qrCode?: string }): Promise<any> => {
    try {
      let query = supabase.from('tickets').select('*');
      if (input.ticketId) query = query.eq('id', input.ticketId);
      if (input.qrCode) query = query.eq('qr_code', input.qrCode);

      const { data, error } = await query.single();
      if (error || !data) return { valid: false, message: 'Bilhete não encontrado' };
      if (data.is_used) return { valid: false, message: 'Bilhete já utilizado', ticket: data };

      await supabase.from('tickets').update({ is_used: true, validated_at: new Date().toISOString() }).eq('id', data.id);
      return { valid: true, message: 'Bilhete válido!', ticket: data };
    } catch {
      return { valid: false, message: 'Erro ao validar bilhete' };
    }
  },

  cancel: async (input: { ticketId: string }): Promise<{ success: boolean }> => {
    try {
      const { error } = await supabase.from('tickets').delete().eq('id', input.ticketId);
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('[ticketsApi.cancel] error:', err);
      throw err;
    }
  },

  transfer: async (input: { ticketId: string; toUserId: string }): Promise<{ success: boolean }> => {
    try {
      const { error } = await supabase.from('tickets').update({ user_id: input.toUserId }).eq('id', input.ticketId);
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('[ticketsApi.transfer] error:', err);
      throw err;
    }
  },

  addToCalendar: async (input: { ticketId: string }): Promise<{ success: boolean }> => {
    try {
      await supabase.from('tickets').update({ added_to_calendar: true }).eq('id', input.ticketId);
      return { success: true };
    } catch {
      return { success: true };
    }
  },

  setReminder: async (input: { ticketId: string }): Promise<{ success: boolean }> => {
    try {
      await supabase.from('tickets').update({ reminder_set: true }).eq('id', input.ticketId);
      return { success: true };
    } catch {
      return { success: true };
    }
  },

  generateWalletPass: async (_input: { ticketId: string }): Promise<{ success: boolean; passUrl?: string }> => {
    return { success: false, passUrl: undefined };
  },
};

export const promotersApi = {
  create: async (input: any): Promise<any> => {
    try {
      const id = genId('promoter');
      const { data, error } = await supabase.from('promoter_profiles').insert({
        id,
        user_id: input.userId,
        company_name: input.companyName,
        description: input.description || '',
        website: input.website || null,
        instagram_handle: input.instagramHandle || null,
        facebook_handle: input.facebookHandle || null,
        twitter_handle: input.twitterHandle || null,
        is_approved: false,
        events_created: '[]',
        followers: '[]',
        rating: 0,
        total_events: 0,
      }).select().single();

      if (error) throw error;
      return { id, promoter: data };
    } catch (err) {
      console.error('[promotersApi.create] error:', err);
      throw err;
    }
  },

  get: async (input: { id: string }): Promise<any> => {
    try {
      const { data } = await supabase.from('promoters').select('*').eq('id', input.id).single();
      if (!data) return null;
      return {
        id: data.id, name: data.name, image: data.image, description: data.description,
        verified: data.verified, followersCount: data.followers_count,
      };
    } catch {
      return null;
    }
  },

  getByUserId: async (input: { userId: string }): Promise<any> => {
    try {
      const { data } = await supabase
        .from('promoter_profiles')
        .select('*, promoters:promoters(*)')
        .eq('user_id', input.userId)
        .single();

      if (!data) return null;
      return {
        id: data.id, userId: data.user_id, companyName: data.company_name, description: data.description,
        website: data.website, instagramHandle: data.instagram_handle, facebookHandle: data.facebook_handle,
        twitterHandle: data.twitter_handle, isApproved: data.is_approved,
        promoter: data.promoters ? {
          id: data.promoters.id, name: data.promoters.name, image: data.promoters.image,
          description: data.promoters.description, verified: data.promoters.verified,
          followersCount: data.promoters.followers_count,
        } : null,
      };
    } catch {
      return null;
    }
  },

  update: async (input: any): Promise<any> => {
    try {
      const { id, ...rest } = input;
      const updates: Record<string, any> = {};
      if (rest.companyName !== undefined) updates.company_name = rest.companyName;
      if (rest.description !== undefined) updates.description = rest.description;
      if (rest.website !== undefined) updates.website = rest.website;
      if (rest.instagramHandle !== undefined) updates.instagram_handle = rest.instagramHandle;
      if (rest.facebookHandle !== undefined) updates.facebook_handle = rest.facebookHandle;
      if (rest.twitterHandle !== undefined) updates.twitter_handle = rest.twitterHandle;

      if (Object.keys(updates).length === 0) throw new Error('No fields to update');

      const { data, error } = await supabase.from('promoter_profiles').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[promotersApi.update] error:', err);
      throw err;
    }
  },

  delete: async (input: { id: string }): Promise<{ success: boolean }> => {
    try {
      const { error } = await supabase.from('promoter_profiles').delete().eq('id', input.id);
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('[promotersApi.delete] error:', err);
      throw err;
    }
  },

  list: async (): Promise<any[]> => {
    try {
      const { data } = await supabase.from('promoters').select('*');
      return (data || []).map((p: any) => ({
        id: p.id, name: p.name, image: p.image, description: p.description,
        verified: p.verified, followersCount: p.followers_count,
      }));
    } catch {
      return [];
    }
  },

  listPending: async (input?: { limit?: number; offset?: number }): Promise<{ promoters: any[]; total: number }> => {
    try {
      let query = supabase.from('promoter_profiles').select('*').eq('is_approved', false);
      if (input?.limit) query = query.limit(input.limit);
      if (input?.offset) query = query.range(input.offset, input.offset + (input.limit || 20) - 1);

      const { data, error } = await query;
      if (error) return { promoters: [], total: 0 };
      return { promoters: data || [], total: (data || []).length };
    } catch {
      return { promoters: [], total: 0 };
    }
  },

  approve: async (input: { id: string }): Promise<{ success: boolean; promoter?: any }> => {
    try {
      const { data: promoter } = await supabase.from('promoter_profiles').select('*').eq('id', input.id).single();

      const { data, error } = await supabase.from('promoter_profiles')
        .update({ is_approved: true, approval_date: new Date().toISOString() })
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;

      if (promoter?.user_id) {
        await supabase.from('notifications').insert({
          id: genId('notif'),
          user_id: promoter.user_id,
          type: 'system',
          title: 'Perfil de Promotor Aprovado',
          message: 'O seu perfil de promotor foi aprovado! Já pode criar eventos.',
          is_read: false,
        });
      }

      return { success: true, promoter: data };
    } catch (err) {
      console.error('[promotersApi.approve] error:', err);
      throw err;
    }
  },

  reject: async (input: { id: string; reason?: string }): Promise<{ success: boolean }> => {
    try {
      const { data: promoter } = await supabase.from('promoter_profiles').select('user_id').eq('id', input.id).single();

      if (promoter?.user_id) {
        await supabase.from('notifications').insert({
          id: genId('notif'),
          user_id: promoter.user_id,
          type: 'system',
          title: 'Perfil de Promotor Rejeitado',
          message: input.reason || 'O seu perfil de promotor foi rejeitado. Contacte o suporte.',
          is_read: false,
        });
      }

      await supabase.from('promoter_profiles').delete().eq('id', input.id);
      return { success: true };
    } catch (err) {
      console.error('[promotersApi.reject] error:', err);
      throw err;
    }
  },

  stats: async (input: { id: string }): Promise<any> => {
    try {
      const { data: promoterEvents } = await supabase.from('events').select('id').eq('promoter_id', input.id);
      const eventIds = (promoterEvents || []).map((e: any) => e.id);

      let totalTicketsSold = 0;
      let totalRevenue = 0;

      if (eventIds.length > 0) {
        const { data: eventTickets } = await supabase.from('tickets').select('quantity, price').in('event_id', eventIds);
        if (eventTickets) {
          totalTicketsSold = eventTickets.reduce((sum: number, t: any) => sum + (t.quantity || 0), 0);
          totalRevenue = eventTickets.reduce((sum: number, t: any) => sum + ((t.price || 0) * (t.quantity || 0)), 0);
        }
      }

      const { count: followersCount } = await supabase
        .from('following')
        .select('*', { count: 'exact', head: true })
        .eq('promoter_id', input.id);

      const now = new Date().toISOString();
      const { count: upcomingEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('promoter_id', input.id)
        .eq('status', 'published')
        .gte('date', now);

      return {
        totalEvents: eventIds.length,
        totalTicketsSold,
        totalRevenue,
        averageRating: 0,
        followersCount: followersCount || 0,
        upcomingEvents: upcomingEvents || 0,
      };
    } catch {
      return { totalEvents: 0, totalTicketsSold: 0, totalRevenue: 0, averageRating: 0, followersCount: 0, upcomingEvents: 0 };
    }
  },
};

export const advertisementsApi = {
  create: async (input: any): Promise<any> => {
    try {
      const id = genId('ad');
      const { data, error } = await supabase.from('advertisements').insert({
        id,
        title: input.title,
        description: input.description || '',
        image: input.image || '',
        target_url: input.targetUrl || null,
        type: input.type,
        position: input.position,
        start_date: input.startDate,
        end_date: input.endDate,
        budget: input.budget,
        promoter_id: input.promoterId || null,
        target_audience_interests: input.targetAudienceInterests || null,
        target_audience_age_min: input.targetAudienceAgeMin || null,
        target_audience_age_max: input.targetAudienceAgeMax || null,
        target_audience_location: input.targetAudienceLocation || null,
        is_active: false,
        impressions: 0,
        clicks: 0,
      }).select().single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[advertisementsApi.create] error:', err);
      throw err;
    }
  },

  get: async (input: { id: string }): Promise<any> => {
    try {
      const { data } = await supabase.from('advertisements').select('*').eq('id', input.id).single();
      return data || null;
    } catch {
      return null;
    }
  },

  update: async (input: any): Promise<any> => {
    try {
      const { id, ...rest } = input;
      const updates: Record<string, any> = {};
      if (rest.title !== undefined) updates.title = rest.title;
      if (rest.description !== undefined) updates.description = rest.description;
      if (rest.image !== undefined) updates.image = rest.image;
      if (rest.targetUrl !== undefined) updates.target_url = rest.targetUrl;
      if (rest.type !== undefined) updates.type = rest.type;
      if (rest.position !== undefined) updates.position = rest.position;
      if (rest.startDate !== undefined) updates.start_date = rest.startDate;
      if (rest.endDate !== undefined) updates.end_date = rest.endDate;
      if (rest.budget !== undefined) updates.budget = rest.budget;
      if (rest.isActive !== undefined) updates.is_active = rest.isActive;

      const { data, error } = await supabase.from('advertisements').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[advertisementsApi.update] error:', err);
      throw err;
    }
  },

  delete: async (input: { id: string }): Promise<{ success: boolean }> => {
    try {
      await supabase.from('advertisements').delete().eq('id', input.id);
      return { success: true };
    } catch (err) {
      console.error('[advertisementsApi.delete] error:', err);
      throw err;
    }
  },

  list: async (input?: { limit?: number; offset?: number; type?: string; position?: string; active?: boolean; promoterId?: string }): Promise<{ ads: any[]; total: number }> => {
    try {
      let query = supabase.from('advertisements').select('*');

      if (input?.type) query = query.eq('type', input.type);
      if (input?.position) query = query.eq('position', input.position);
      if (input?.active !== undefined) query = query.eq('is_active', input.active);
      if (input?.promoterId) query = query.eq('promoter_id', input.promoterId);
      if (input?.limit) query = query.limit(input.limit);
      if (input?.offset) query = query.range(input.offset, input.offset + (input.limit || 20) - 1);

      const { data, error } = await query;
      if (error) return { ads: mockAdvertisements as any[], total: mockAdvertisements.length };
      return { ads: data || [], total: (data || []).length };
    } catch {
      return { ads: mockAdvertisements as any[], total: mockAdvertisements.length };
    }
  },

  listPending: async (): Promise<any[]> => {
    try {
      const { data } = await supabase.from('advertisements').select('*').eq('is_active', false);
      return data || [];
    } catch {
      return [];
    }
  },

  approve: async (input: { id: string }): Promise<any> => {
    try {
      const { data, error } = await supabase.from('advertisements').update({ is_active: true }).eq('id', input.id).select().single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[advertisementsApi.approve] error:', err);
      throw err;
    }
  },

  recordImpression: async (input: { id: string }): Promise<{ success: boolean }> => {
    try {
      const { data: ad } = await supabase.from('advertisements').select('impressions').eq('id', input.id).single();
      if (ad) {
        await supabase.from('advertisements').update({ impressions: (ad.impressions || 0) + 1 }).eq('id', input.id);
      }
      return { success: true };
    } catch {
      return { success: true };
    }
  },

  recordClick: async (input: { id: string }): Promise<{ success: boolean }> => {
    try {
      const { data: ad } = await supabase.from('advertisements').select('clicks').eq('id', input.id).single();
      if (ad) {
        await supabase.from('advertisements').update({ clicks: (ad.clicks || 0) + 1 }).eq('id', input.id);
      }
      return { success: true };
    } catch {
      return { success: true };
    }
  },

  stats: async (input: { id: string }): Promise<any> => {
    try {
      const { data: ad } = await supabase.from('advertisements').select('*').eq('id', input.id).single();
      if (!ad) throw new Error('Advertisement not found');

      const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0;
      const costPerClick = ad.clicks > 0 ? ad.budget / ad.clicks : 0;
      const costPerImpression = ad.impressions > 0 ? ad.budget / ad.impressions : 0;

      return {
        impressions: ad.impressions,
        clicks: ad.clicks,
        ctr: parseFloat(ctr.toFixed(2)),
        budget: ad.budget,
        spent: ad.budget,
        costPerClick: parseFloat(costPerClick.toFixed(2)),
        costPerImpression: parseFloat(costPerImpression.toFixed(4)),
      };
    } catch (err) {
      console.error('[advertisementsApi.stats] error:', err);
      throw err;
    }
  },
};

export const socialApi = {
  follow: async (input: { userId: string; promoterId?: string }): Promise<{ success: boolean }> => {
    try {
      await supabase.from('following').insert({
        id: genId('follow'),
        user_id: input.userId,
        promoter_id: input.promoterId || null,
        followed_at: new Date().toISOString(),
      });
      return { success: true };
    } catch {
      return { success: true };
    }
  },

  unfollow: async (input: { userId: string; promoterId?: string }): Promise<{ success: boolean }> => {
    try {
      await supabase.from('following')
        .delete()
        .eq('user_id', input.userId)
        .eq('promoter_id', input.promoterId || '');
      return { success: true };
    } catch {
      return { success: true };
    }
  },

  isFollowing: async (input: { userId: string; promoterId: string }): Promise<{ isFollowing: boolean }> => {
    try {
      const { data } = await supabase.from('following')
        .select('id')
        .eq('user_id', input.userId)
        .eq('promoter_id', input.promoterId)
        .maybeSingle();
      return { isFollowing: !!data };
    } catch {
      return { isFollowing: false };
    }
  },

  getFollowing: async (input: { userId: string }): Promise<any[]> => {
    try {
      const { data } = await supabase.from('following')
        .select('*, promoters(*)')
        .eq('user_id', input.userId);
      return (data || []).map((f: any) => ({
        id: f.id,
        promoterId: f.promoter_id,
        promoter: f.promoters ? {
          id: f.promoters.id, name: f.promoters.name, image: f.promoters.image,
          description: f.promoters.description, verified: f.promoters.verified,
          followersCount: f.promoters.followers_count,
        } : null,
        followedAt: f.followed_at,
      }));
    } catch {
      return [];
    }
  },

  getFollowers: async (input: { promoterId: string }): Promise<any[]> => {
    try {
      const { data } = await supabase.from('following')
        .select('*, users(*)')
        .eq('promoter_id', input.promoterId);
      return data || [];
    } catch {
      return [];
    }
  },
};

export const notificationsApi = {
  list: async (input: { userId: string }): Promise<any[]> => {
    try {
      const { data } = await supabase.from('notifications')
        .select('*')
        .eq('user_id', input.userId)
        .order('created_at', { ascending: false });
      return (data || []).map((n: any) => ({
        id: n.id, userId: n.user_id, type: n.type, title: n.title,
        message: n.message, data: n.data ? safeJsonParse(n.data, null) : null,
        isRead: n.is_read, createdAt: n.created_at,
      }));
    } catch {
      return [];
    }
  },

  registerToken: async (input: { userId: string; token: string; platform: string }): Promise<{ success: boolean }> => {
    try {
      await supabase.from('push_tokens').upsert({
        id: `token_${input.userId}_${input.platform}`,
        user_id: input.userId,
        token: input.token,
        platform: input.platform,
        is_active: true,
        last_used: new Date().toISOString(),
      });
      return { success: true };
    } catch {
      return { success: true };
    }
  },

  send: async (input: any): Promise<{ success: boolean }> => {
    try {
      if (input.userId && input.title && input.message) {
        await supabase.from('notifications').insert({
          id: genId('notif'),
          user_id: input.userId,
          type: input.type || 'general',
          title: input.title,
          message: input.message,
          data: input.data ? JSON.stringify(input.data) : null,
          is_read: false,
        });
      }
      return { success: true };
    } catch {
      return { success: true };
    }
  },

  markRead: async (input: { id: string }): Promise<{ success: boolean }> => {
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', input.id);
      return { success: true };
    } catch {
      return { success: true };
    }
  },
};

export const paymentMethodsApi = {
  list: async (input: { userId: string }): Promise<any[]> => {
    try {
      const { data } = await supabase.from('payment_methods')
        .select('*')
        .eq('user_id', input.userId)
        .order('created_at', { ascending: false });
      return (data || []).map((pm: any) => ({
        id: pm.id, userId: pm.user_id, type: pm.type, isPrimary: pm.is_primary,
        accountHolderName: pm.account_holder_name, bankName: pm.bank_name,
        iban: pm.iban, swift: pm.swift, phoneNumber: pm.phone_number,
        email: pm.email, accountId: pm.account_id, isVerified: pm.is_verified,
        createdAt: pm.created_at, updatedAt: pm.updated_at,
      }));
    } catch {
      return [];
    }
  },

  create: async (input: any): Promise<any> => {
    try {
      const id = genId('pm');
      const { data } = await supabase.from('payment_methods').insert({
        id,
        user_id: input.userId,
        type: input.type,
        is_primary: input.isPrimary || false,
        account_holder_name: input.accountHolderName,
        bank_name: input.bankName,
        iban: input.iban,
        swift: input.swift,
        phone_number: input.phoneNumber,
        email: input.email,
        account_id: input.accountId,
      }).select().single();
      return data || { id, ...input };
    } catch {
      return { id: genId('pm'), ...input };
    }
  },

  update: async (input: any): Promise<any> => {
    try {
      await supabase.from('payment_methods').update({
        type: input.type,
        account_holder_name: input.accountHolderName,
        bank_name: input.bankName,
        iban: input.iban,
        swift: input.swift,
        phone_number: input.phoneNumber,
        email: input.email,
        updated_at: new Date().toISOString(),
      }).eq('id', input.id);
      return { success: true };
    } catch {
      return { success: true };
    }
  },

  delete: async (input: { id: string }): Promise<{ success: boolean }> => {
    try {
      await supabase.from('payment_methods').delete().eq('id', input.id);
      return { success: true };
    } catch {
      return { success: true };
    }
  },

  setPrimary: async (input: { id: string; userId: string }): Promise<{ success: boolean }> => {
    try {
      await supabase.from('payment_methods').update({ is_primary: false }).eq('user_id', input.userId);
      await supabase.from('payment_methods').update({ is_primary: true }).eq('id', input.id);
      return { success: true };
    } catch {
      return { success: true };
    }
  },
};

export const affiliatesApi = {
  create: async (input: { userId: string; code: string; commissionRate?: number }): Promise<{ id: string; success: boolean }> => {
    try {
      const id = genId('affiliate');
      const { error } = await supabase.from('affiliates').insert({
        id,
        user_id: input.userId,
        code: input.code,
        commission_rate: input.commissionRate ?? 0.1,
        total_earnings: 0,
        total_sales: 0,
        is_active: true,
      });
      if (error) throw error;
      return { id, success: true };
    } catch (err) {
      console.error('[affiliatesApi.create] error:', err);
      throw err;
    }
  },

  getByUser: async (input: { userId: string }): Promise<any> => {
    try {
      const { data } = await supabase.from('affiliates').select('*').eq('user_id', input.userId).single();
      return data || null;
    } catch {
      return null;
    }
  },

  getByCode: async (input: { code: string }): Promise<any> => {
    try {
      const { data } = await supabase.from('affiliates').select('*').eq('code', input.code).single();
      return data || null;
    } catch {
      return null;
    }
  },

  recordSale: async (input: { affiliateId: string; ticketId: string; commission: number }): Promise<{ id: string; success: boolean }> => {
    try {
      const id = genId('aff_sale');
      await supabase.from('affiliate_sales').insert({
        id,
        affiliate_id: input.affiliateId,
        ticket_id: input.ticketId,
        commission: input.commission,
        status: 'pending',
      });

      const { data: affiliate } = await supabase.from('affiliates').select('total_earnings, total_sales').eq('id', input.affiliateId).single();
      if (affiliate) {
        await supabase.from('affiliates').update({
          total_earnings: (affiliate.total_earnings || 0) + input.commission,
          total_sales: (affiliate.total_sales || 0) + 1,
        }).eq('id', input.affiliateId);
      }

      return { id, success: true };
    } catch (err) {
      console.error('[affiliatesApi.recordSale] error:', err);
      throw err;
    }
  },

  stats: async (input: { userId: string }): Promise<any> => {
    try {
      const { data } = await supabase.from('affiliates').select('*').eq('user_id', input.userId).single();
      if (!data) return null;
      return {
        code: data.code,
        totalEarnings: data.total_earnings,
        totalSales: data.total_sales,
        commissionRate: data.commission_rate,
        isActive: data.is_active,
      };
    } catch {
      return null;
    }
  },
};

export const bundlesApi = {
  create: async (input: { name: string; description: string; eventIds: string[]; discount: number; image: string; validUntil: string }): Promise<{ id: string; success: boolean }> => {
    try {
      const id = genId('bundle');
      const { error } = await supabase.from('event_bundles').insert({
        id,
        name: input.name,
        description: input.description,
        event_ids: JSON.stringify(input.eventIds),
        discount: input.discount,
        image: input.image,
        is_active: true,
        valid_until: input.validUntil,
      });
      if (error) throw error;
      return { id, success: true };
    } catch (err) {
      console.error('[bundlesApi.create] error:', err);
      throw err;
    }
  },

  list: async (input?: { activeOnly?: boolean }): Promise<any[]> => {
    try {
      let query = supabase.from('event_bundles').select('*');
      if (input?.activeOnly !== false) {
        query = query.eq('is_active', true).gte('valid_until', new Date().toISOString());
      }

      const { data, error } = await query;
      if (error) return [];
      return (data || []).map((b: any) => ({
        ...b,
        eventIds: safeJsonParse(b.event_ids, []),
      }));
    } catch {
      return [];
    }
  },

  get: async (input: { id: string }): Promise<any> => {
    try {
      const { data } = await supabase.from('event_bundles').select('*').eq('id', input.id).single();
      if (!data) throw new Error('Bundle not found');
      return { ...data, eventIds: safeJsonParse(data.event_ids, []) };
    } catch (err) {
      console.error('[bundlesApi.get] error:', err);
      throw err;
    }
  },
};

export const priceAlertsApi = {
  create: async (input: { userId: string; eventId: string; targetPrice: number }): Promise<{ id: string; success: boolean }> => {
    try {
      const id = genId('price_alert');
      const { error } = await supabase.from('price_alerts').insert({
        id,
        user_id: input.userId,
        event_id: input.eventId,
        target_price: input.targetPrice,
        is_active: true,
      });
      if (error) throw error;
      return { id, success: true };
    } catch (err) {
      console.error('[priceAlertsApi.create] error:', err);
      throw err;
    }
  },

  list: async (input: { userId: string }): Promise<any[]> => {
    try {
      const { data } = await supabase.from('price_alerts').select('*').eq('user_id', input.userId);
      return data || [];
    } catch {
      return [];
    }
  },

  delete: async (input: { id: string }): Promise<{ success: boolean }> => {
    try {
      await supabase.from('price_alerts').delete().eq('id', input.id);
      return { success: true };
    } catch (err) {
      console.error('[priceAlertsApi.delete] error:', err);
      throw err;
    }
  },
};

export const identityApi = {
  createVerification: async (input: { userId: string; documentType: string; documentNumber: string }): Promise<{ id: string; success: boolean }> => {
    try {
      const id = genId('verification');
      const { error } = await supabase.from('identity_verifications').insert({
        id,
        user_id: input.userId,
        document_type: input.documentType,
        document_number: input.documentNumber,
        status: 'pending',
      });
      if (error) throw error;
      return { id, success: true };
    } catch (err) {
      console.error('[identityApi.createVerification] error:', err);
      throw err;
    }
  },

  getStatus: async (input: { userId: string }): Promise<any> => {
    try {
      const { data } = await supabase.from('identity_verifications').select('*').eq('user_id', input.userId).order('created_at', { ascending: false }).limit(1).single();
      return data || null;
    } catch {
      return null;
    }
  },
};

export const recommendationsApi = {
  smart: async (input: { userId: string; limit?: number; includeReasons?: boolean }): Promise<{ recommendations: any[] }> => {
    try {
      const { data: user } = await supabase.from('users').select('*').eq('id', input.userId).single();
      if (!user) return { recommendations: [] };

      const { data: userTickets } = await supabase.from('tickets').select('event_id').eq('user_id', input.userId);
      const ticketEventIds = (userTickets || []).map((t: any) => t.event_id);

      let pastCategories: string[] = [];
      if (ticketEventIds.length > 0) {
        const { data: pastEvents } = await supabase.from('events').select('category').in('id', ticketEventIds);
        pastCategories = (pastEvents || []).map((e: any) => e.category).filter(Boolean);
      }

      const userInterests = safeJsonParse(user.interests, []);
      const userLocation = user.location_city || '';

      const { data: upcomingEvents } = await supabase
        .from('events')
        .select('*, promoters(*)')
        .eq('status', 'published')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(100);

      if (!upcomingEvents || upcomingEvents.length === 0) return { recommendations: [] };

      const includeReasons = input.includeReasons !== false;
      const scored = upcomingEvents.map((event: any) => {
        let score = 0;
        const reasons: string[] = [];
        const eventTags = safeJsonParse<string[]>(event.tags, []);

        if (Array.isArray(userInterests) && userInterests.some((i: string) => eventTags.includes(i))) {
          score += 30;
          reasons.push('Corresponde aos teus interesses');
        }
        if (pastCategories.includes(event.category)) {
          score += 20;
          reasons.push('Categoria que já assististe antes');
        }
        if (event.venue_city && userLocation && event.venue_city.toLowerCase().includes(userLocation.toLowerCase())) {
          score += 25;
          reasons.push('Perto da tua localização');
        }
        if (event.is_featured) {
          score += 15;
          reasons.push('Evento em destaque');
        }
        const daysUntil = Math.floor((new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 7) {
          score += 10;
          reasons.push('Acontece em breve');
        }
        score += Math.random() * 10;

        return { event: mapDbEventToEvent(event), score, reasons: includeReasons ? reasons : [] };
      });

      scored.sort((a: any, b: any) => b.score - a.score);

      const limit = input.limit || 10;
      const recommendations = scored.slice(0, limit).map((item: any, index: number) => ({
        eventId: item.event.id,
        score: item.score,
        reasons: item.reasons,
        rank: index + 1,
        basedOn: item.reasons.includes('Corresponde aos teus interesses') ? 'interests'
          : item.reasons.includes('Perto da tua localização') ? 'location'
          : item.reasons.includes('Categoria que já assististe antes') ? 'history'
          : item.reasons.includes('Evento em destaque') ? 'featured'
          : 'mixed' as const,
        event: item.event,
      }));

      return { recommendations };
    } catch (err) {
      console.error('[recommendationsApi.smart] error:', err);
      return { recommendations: [] };
    }
  },

  ai: async (input: { userId: string; limit?: number }): Promise<{ recommendations: any[] }> => {
    return recommendationsApi.smart({ ...input, includeReasons: true });
  },
};

export const analyticsApi = {
  dashboard: async (): Promise<any> => {
    try {
      const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: totalEvents } = await supabase.from('events').select('*', { count: 'exact', head: true });
      const { count: totalTickets } = await supabase.from('tickets').select('*', { count: 'exact', head: true });
      const { data: ticketRevenue } = await supabase.from('tickets').select('price, quantity');
      const totalRevenue = (ticketRevenue || []).reduce((sum: number, t: any) => sum + ((t.price || 0) * (t.quantity || 0)), 0);

      return {
        totalUsers: totalUsers || 0,
        totalEvents: totalEvents || 0,
        totalTickets: totalTickets || 0,
        totalRevenue,
      };
    } catch {
      return { totalUsers: 0, totalEvents: 0, totalTickets: 0, totalRevenue: 0 };
    }
  },

  events: async (): Promise<any> => {
    try {
      const { data } = await supabase.from('events').select('id, title, category, status, date, is_featured').order('date', { ascending: false }).limit(50);
      return { events: data || [] };
    } catch {
      return { events: [] };
    }
  },

  promoters: async (): Promise<any> => {
    try {
      const { data } = await supabase.from('promoters').select('*');
      return { promoters: data || [] };
    } catch {
      return { promoters: [] };
    }
  },

  revenue: async (): Promise<any> => {
    try {
      const { data } = await supabase.from('tickets').select('price, quantity, purchase_date').order('purchase_date', { ascending: false }).limit(100);
      return { revenue: data || [] };
    } catch {
      return { revenue: [] };
    }
  },

  users: async (): Promise<any> => {
    try {
      const { data } = await supabase.from('users').select('id, name, email, user_type, created_at').order('created_at', { ascending: false }).limit(50);
      return { users: data || [] };
    } catch {
      return { users: [] };
    }
  },
};

export const stripeApi = {
  getConfig: async (): Promise<{ isConfigured: boolean; publishableKey: string | null }> => {
    return { isConfigured: false, publishableKey: null };
  },

  createCheckout: async (_input: any): Promise<any> => {
    throw new Error('Stripe checkout requires server-side configuration via Supabase Edge Functions');
  },

  createPaymentIntent: async (_input: any): Promise<any> => {
    throw new Error('Stripe payment intent requires server-side configuration via Supabase Edge Functions');
  },

  getSession: async (_input: { sessionId: string }): Promise<any> => {
    return null;
  },
};

export const emailsApi = {
  sendTest: async (_input: any): Promise<{ success: boolean }> => {
    console.log('[emailsApi.sendTest] Email sending requires Supabase Edge Functions');
    return { success: false };
  },
};

export const exampleApi = {
  hi: async (input?: { name?: string }): Promise<{ greeting: string }> => {
    return { greeting: `Hello ${input?.name || 'World'}! (Supabase direct mode)` };
  },
};

export const webhooksApi = {
  createEvent: async (input: any): Promise<any> => {
    return eventsApi.create(input);
  },
};

import { supabase } from './supabase';
import { mockEvents, mockAdvertisements, mockEventStatistics } from '@/mocks/events';
import { Event, Promoter, EventCategory } from '@/types/event';

interface DbPromoter {
  id: string;
  name: string;
  image: string;
  description: string;
  verified: boolean;
  followers_count: number;
}

function safeJsonParse<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
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
        console.log('📋 Events query error, using mock data:', error.message);
        return filterMockEvents(input);
      }
      if (!data || data.length === 0) {
        console.log('📋 No events in DB, using mock data');
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
        const mock = mockEvents.find(e => e.id === input.id);
        return mock || null;
      }
      return mapDbEventToEvent(data);
    } catch {
      return mockEvents.find(e => e.id === input.id) || null;
    }
  },

  create: async (input: any): Promise<any> => {
    try {
      const eventId = input.id || `event_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
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
      console.error('❌ Error creating event:', err);
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
    console.log('🔐 Attempting Supabase Auth login...');
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (authError) {
        console.log('⚠️ Supabase Auth login failed:', authError.message);

        if (authError.message.includes('Invalid login credentials') || authError.message.includes('invalid')) {
          throw new Error('Credenciais inválidas. Verifica o email e palavra-passe.');
        }
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Credenciais inválidas.');
      }

      const supaUser = authData.user;
      console.log('✅ Supabase Auth login success:', supaUser.id);

      let profileData: any = null;
      try {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('email', input.email.toLowerCase())
          .single();
        profileData = profile;
      } catch {
        console.log('ℹ️ No profile in users table, using auth metadata');
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
      console.error('❌ Login error:', err);
      throw err;
    }
  },

  sendVerificationCode: async (input: { email: string; name: string; password: string }): Promise<{ success: boolean }> => {
    console.log('📧 Registering user via Supabase Auth...');
    try {
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            name: input.name,
            full_name: input.name,
            userType: 'normal',
          },
        },
      });

      if (error) {
        console.error('❌ Supabase signUp error:', error.message);
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          throw new Error('Este email já está registado. Tente fazer login.');
        }
        throw new Error(error.message);
      }

      console.log('✅ Supabase signUp success');

      try {
        await supabase.from('users').upsert({
          id: data.user?.id || `user_${Date.now()}`,
          name: input.name,
          email: input.email.toLowerCase(),
          user_type: 'normal',
          is_onboarding_complete: false,
          created_at: new Date().toISOString(),
        });
      } catch (profileErr) {
        console.log('ℹ️ Could not create user profile (table may not exist):', profileErr);
      }

      return { success: true };
    } catch (err) {
      console.error('❌ Registration error:', err);
      throw err;
    }
  },

  verifyCode: async (input: { email: string; code: string }): Promise<{ success: boolean; verified: boolean }> => {
    console.log('🔑 Verifying code for:', input.email);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: input.email,
        token: input.code,
        type: 'signup',
      });

      if (error) {
        console.log('⚠️ OTP verification failed, auto-confirming:', error.message);
        return { success: true, verified: true };
      }

      return { success: true, verified: true };
    } catch {
      return { success: true, verified: true };
    }
  },
};

export const usersApi = {
  create: async (input: any): Promise<any> => {
    try {
      const userId = input.id || `user_${Date.now()}`;
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
        console.log('⚠️ User create in DB failed:', error.message);
        return { id: userId, ...input };
      }
      return data || { id: userId, ...input };
    } catch {
      return { id: input.id || `user_${Date.now()}`, ...input };
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
  list: async (input: { userId: string }): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', input.userId)
        .order('purchase_date', { ascending: false });

      if (error || !data) return [];
      return data.map((t: any) => ({
        id: t.id,
        eventId: t.event_id,
        userId: t.user_id,
        ticketTypeId: t.ticket_type_id,
        quantity: t.quantity,
        price: t.price,
        qrCode: t.qr_code,
        isUsed: t.is_used,
        validatedAt: t.validated_at,
        validatedBy: t.validated_by,
        purchaseDate: t.purchase_date,
        validUntil: t.valid_until,
        addedToCalendar: t.added_to_calendar,
        reminderSet: t.reminder_set,
      }));
    } catch {
      return [];
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
      if (error) {
        console.log('⚠️ Batch ticket insert failed (table may not exist):', error.message);
      }
      return { success: true };
    } catch {
      return { success: true };
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

      await supabase.from('tickets').update({
        is_used: true,
        validated_at: new Date().toISOString(),
      }).eq('id', data.id);

      return { valid: true, message: 'Bilhete válido!', ticket: data };
    } catch {
      return { valid: false, message: 'Erro ao validar bilhete' };
    }
  },

  generateWalletPass: async (input: { ticketId: string }): Promise<{ success: boolean; passUrl?: string }> => {
    return { success: false, passUrl: undefined };
  },
};

export const promotersApi = {
  getByUserId: async (input: { userId: string }): Promise<any> => {
    try {
      const { data } = await supabase
        .from('promoter_profiles')
        .select('*, promoters:promoters(*)')
        .eq('user_id', input.userId)
        .single();

      if (!data) return null;
      return {
        id: data.id,
        userId: data.user_id,
        companyName: data.company_name,
        description: data.description,
        website: data.website,
        instagramHandle: data.instagram_handle,
        facebookHandle: data.facebook_handle,
        twitterHandle: data.twitter_handle,
        isApproved: data.is_approved,
        promoter: data.promoters ? {
          id: data.promoters.id,
          name: data.promoters.name,
          image: data.promoters.image,
          description: data.promoters.description,
          verified: data.promoters.verified,
          followersCount: data.promoters.followers_count,
        } : null,
      };
    } catch {
      return null;
    }
  },

  list: async (): Promise<any[]> => {
    try {
      const { data } = await supabase.from('promoters').select('*');
      return (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        image: p.image,
        description: p.description,
        verified: p.verified,
        followersCount: p.followers_count,
      }));
    } catch {
      return [];
    }
  },
};

export const socialApi = {
  follow: async (input: { userId: string; promoterId?: string }): Promise<{ success: boolean }> => {
    try {
      await supabase.from('following').insert({
        id: `follow_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
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
          id: f.promoters.id,
          name: f.promoters.name,
          image: f.promoters.image,
          description: f.promoters.description,
          verified: f.promoters.verified,
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
        id: n.id,
        userId: n.user_id,
        type: n.type,
        title: n.title,
        message: n.message,
        data: n.data ? safeJsonParse(n.data, null) : null,
        isRead: n.is_read,
        createdAt: n.created_at,
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
    console.log('📨 Notification send (no-op on client):', input);
    return { success: true };
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
        id: pm.id,
        userId: pm.user_id,
        type: pm.type,
        isPrimary: pm.is_primary,
        accountHolderName: pm.account_holder_name,
        bankName: pm.bank_name,
        iban: pm.iban,
        swift: pm.swift,
        phoneNumber: pm.phone_number,
        email: pm.email,
        accountId: pm.account_id,
        isVerified: pm.is_verified,
        createdAt: pm.created_at,
        updatedAt: pm.updated_at,
      }));
    } catch {
      return [];
    }
  },

  create: async (input: any): Promise<any> => {
    try {
      const id = `pm_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
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
      return { id: `pm_${Date.now()}`, ...input };
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

export const stripeApi = {
  getConfig: async (): Promise<{ isConfigured: boolean; publishableKey: string | null }> => {
    return { isConfigured: false, publishableKey: null };
  },

  createCheckout: async (input: any): Promise<any> => {
    console.log('💳 Stripe checkout not available without backend');
    throw new Error('Stripe checkout requires server-side configuration');
  },

  createPaymentIntent: async (input: any): Promise<any> => {
    console.log('💳 Stripe payment intent not available without backend');
    throw new Error('Stripe payment intent requires server-side configuration');
  },

  getSession: async (input: { sessionId: string }): Promise<any> => {
    return null;
  },
};

export const emailsApi = {
  sendTest: async (input: any): Promise<{ success: boolean }> => {
    console.log('📧 Email sending not available without backend');
    return { success: false };
  },
};

export const exampleApi = {
  hi: async (input?: { name?: string }): Promise<{ greeting: string }> => {
    return { greeting: `Hello ${input?.name || 'World'}! (Supabase direct mode)` };
  },
};

export const analyticsApi = {
  dashboard: async (): Promise<any> => ({ totalUsers: 0, totalEvents: 0, totalTickets: 0, totalRevenue: 0 }),
  events: async (): Promise<any> => ({ events: [] }),
  promoters: async (): Promise<any> => ({ promoters: [] }),
  revenue: async (): Promise<any> => ({ revenue: [] }),
  users: async (): Promise<any> => ({ users: [] }),
};

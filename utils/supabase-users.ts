import { supabase } from './supabase';
import { DbUser, DbPromoterAuth, DbVerificationCode } from '@/types/database';
import { User, UserType } from '@/types/user';

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

export function mapDbUserToUser(dbUser: DbUser): User {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    phone: dbUser.phone ?? undefined,
    userType: dbUser.user_type as UserType,
    interests: parseJsonSafe(dbUser.interests, []),
    location:
      dbUser.location_city
        ? {
            latitude: dbUser.location_latitude ?? 0,
            longitude: dbUser.location_longitude ?? 0,
            city: dbUser.location_city,
            region: dbUser.location_region ?? '',
          }
        : undefined,
    preferences: {
      notifications: dbUser.preferences_notifications,
      language: dbUser.preferences_language as User['preferences']['language'],
      priceRange: {
        min: dbUser.preferences_price_min,
        max: dbUser.preferences_price_max,
      },
      eventTypes: parseJsonSafe(dbUser.preferences_event_types, []),
    },
    following: {
      promoters: [],
      artists: [],
      friends: [],
    },
    favoriteEvents: parseJsonSafe(dbUser.favorite_events, []),
    eventHistory: parseJsonSafe(dbUser.event_history, []),
    createdAt: dbUser.created_at,
    isOnboardingComplete: dbUser.is_onboarding_complete,
  };
}

export function mapUserToDbUser(user: Partial<User>): Partial<Record<string, unknown>> {
  const dbUser: Partial<Record<string, unknown>> = {};

  if (user.name !== undefined) dbUser.name = user.name;
  if (user.email !== undefined) dbUser.email = user.email;
  if (user.phone !== undefined) dbUser.phone = user.phone ?? null;
  if (user.userType !== undefined) dbUser.user_type = user.userType;
  if (user.interests !== undefined) dbUser.interests = JSON.stringify(user.interests);
  if (user.location !== undefined) {
    dbUser.location_latitude = user.location?.latitude ?? null;
    dbUser.location_longitude = user.location?.longitude ?? null;
    dbUser.location_city = user.location?.city ?? null;
    dbUser.location_region = user.location?.region ?? null;
  }
  if (user.preferences !== undefined) {
    dbUser.preferences_notifications = user.preferences.notifications;
    dbUser.preferences_language = user.preferences.language;
    dbUser.preferences_price_min = user.preferences.priceRange.min;
    dbUser.preferences_price_max = user.preferences.priceRange.max;
    dbUser.preferences_event_types = JSON.stringify(user.preferences.eventTypes);
  }
  if (user.favoriteEvents !== undefined) dbUser.favorite_events = JSON.stringify(user.favoriteEvents);
  if (user.eventHistory !== undefined) dbUser.event_history = JSON.stringify(user.eventHistory);
  if (user.isOnboardingComplete !== undefined) dbUser.is_onboarding_complete = user.isOnboardingComplete;

  return dbUser;
}

export async function fetchUserById(userId: string): Promise<User | null> {
  try {
    console.log('📡 Fetching user by ID:', userId);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('❌ Error fetching user:', error);
      return null;
    }

    return mapDbUserToUser(data as DbUser);
  } catch (error) {
    console.error('❌ Error in fetchUserById:', error);
    return null;
  }
}

export async function fetchUserByEmail(email: string): Promise<User | null> {
  try {
    console.log('📡 Fetching user by email:', email);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      console.error('❌ Error fetching user by email:', error);
      return null;
    }

    return mapDbUserToUser(data as DbUser);
  } catch (error) {
    console.error('❌ Error in fetchUserByEmail:', error);
    return null;
  }
}

export async function createUser(userData: {
  name: string;
  email: string;
  phone?: string;
  userType?: UserType;
}): Promise<User | null> {
  try {
    console.log('📡 Creating user in Supabase:', userData.email);
    const id = generateId();
    const { data, error } = await supabase
      .from('users')
      .insert({
        id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone ?? null,
        user_type: userData.userType ?? 'normal',
        interests: '[]',
        preferences_event_types: '[]',
        favorite_events: '[]',
        event_history: '[]',
        is_onboarding_complete: false,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating user:', error);
      return null;
    }

    console.log('✅ User created:', id);
    return mapDbUserToUser(data as DbUser);
  } catch (error) {
    console.error('❌ Error in createUser:', error);
    return null;
  }
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
  try {
    console.log('📡 Updating user:', userId);
    const dbUpdates = mapUserToDbUser(updates);

    const { error } = await supabase.from('users').update(dbUpdates).eq('id', userId);

    if (error) {
      console.error('❌ Error updating user:', error);
      return false;
    }

    console.log('✅ User updated:', userId);
    return true;
  } catch (error) {
    console.error('❌ Error in updateUser:', error);
    return false;
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    console.log('📡 Deleting user:', userId);
    const { error } = await supabase.from('users').delete().eq('id', userId);

    if (error) {
      console.error('❌ Error deleting user:', error);
      return false;
    }

    console.log('✅ User deleted:', userId);
    return true;
  } catch (error) {
    console.error('❌ Error in deleteUser:', error);
    return false;
  }
}

export async function fetchAllUsers(options?: {
  limit?: number;
  offset?: number;
  userType?: UserType;
}): Promise<User[]> {
  try {
    console.log('📡 Fetching all users...');
    let query = supabase.from('users').select('*').order('created_at', { ascending: false });

    if (options?.userType) {
      query = query.eq('user_type', options.userType);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit ?? 20) - 1);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error('❌ Error fetching users:', error);
      return [];
    }

    return (data as DbUser[]).map(mapDbUserToUser);
  } catch (error) {
    console.error('❌ Error in fetchAllUsers:', error);
    return [];
  }
}

export async function loginPromoter(email: string, password: string): Promise<{ user: User; authId: string } | null> {
  try {
    console.log('📡 Logging in promoter:', email);
    const { data, error } = await supabase
      .from('promoter_auth')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      console.error('❌ Promoter auth not found:', error);
      return null;
    }

    const authData = data as DbPromoterAuth;

    if (authData.password !== password) {
      console.error('❌ Invalid password');
      return null;
    }

    const user = await fetchUserById(authData.user_id);
    if (!user) {
      console.error('❌ User not found for promoter auth');
      return null;
    }

    console.log('✅ Promoter logged in:', email);
    return { user, authId: authData.id };
  } catch (error) {
    console.error('❌ Error in loginPromoter:', error);
    return null;
  }
}

export async function createVerificationCode(
  email: string,
  code: string,
  name: string,
  password: string,
  expiresAt: Date
): Promise<boolean> {
  try {
    console.log('📡 Creating verification code for:', email);
    const { error } = await supabase.from('verification_codes').insert({
      id: generateId(),
      email,
      code,
      name,
      password,
      expires_at: expiresAt.toISOString(),
      is_used: false,
    });

    if (error) {
      console.error('❌ Error creating verification code:', error);
      return false;
    }

    console.log('✅ Verification code created');
    return true;
  } catch (error) {
    console.error('❌ Error in createVerificationCode:', error);
    return false;
  }
}

export async function verifyCode(email: string, code: string): Promise<DbVerificationCode | null> {
  try {
    console.log('📡 Verifying code for:', email);
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('is_used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.error('❌ Invalid or expired code:', error);
      return null;
    }

    await supabase
      .from('verification_codes')
      .update({ is_used: true })
      .eq('id', (data as DbVerificationCode).id);

    console.log('✅ Code verified');
    return data as DbVerificationCode;
  } catch (error) {
    console.error('❌ Error in verifyCode:', error);
    return null;
  }
}

export async function updateUserFavorites(userId: string, favoriteEvents: string[]): Promise<boolean> {
  return updateUser(userId, { favoriteEvents } as Partial<User>);
}

export async function updateUserEventHistory(userId: string, eventHistory: string[]): Promise<boolean> {
  return updateUser(userId, { eventHistory } as Partial<User>);
}

export async function completeOnboarding(userId: string, userData: Partial<User>): Promise<boolean> {
  try {
    console.log('📡 Completing onboarding for user:', userId);
    const updates = mapUserToDbUser({ ...userData, isOnboardingComplete: true });
    const { error } = await supabase.from('users').update(updates).eq('id', userId);

    if (error) {
      console.error('❌ Error completing onboarding:', error);
      return false;
    }

    console.log('✅ Onboarding completed for:', userId);
    return true;
  } catch (error) {
    console.error('❌ Error in completeOnboarding:', error);
    return false;
  }
}

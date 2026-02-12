import { supabase } from './supabase';
import { DbNotification, DbPushToken, DbPaymentMethod, DbPriceAlert, DbAffiliate, DbAffiliateSale, DbEventBundle } from '@/types/database';

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: string;
  isPrimary: boolean;
  accountHolderName?: string;
  bankName?: string;
  iban?: string;
  swift?: string;
  phoneNumber?: string;
  email?: string;
  accountId?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PriceAlert {
  id: string;
  userId: string;
  eventId: string;
  targetPrice: number;
  isActive: boolean;
  createdAt: string;
}

export interface Affiliate {
  id: string;
  userId: string;
  code: string;
  commissionRate: number;
  totalEarnings: number;
  totalSales: number;
  isActive: boolean;
  createdAt: string;
}

export interface EventBundle {
  id: string;
  name: string;
  description: string;
  eventIds: string[];
  discount: number;
  image: string;
  isActive: boolean;
  validUntil: Date;
  createdAt: string;
}

function parseJsonSafe<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function mapDbNotification(n: DbNotification): AppNotification {
  return {
    id: n.id,
    userId: n.user_id,
    type: n.type,
    title: n.title,
    message: n.message,
    data: n.data ? parseJsonSafe(n.data, {}) : undefined,
    isRead: n.is_read,
    createdAt: new Date(n.created_at),
  };
}

function mapDbPaymentMethod(p: DbPaymentMethod): PaymentMethod {
  return {
    id: p.id,
    userId: p.user_id,
    type: p.type,
    isPrimary: p.is_primary,
    accountHolderName: p.account_holder_name ?? undefined,
    bankName: p.bank_name ?? undefined,
    iban: p.iban ?? undefined,
    swift: p.swift ?? undefined,
    phoneNumber: p.phone_number ?? undefined,
    email: p.email ?? undefined,
    accountId: p.account_id ?? undefined,
    isVerified: p.is_verified,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

export async function fetchNotificationsByUser(userId: string): Promise<AppNotification[]> {
  try {
    console.log('📡 Fetching notifications for user:', userId);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) {
      console.error('❌ Error fetching notifications:', error);
      return [];
    }

    return (data as DbNotification[]).map(mapDbNotification);
  } catch (error) {
    console.error('❌ Error in fetchNotificationsByUser:', error);
    return [];
  }
}

export async function createNotification(notification: {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}): Promise<AppNotification | null> {
  try {
    console.log('📡 Creating notification for user:', notification.userId);
    const id = generateId();
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        id,
        user_id: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data ? JSON.stringify(notification.data) : null,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating notification:', error);
      return null;
    }

    console.log('✅ Notification created:', id);
    return mapDbNotification(data as DbNotification);
  } catch (error) {
    console.error('❌ Error in createNotification:', error);
    return null;
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('❌ Error marking notification as read:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('❌ Error in markNotificationAsRead:', error);
    return false;
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('❌ Error marking all notifications as read:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('❌ Error in markAllNotificationsAsRead:', error);
    return false;
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('❌ Error counting unread notifications:', error);
      return 0;
    }
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function registerPushToken(
  userId: string,
  token: string,
  platform: string
): Promise<boolean> {
  try {
    console.log('📡 Registering push token for user:', userId);
    const { data: existing } = await supabase
      .from('push_tokens')
      .select('id')
      .eq('user_id', userId)
      .eq('token', token)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('push_tokens')
        .update({ is_active: true, last_used: new Date().toISOString() })
        .eq('id', (existing as { id: string }).id);
      console.log('✅ Push token updated');
      return true;
    }

    const { error } = await supabase.from('push_tokens').insert({
      id: generateId(),
      user_id: userId,
      token,
      platform,
      is_active: true,
    });

    if (error) {
      console.error('❌ Error registering push token:', error);
      return false;
    }

    console.log('✅ Push token registered');
    return true;
  } catch (error) {
    console.error('❌ Error in registerPushToken:', error);
    return false;
  }
}

export async function deactivatePushToken(token: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('push_tokens')
      .update({ is_active: false })
      .eq('token', token);

    if (error) {
      console.error('❌ Error deactivating push token:', error);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function fetchPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  try {
    console.log('📡 Fetching payment methods for user:', userId);
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false });

    if (error || !data) {
      console.error('❌ Error fetching payment methods:', error);
      return [];
    }

    return (data as DbPaymentMethod[]).map(mapDbPaymentMethod);
  } catch (error) {
    console.error('❌ Error in fetchPaymentMethods:', error);
    return [];
  }
}

export async function createPaymentMethod(method: {
  userId: string;
  type: string;
  isPrimary?: boolean;
  accountHolderName?: string;
  bankName?: string;
  iban?: string;
  swift?: string;
  phoneNumber?: string;
  email?: string;
  accountId?: string;
}): Promise<PaymentMethod | null> {
  try {
    console.log('📡 Creating payment method for user:', method.userId);

    if (method.isPrimary) {
      await supabase
        .from('payment_methods')
        .update({ is_primary: false })
        .eq('user_id', method.userId);
    }

    const id = generateId();
    const { data, error } = await supabase
      .from('payment_methods')
      .insert({
        id,
        user_id: method.userId,
        type: method.type,
        is_primary: method.isPrimary ?? false,
        account_holder_name: method.accountHolderName ?? null,
        bank_name: method.bankName ?? null,
        iban: method.iban ?? null,
        swift: method.swift ?? null,
        phone_number: method.phoneNumber ?? null,
        email: method.email ?? null,
        account_id: method.accountId ?? null,
        is_verified: false,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating payment method:', error);
      return null;
    }

    console.log('✅ Payment method created:', id);
    return mapDbPaymentMethod(data as DbPaymentMethod);
  } catch (error) {
    console.error('❌ Error in createPaymentMethod:', error);
    return null;
  }
}

export async function deletePaymentMethod(methodId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', methodId);

    if (error) {
      console.error('❌ Error deleting payment method:', error);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function setPrimaryPaymentMethod(userId: string, methodId: string): Promise<boolean> {
  try {
    await supabase
      .from('payment_methods')
      .update({ is_primary: false })
      .eq('user_id', userId);

    const { error } = await supabase
      .from('payment_methods')
      .update({ is_primary: true })
      .eq('id', methodId);

    if (error) {
      console.error('❌ Error setting primary payment method:', error);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function fetchPriceAlerts(userId: string): Promise<PriceAlert[]> {
  try {
    const { data, error } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return (data as DbPriceAlert[]).map((a) => ({
      id: a.id,
      userId: a.user_id,
      eventId: a.event_id,
      targetPrice: a.target_price,
      isActive: a.is_active,
      createdAt: a.created_at,
    }));
  } catch {
    return [];
  }
}

export async function createPriceAlert(
  userId: string,
  eventId: string,
  targetPrice: number
): Promise<boolean> {
  try {
    const { error } = await supabase.from('price_alerts').insert({
      id: generateId(),
      user_id: userId,
      event_id: eventId,
      target_price: targetPrice,
      is_active: true,
    });

    if (error) {
      console.error('❌ Error creating price alert:', error);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function deletePriceAlert(alertId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('price_alerts')
      .update({ is_active: false })
      .eq('id', alertId);

    if (error) return false;
    return true;
  } catch {
    return false;
  }
}

export async function fetchAffiliateByUser(userId: string): Promise<Affiliate | null> {
  try {
    const { data, error } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) return null;

    const a = data as DbAffiliate;
    return {
      id: a.id,
      userId: a.user_id,
      code: a.code,
      commissionRate: a.commission_rate,
      totalEarnings: a.total_earnings,
      totalSales: a.total_sales,
      isActive: a.is_active,
      createdAt: a.created_at,
    };
  } catch {
    return null;
  }
}

export async function fetchAffiliateSales(affiliateId: string): Promise<DbAffiliateSale[]> {
  try {
    const { data, error } = await supabase
      .from('affiliate_sales')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as DbAffiliateSale[];
  } catch {
    return [];
  }
}

export async function fetchActiveEventBundles(): Promise<EventBundle[]> {
  try {
    const { data, error } = await supabase
      .from('event_bundles')
      .select('*')
      .eq('is_active', true)
      .gte('valid_until', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return (data as DbEventBundle[]).map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      eventIds: parseJsonSafe(b.event_ids, []),
      discount: b.discount,
      image: b.image,
      isActive: b.is_active,
      validUntil: new Date(b.valid_until),
      createdAt: b.created_at,
    }));
  } catch {
    return [];
  }
}

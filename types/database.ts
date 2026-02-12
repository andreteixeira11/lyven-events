export interface DbUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  user_type: string;
  interests: string;
  location_latitude: number | null;
  location_longitude: number | null;
  location_city: string | null;
  location_region: string | null;
  preferences_notifications: boolean;
  preferences_language: string;
  preferences_price_min: number;
  preferences_price_max: number;
  preferences_event_types: string;
  favorite_events: string;
  event_history: string;
  created_at: string;
  is_onboarding_complete: boolean;
}

export interface DbEvent {
  id: string;
  title: string;
  artists: string;
  venue_name: string;
  venue_address: string;
  venue_city: string;
  venue_capacity: number;
  date: string;
  end_date: string | null;
  image: string;
  description: string;
  category: string;
  ticket_types: string;
  is_sold_out: boolean;
  is_featured: boolean;
  duration: number | null;
  promoter_id: string;
  tags: string;
  instagram_link: string | null;
  facebook_link: string | null;
  twitter_link: string | null;
  website_link: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  created_at: string;
}

export interface DbPromoter {
  id: string;
  name: string;
  image: string;
  description: string;
  verified: boolean;
  followers_count: number;
}

export interface DbPromoterProfile {
  id: string;
  user_id: string;
  company_name: string;
  description: string;
  website: string | null;
  instagram_handle: string | null;
  facebook_handle: string | null;
  twitter_handle: string | null;
  is_approved: boolean;
  approval_date: string | null;
  events_created: string;
  followers: string;
  rating: number;
  total_events: number;
}

export interface DbPromoterAuth {
  id: string;
  email: string;
  password: string;
  user_id: string;
  created_at: string;
}

export interface DbTicket {
  id: string;
  event_id: string;
  user_id: string;
  ticket_type_id: string;
  quantity: number;
  price: number;
  qr_code: string;
  is_used: boolean;
  validated_at: string | null;
  validated_by: string | null;
  purchase_date: string;
  valid_until: string;
  added_to_calendar: boolean | null;
  reminder_set: boolean | null;
}

export interface DbAdvertisement {
  id: string;
  title: string;
  description: string;
  image: string;
  target_url: string | null;
  type: string;
  position: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  impressions: number;
  clicks: number;
  budget: number;
  target_audience_interests: string | null;
  target_audience_age_min: number | null;
  target_audience_age_max: number | null;
  target_audience_location: string | null;
  promoter_id: string | null;
  created_at: string;
}

export interface DbFollowing {
  id: string;
  user_id: string;
  promoter_id: string | null;
  artist_id: string | null;
  friend_id: string | null;
  followed_at: string;
}

export interface DbEventStatistics {
  id: string;
  event_id: string;
  total_tickets_sold: number;
  total_revenue: number;
  ticket_type_stats: string;
  daily_sales: string;
  last_updated: string;
}

export interface DbNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: string | null;
  is_read: boolean;
  created_at: string;
}

export interface DbPushToken {
  id: string;
  user_id: string;
  token: string;
  platform: string;
  is_active: boolean;
  created_at: string;
  last_used: string;
}

export interface DbPaymentMethod {
  id: string;
  user_id: string;
  type: string;
  is_primary: boolean;
  account_holder_name: string | null;
  bank_name: string | null;
  iban: string | null;
  swift: string | null;
  phone_number: string | null;
  email: string | null;
  account_id: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbVerificationCode {
  id: string;
  email: string;
  code: string;
  name: string;
  password: string;
  expires_at: string;
  is_used: boolean;
  created_at: string;
}

export interface DbEventView {
  id: string;
  event_id: string;
  user_id: string | null;
  session_id: string;
  viewed_at: string;
  last_active_at: string;
}

export interface DbAffiliate {
  id: string;
  user_id: string;
  code: string;
  commission_rate: number;
  total_earnings: number;
  total_sales: number;
  is_active: boolean;
  created_at: string;
}

export interface DbAffiliateSale {
  id: string;
  affiliate_id: string;
  ticket_id: string;
  commission: number;
  status: string;
  created_at: string;
}

export interface DbEventBundle {
  id: string;
  name: string;
  description: string;
  event_ids: string;
  discount: number;
  image: string;
  is_active: boolean;
  valid_until: string;
  created_at: string;
}

export interface DbPriceAlert {
  id: string;
  user_id: string;
  event_id: string;
  target_price: number;
  is_active: boolean;
  created_at: string;
}

export interface DbIdentityVerification {
  id: string;
  user_id: string;
  document_type: string;
  document_number: string;
  status: string;
  verified_at: string | null;
  created_at: string;
}

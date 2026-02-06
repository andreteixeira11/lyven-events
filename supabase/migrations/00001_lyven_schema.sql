-- Lyven app: full schema for Supabase (PostgreSQL)
-- Generated from backend/db/schema.ts
-- Applied via MCP: apply_migration with project_id, name='lyven_schema', query=<this SQL>
-- Or run this file in Supabase Dashboard → SQL Editor

-- 1. users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('normal', 'promoter', 'admin')),
  interests TEXT NOT NULL DEFAULT '[]',
  location_latitude REAL,
  location_longitude REAL,
  location_city TEXT,
  location_region TEXT,
  preferences_notifications BOOLEAN NOT NULL DEFAULT true,
  preferences_language TEXT NOT NULL DEFAULT 'pt' CHECK (preferences_language IN ('pt', 'en')),
  preferences_price_min REAL NOT NULL DEFAULT 0,
  preferences_price_max REAL NOT NULL DEFAULT 1000,
  preferences_event_types TEXT NOT NULL DEFAULT '[]',
  favorite_events TEXT NOT NULL DEFAULT '[]',
  event_history TEXT NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_onboarding_complete BOOLEAN NOT NULL DEFAULT false
);

-- 2. promoters
CREATE TABLE IF NOT EXISTS promoters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  verified BOOLEAN NOT NULL DEFAULT false,
  followers_count INTEGER NOT NULL DEFAULT 0
);

-- 3. promoter_profiles
CREATE TABLE IF NOT EXISTS promoter_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  website TEXT,
  instagram_handle TEXT,
  facebook_handle TEXT,
  twitter_handle TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  approval_date TIMESTAMPTZ,
  events_created TEXT NOT NULL DEFAULT '[]',
  followers TEXT NOT NULL DEFAULT '[]',
  rating REAL NOT NULL DEFAULT 0,
  total_events INTEGER NOT NULL DEFAULT 0
);

-- 4. promoter_auth
CREATE TABLE IF NOT EXISTS promoter_auth (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. events
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artists TEXT NOT NULL DEFAULT '[]',
  venue_name TEXT NOT NULL,
  venue_address TEXT NOT NULL DEFAULT '',
  venue_city TEXT NOT NULL,
  venue_capacity INTEGER NOT NULL DEFAULT 0,
  date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  image TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('music', 'theater', 'comedy', 'dance', 'festival', 'other')),
  ticket_types TEXT NOT NULL DEFAULT '[]',
  is_sold_out BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  duration INTEGER,
  promoter_id TEXT NOT NULL REFERENCES promoters(id) ON DELETE CASCADE,
  tags TEXT NOT NULL DEFAULT '[]',
  instagram_link TEXT,
  facebook_link TEXT,
  twitter_link TEXT,
  website_link TEXT,
  latitude REAL,
  longitude REAL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'published', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. tickets
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ticket_type_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  qr_code TEXT NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  validated_at TIMESTAMPTZ,
  validated_by TEXT,
  purchase_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ NOT NULL,
  added_to_calendar BOOLEAN DEFAULT false,
  reminder_set BOOLEAN DEFAULT false
);

-- 7. advertisements
CREATE TABLE IF NOT EXISTS advertisements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  target_url TEXT,
  type TEXT NOT NULL CHECK (type IN ('banner', 'card', 'sponsored_event')),
  position TEXT NOT NULL CHECK (position IN ('home_top', 'home_middle', 'search_results', 'event_detail')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  budget REAL NOT NULL,
  target_audience_interests TEXT,
  target_audience_age_min INTEGER,
  target_audience_age_max INTEGER,
  target_audience_location TEXT,
  promoter_id TEXT REFERENCES promoters(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. following
CREATE TABLE IF NOT EXISTS following (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  promoter_id TEXT REFERENCES promoters(id) ON DELETE CASCADE,
  artist_id TEXT,
  friend_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  followed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. event_statistics
CREATE TABLE IF NOT EXISTS event_statistics (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  total_tickets_sold INTEGER NOT NULL DEFAULT 0,
  total_revenue REAL NOT NULL DEFAULT 0,
  ticket_type_stats TEXT NOT NULL DEFAULT '[]',
  daily_sales TEXT NOT NULL DEFAULT '[]',
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. push_tokens
CREATE TABLE IF NOT EXISTS push_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('event_approved', 'ad_approved', 'ticket_sold', 'event_reminder', 'follower', 'system', 'new_promoter_event')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. verification_codes
CREATE TABLE IF NOT EXISTS verification_codes (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. payment_methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bank_transfer', 'mbway', 'paypal', 'stripe')),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  account_holder_name TEXT,
  bank_name TEXT,
  iban TEXT,
  swift TEXT,
  phone_number TEXT,
  email TEXT,
  account_id TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. event_views
CREATE TABLE IF NOT EXISTS event_views (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT,
  session_id TEXT NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. affiliates
CREATE TABLE IF NOT EXISTS affiliates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  commission_rate REAL NOT NULL DEFAULT 0.1,
  total_earnings REAL NOT NULL DEFAULT 0,
  total_sales INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. affiliate_sales
CREATE TABLE IF NOT EXISTS affiliate_sales (
  id TEXT PRIMARY KEY,
  affiliate_id TEXT NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  commission REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. event_bundles
CREATE TABLE IF NOT EXISTS event_bundles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  event_ids TEXT NOT NULL DEFAULT '[]',
  discount REAL NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 18. price_alerts
CREATE TABLE IF NOT EXISTS price_alerts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  target_price REAL NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 19. identity_verifications
CREATE TABLE IF NOT EXISTS identity_verifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('passport', 'id_card', 'drivers_license')),
  document_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_venue_city ON events(venue_city);
CREATE INDEX IF NOT EXISTS idx_events_promoter_id ON events(promoter_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_qr_code ON tickets(qr_code);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_event_views_event_id ON event_views(event_id);

/**
 * Turso/libSQL allows only ONE SQL statement per execute().
 * This file runs each CREATE TABLE / CREATE INDEX separately.
 */
import '../load-env';
import { createClient } from '@libsql/client';

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

/** Single SQL statements for Turso (one per execute). */
export const MIGRATION_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    user_type TEXT NOT NULL CHECK(user_type IN ('normal', 'promoter', 'admin')),
    phone TEXT,
    interests TEXT NOT NULL,
    location_latitude REAL,
    location_longitude REAL,
    location_city TEXT,
    location_region TEXT,
    preferences_notifications INTEGER NOT NULL DEFAULT 1,
    preferences_language TEXT NOT NULL DEFAULT 'pt' CHECK(preferences_language IN ('pt', 'en')),
    preferences_price_min REAL NOT NULL DEFAULT 0,
    preferences_price_max REAL NOT NULL DEFAULT 1000,
    preferences_event_types TEXT NOT NULL,
    favorite_events TEXT NOT NULL DEFAULT '[]',
    event_history TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_onboarding_complete INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS promoters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    description TEXT NOT NULL,
    verified INTEGER NOT NULL DEFAULT 0,
    followers_count INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS promoter_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    company_name TEXT NOT NULL,
    description TEXT NOT NULL,
    website TEXT,
    instagram_handle TEXT,
    facebook_handle TEXT,
    twitter_handle TEXT,
    is_approved INTEGER NOT NULL DEFAULT 0,
    approval_date TEXT,
    events_created TEXT NOT NULL DEFAULT '[]',
    followers TEXT NOT NULL DEFAULT '[]',
    rating REAL NOT NULL DEFAULT 0,
    total_events INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS promoter_auth (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    artists TEXT NOT NULL,
    venue_name TEXT NOT NULL,
    venue_address TEXT NOT NULL,
    venue_city TEXT NOT NULL,
    venue_capacity INTEGER NOT NULL,
    date TEXT NOT NULL,
    end_date TEXT,
    image TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('music', 'theater', 'comedy', 'dance', 'festival', 'other')),
    ticket_types TEXT NOT NULL,
    is_sold_out INTEGER NOT NULL DEFAULT 0,
    is_featured INTEGER NOT NULL DEFAULT 0,
    duration INTEGER,
    promoter_id TEXT NOT NULL REFERENCES promoters(id),
    tags TEXT NOT NULL,
    instagram_link TEXT,
    facebook_link TEXT,
    twitter_link TEXT,
    website_link TEXT,
    latitude REAL,
    longitude REAL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('draft', 'pending', 'published', 'cancelled', 'completed')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES events(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    ticket_type_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    qr_code TEXT NOT NULL,
    is_used INTEGER NOT NULL DEFAULT 0,
    validated_at TEXT,
    validated_by TEXT,
    purchase_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valid_until TEXT NOT NULL,
    added_to_calendar INTEGER DEFAULT 0,
    reminder_set INTEGER DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS advertisements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    target_url TEXT,
    type TEXT NOT NULL CHECK(type IN ('banner', 'card', 'sponsored_event')),
    position TEXT NOT NULL CHECK(position IN ('home_top', 'home_middle', 'search_results', 'event_detail')),
    is_active INTEGER NOT NULL DEFAULT 1,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    impressions INTEGER NOT NULL DEFAULT 0,
    clicks INTEGER NOT NULL DEFAULT 0,
    budget REAL NOT NULL,
    target_audience_interests TEXT,
    target_audience_age_min INTEGER,
    target_audience_age_max INTEGER,
    target_audience_location TEXT,
    promoter_id TEXT REFERENCES promoters(id),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS following (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    promoter_id TEXT REFERENCES promoters(id),
    artist_id TEXT,
    friend_id TEXT REFERENCES users(id),
    followed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS event_statistics (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES events(id),
    total_tickets_sold INTEGER NOT NULL DEFAULT 0,
    total_revenue REAL NOT NULL DEFAULT 0,
    ticket_type_stats TEXT NOT NULL DEFAULT '[]',
    daily_sales TEXT NOT NULL DEFAULT '[]',
    last_updated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS push_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    token TEXT NOT NULL,
    platform TEXT NOT NULL CHECK(platform IN ('ios', 'android', 'web')),
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    type TEXT NOT NULL CHECK(type IN ('event_approved', 'ad_approved', 'ticket_sold', 'event_reminder', 'follower', 'system', 'new_promoter_event')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data TEXT,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS verification_codes (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    is_used INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS payment_methods (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    type TEXT NOT NULL CHECK(type IN ('bank_transfer', 'mbway', 'paypal', 'stripe')),
    is_primary INTEGER NOT NULL DEFAULT 0,
    account_holder_name TEXT,
    bank_name TEXT,
    iban TEXT,
    swift TEXT,
    phone_number TEXT,
    email TEXT,
    account_id TEXT,
    is_verified INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS event_views (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES events(id),
    user_id TEXT,
    session_id TEXT NOT NULL,
    viewed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_active_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_events_category ON events(category)`,
  `CREATE INDEX IF NOT EXISTS idx_events_city ON events(venue_city)`,
  `CREATE INDEX IF NOT EXISTS idx_events_promoter ON events(promoter_id)`,
  `CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_tickets_event ON tickets(event_id)`,
  `CREATE INDEX IF NOT EXISTS idx_tickets_qr ON tickets(qr_code)`,
  `CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON push_tokens(user_id)`,
];

export type ExecuteFn = (sql: string) => Promise<void>;

/** Run all migration statements one by one (Turso-compatible). */
export async function runMigration(execute: ExecuteFn): Promise<void> {
  for (const sql of MIGRATION_STATEMENTS) {
    const trimmed = sql.trim();
    if (trimmed) await execute(trimmed);
  }
}

/** Run only when this file is executed as script (not when imported). */
async function main() {
  if (!tursoUrl || !tursoToken) {
    throw new Error('Missing TURSO_DATABASE_URL and TURSO_AUTH_TOKEN');
  }
  const client = createClient({ url: tursoUrl, authToken: tursoToken });
  console.log('🚀 Creating database tables on Turso...');
  await runMigration((sql) => client.execute(sql) as unknown as Promise<void>);
  console.log('✅ Database tables created successfully on Turso!');
}

const isRunAsScript = typeof process !== 'undefined' && process.argv[1]?.includes('migrate');
if (isRunAsScript) {
  main().catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
}

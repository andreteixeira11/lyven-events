import { existsSync } from 'fs';
import { runMigration } from './migrate';
import { seedDatabase } from './seed';

const PG_MIGRATION_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
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
    preferences_language TEXT NOT NULL DEFAULT 'pt',
    preferences_price_min REAL NOT NULL DEFAULT 0,
    preferences_price_max REAL NOT NULL DEFAULT 1000,
    preferences_event_types TEXT NOT NULL DEFAULT '[]',
    favorite_events TEXT NOT NULL DEFAULT '[]',
    event_history TEXT NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_onboarding_complete BOOLEAN NOT NULL DEFAULT false
  )`,
  `CREATE TABLE IF NOT EXISTS promoters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    verified BOOLEAN NOT NULL DEFAULT false,
    followers_count INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS promoter_profiles (
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
  )`,
  `CREATE TABLE IF NOT EXISTS promoter_auth (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS events (
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
  )`,
  `CREATE TABLE IF NOT EXISTS tickets (
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
  )`,
  `CREATE TABLE IF NOT EXISTS advertisements (
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
  )`,
  `CREATE TABLE IF NOT EXISTS following (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    promoter_id TEXT REFERENCES promoters(id) ON DELETE CASCADE,
    artist_id TEXT,
    friend_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    followed_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS event_statistics (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    total_tickets_sold INTEGER NOT NULL DEFAULT 0,
    total_revenue REAL NOT NULL DEFAULT 0,
    ticket_type_stats TEXT NOT NULL DEFAULT '[]',
    daily_sales TEXT NOT NULL DEFAULT '[]',
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS push_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_used TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS verification_codes (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS payment_methods (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
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
  )`,
  `CREATE TABLE IF NOT EXISTS event_views (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id TEXT,
    session_id TEXT NOT NULL,
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS affiliates (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    commission_rate REAL NOT NULL DEFAULT 0.1,
    total_earnings REAL NOT NULL DEFAULT 0,
    total_sales INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS affiliate_sales (
    id TEXT PRIMARY KEY,
    affiliate_id TEXT NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    commission REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS event_bundles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    event_ids TEXT NOT NULL DEFAULT '[]',
    discount REAL NOT NULL,
    image TEXT NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT true,
    valid_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS price_alerts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    target_price REAL NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS identity_verifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    document_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
  `CREATE INDEX IF NOT EXISTS idx_events_category ON events(category)`,
  `CREATE INDEX IF NOT EXISTS idx_events_venue_city ON events(venue_city)`,
  `CREATE INDEX IF NOT EXISTS idx_events_promoter_id ON events(promoter_id)`,
  `CREATE INDEX IF NOT EXISTS idx_events_date ON events(date)`,
  `CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id)`,
  `CREATE INDEX IF NOT EXISTS idx_tickets_qr_code ON tickets(qr_code)`,
  `CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_event_views_event_id ON event_views(event_id)`,
];

async function runPgMigration(execute: (sql: string) => Promise<void>): Promise<void> {
  console.log('[pg-migrate] Running PostgreSQL auto-migration...');
  for (const sql of PG_MIGRATION_STATEMENTS) {
    const trimmed = sql.trim();
    if (trimmed) {
      try {
        await execute(trimmed);
      } catch (err) {
        console.warn('[pg-migrate] Statement warning:', (err as Error)?.message?.substring(0, 120));
      }
    }
  }
  console.log('[pg-migrate] ✅ PostgreSQL migration complete');
}

export async function initDatabase() {
  const useSupabase = !!process.env.SUPABASE_DATABASE_URL;
  const useTurso = !!process.env.TURSO_DATABASE_URL;

  console.log('[init] Environment check - SUPABASE_DATABASE_URL:', useSupabase ? 'SET' : 'NOT SET');
  console.log('[init] Environment check - SUPABASE_URL:', !!process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
  console.log('[init] Environment check - SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
  console.log('[init] Environment check - TURSO_DATABASE_URL:', useTurso ? 'SET' : 'NOT SET');

  const { executeRaw: execRaw } = await import('./index');

  if (useSupabase) {
    console.log('🗄️  Supabase detected as database backend');
    try {
      const { verifySupabaseConnection } = await import('../lib/supabase');
      const isConnected = await verifySupabaseConnection();
      
      if (isConnected) {
        console.log('✅ Supabase database connection verified');
      } else {
        console.warn('⚠️  Supabase connection could not be verified, but will continue');
      }

      try {
        console.log('[init] Running PostgreSQL auto-migration on Supabase...');
        await runPgMigration(execRaw);
        console.log('✅ PostgreSQL tables ensured');
      } catch (migrationError) {
        console.error('⚠️  PostgreSQL migration error (non-fatal):', migrationError instanceof Error ? migrationError.message : migrationError);
      }
      
      try {
        await seedDatabase();
        console.log('✅ Database seeded (if needed)');
      } catch (seedError) {
        console.log('ℹ️  Seeding skipped or already done:', seedError instanceof Error ? seedError.message : seedError);
      }
    } catch (error) {
      console.error('❌ Supabase initialization error:', error);
    }
    return;
  }

  if (useTurso) {
    console.log('🗄️  Turso detected. Running migration and seed...');
    try {
      await runMigration(execRaw);
      console.log('✅ Database migrated');
      await seedDatabase();
      console.log('✅ Database seeded');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
    }
    return;
  }

  const dbExists = existsSync('events.db');
  if (!dbExists) {
    console.log('🗄️  No database backend configured. Skipping DB init.');
  } else {
    console.log('✅ Database already exists');
  }
}

/**
 * PostgreSQL schema for Supabase – matches supabase/migrations/00001_lyven_schema.sql
 * Used when backend runs with SUPABASE_DATABASE_URL (Supabase as backend DB).
 */
import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  userType: text('user_type').notNull(),
  interests: text('interests').notNull().default('[]'),
  locationLatitude: real('location_latitude'),
  locationLongitude: real('location_longitude'),
  locationCity: text('location_city'),
  locationRegion: text('location_region'),
  preferencesNotifications: boolean('preferences_notifications').notNull().default(true),
  preferencesLanguage: text('preferences_language').notNull().default('pt'),
  preferencesPriceMin: real('preferences_price_min').notNull().default(0),
  preferencesPriceMax: real('preferences_price_max').notNull().default(1000),
  preferencesEventTypes: text('preferences_event_types').notNull().default('[]'),
  favoriteEvents: text('favorite_events').notNull().default('[]'),
  eventHistory: text('event_history').notNull().default('[]'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  isOnboardingComplete: boolean('is_onboarding_complete').notNull().default(false),
});

export const promoters = pgTable('promoters', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  image: text('image').notNull().default(''),
  description: text('description').notNull().default(''),
  verified: boolean('verified').notNull().default(false),
  followersCount: integer('followers_count').notNull().default(0),
});

export const promoterProfiles = pgTable('promoter_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyName: text('company_name').notNull(),
  description: text('description').notNull().default(''),
  website: text('website'),
  instagramHandle: text('instagram_handle'),
  facebookHandle: text('facebook_handle'),
  twitterHandle: text('twitter_handle'),
  isApproved: boolean('is_approved').notNull().default(false),
  approvalDate: timestamp('approval_date', { withTimezone: true }),
  eventsCreated: text('events_created').notNull().default('[]'),
  followers: text('followers').notNull().default('[]'),
  rating: real('rating').notNull().default(0),
  totalEvents: integer('total_events').notNull().default(0),
});

export const promoterAuth = pgTable('promoter_auth', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const events = pgTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  artists: text('artists').notNull().default('[]'),
  venueName: text('venue_name').notNull(),
  venueAddress: text('venue_address').notNull().default(''),
  venueCity: text('venue_city').notNull(),
  venueCapacity: integer('venue_capacity').notNull().default(0),
  date: timestamp('date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  image: text('image').notNull().default(''),
  description: text('description').notNull().default(''),
  category: text('category').notNull(),
  ticketTypes: text('ticket_types').notNull().default('[]'),
  isSoldOut: boolean('is_sold_out').notNull().default(false),
  isFeatured: boolean('is_featured').notNull().default(false),
  duration: integer('duration'),
  promoterId: text('promoter_id').notNull().references(() => promoters.id, { onDelete: 'cascade' }),
  tags: text('tags').notNull().default('[]'),
  instagramLink: text('instagram_link'),
  facebookLink: text('facebook_link'),
  twitterLink: text('twitter_link'),
  websiteLink: text('website_link'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const tickets = pgTable('tickets', {
  id: text('id').primaryKey(),
  eventId: text('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  ticketTypeId: text('ticket_type_id').notNull(),
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
  qrCode: text('qr_code').notNull(),
  isUsed: boolean('is_used').notNull().default(false),
  validatedAt: timestamp('validated_at', { withTimezone: true }),
  validatedBy: text('validated_by'),
  purchaseDate: timestamp('purchase_date', { withTimezone: true }).notNull().defaultNow(),
  validUntil: timestamp('valid_until', { withTimezone: true }).notNull(),
  addedToCalendar: boolean('added_to_calendar').default(false),
  reminderSet: boolean('reminder_set').default(false),
});

export const advertisements = pgTable('advertisements', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  image: text('image').notNull().default(''),
  targetUrl: text('target_url'),
  type: text('type').notNull(),
  position: text('position').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  impressions: integer('impressions').notNull().default(0),
  clicks: integer('clicks').notNull().default(0),
  budget: real('budget').notNull(),
  targetAudienceInterests: text('target_audience_interests'),
  targetAudienceAgeMin: integer('target_audience_age_min'),
  targetAudienceAgeMax: integer('target_audience_age_max'),
  targetAudienceLocation: text('target_audience_location'),
  promoterId: text('promoter_id').references(() => promoters.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const following = pgTable('following', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  promoterId: text('promoter_id').references(() => promoters.id, { onDelete: 'cascade' }),
  artistId: text('artist_id'),
  friendId: text('friend_id').references(() => users.id, { onDelete: 'cascade' }),
  followedAt: timestamp('followed_at', { withTimezone: true }).notNull().defaultNow(),
});

export const eventStatistics = pgTable('event_statistics', {
  id: text('id').primaryKey(),
  eventId: text('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  totalTicketsSold: integer('total_tickets_sold').notNull().default(0),
  totalRevenue: real('total_revenue').notNull().default(0),
  ticketTypeStats: text('ticket_type_stats').notNull().default('[]'),
  dailySales: text('daily_sales').notNull().default('[]'),
  lastUpdated: timestamp('last_updated', { withTimezone: true }).notNull().defaultNow(),
});

export const pushTokens = pgTable('push_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull(),
  platform: text('platform').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lastUsed: timestamp('last_used', { withTimezone: true }).notNull().defaultNow(),
});

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  data: text('data'),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const verificationCodes = pgTable('verification_codes', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  password: text('password').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  isUsed: boolean('is_used').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const paymentMethods = pgTable('payment_methods', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  isPrimary: boolean('is_primary').notNull().default(false),
  accountHolderName: text('account_holder_name'),
  bankName: text('bank_name'),
  iban: text('iban'),
  swift: text('swift'),
  phoneNumber: text('phone_number'),
  email: text('email'),
  accountId: text('account_id'),
  isVerified: boolean('is_verified').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const eventViews = pgTable('event_views', {
  id: text('id').primaryKey(),
  eventId: text('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id'),
  sessionId: text('session_id').notNull(),
  viewedAt: timestamp('viewed_at', { withTimezone: true }).notNull().defaultNow(),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }).notNull().defaultNow(),
});

export const affiliates = pgTable('affiliates', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  code: text('code').notNull().unique(),
  commissionRate: real('commission_rate').notNull().default(0.1),
  totalEarnings: real('total_earnings').notNull().default(0),
  totalSales: integer('total_sales').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const affiliateSales = pgTable('affiliate_sales', {
  id: text('id').primaryKey(),
  affiliateId: text('affiliate_id').notNull().references(() => affiliates.id, { onDelete: 'cascade' }),
  ticketId: text('ticket_id').notNull().references(() => tickets.id, { onDelete: 'cascade' }),
  commission: real('commission').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const eventBundles = pgTable('event_bundles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  eventIds: text('event_ids').notNull().default('[]'),
  discount: real('discount').notNull(),
  image: text('image').notNull().default(''),
  isActive: boolean('is_active').notNull().default(true),
  validUntil: timestamp('valid_until', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const priceAlerts = pgTable('price_alerts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  eventId: text('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  targetPrice: real('target_price').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const identityVerifications = pgTable('identity_verifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  documentType: text('document_type').notNull(),
  documentNumber: text('document_number').notNull(),
  status: text('status').notNull().default('pending'),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

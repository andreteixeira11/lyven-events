import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  userType: text('user_type', { enum: ['normal', 'promoter', 'admin'] }).notNull(),
  interests: text('interests').notNull(),
  locationLatitude: real('location_latitude'),
  locationLongitude: real('location_longitude'),
  locationCity: text('location_city'),
  locationRegion: text('location_region'),
  preferencesNotifications: integer('preferences_notifications', { mode: 'boolean' }).notNull().default(true),
  preferencesLanguage: text('preferences_language', { enum: ['pt', 'en'] }).notNull().default('pt'),
  preferencesPriceMin: real('preferences_price_min').notNull().default(0),
  preferencesPriceMax: real('preferences_price_max').notNull().default(1000),
  preferencesEventTypes: text('preferences_event_types').notNull(),
  favoriteEvents: text('favorite_events').notNull().default('[]'),
  eventHistory: text('event_history').notNull().default('[]'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  isOnboardingComplete: integer('is_onboarding_complete', { mode: 'boolean' }).notNull().default(false),
});

export const promoters = sqliteTable('promoters', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  image: text('image').notNull(),
  description: text('description').notNull(),
  verified: integer('verified', { mode: 'boolean' }).notNull().default(false),
  followersCount: integer('followers_count').notNull().default(0),
});

export const promoterProfiles = sqliteTable('promoter_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  companyName: text('company_name').notNull(),
  description: text('description').notNull(),
  website: text('website'),
  instagramHandle: text('instagram_handle'),
  facebookHandle: text('facebook_handle'),
  twitterHandle: text('twitter_handle'),
  isApproved: integer('is_approved', { mode: 'boolean' }).notNull().default(false),
  approvalDate: text('approval_date'),
  eventsCreated: text('events_created').notNull().default('[]'),
  followers: text('followers').notNull().default('[]'),
  rating: real('rating').notNull().default(0),
  totalEvents: integer('total_events').notNull().default(0),
});

export const promoterAuth = sqliteTable('promoter_auth', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  artists: text('artists').notNull(),
  venueName: text('venue_name').notNull(),
  venueAddress: text('venue_address').notNull(),
  venueCity: text('venue_city').notNull(),
  venueCapacity: integer('venue_capacity').notNull(),
  date: text('date').notNull(),
  endDate: text('end_date'),
  image: text('image').notNull(),
  description: text('description').notNull(),
  category: text('category', { enum: ['music', 'theater', 'comedy', 'dance', 'festival', 'other'] }).notNull(),
  ticketTypes: text('ticket_types').notNull(),
  isSoldOut: integer('is_sold_out', { mode: 'boolean' }).notNull().default(false),
  isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
  duration: integer('duration'),
  promoterId: text('promoter_id').notNull().references(() => promoters.id),
  tags: text('tags').notNull(),
  instagramLink: text('instagram_link'),
  facebookLink: text('facebook_link'),
  twitterLink: text('twitter_link'),
  websiteLink: text('website_link'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  status: text('status', { enum: ['draft', 'pending', 'published', 'cancelled', 'completed'] }).notNull().default('pending'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const tickets = sqliteTable('tickets', {
  id: text('id').primaryKey(),
  eventId: text('event_id').notNull().references(() => events.id),
  userId: text('user_id').notNull().references(() => users.id),
  ticketTypeId: text('ticket_type_id').notNull(),
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
  qrCode: text('qr_code').notNull(),
  isUsed: integer('is_used', { mode: 'boolean' }).notNull().default(false),
  validatedAt: text('validated_at'),
  validatedBy: text('validated_by'),
  purchaseDate: text('purchase_date').notNull().default(sql`CURRENT_TIMESTAMP`),
  validUntil: text('valid_until').notNull(),
  addedToCalendar: integer('added_to_calendar', { mode: 'boolean' }).default(false),
  reminderSet: integer('reminder_set', { mode: 'boolean' }).default(false),
});

export const advertisements = sqliteTable('advertisements', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  image: text('image').notNull(),
  targetUrl: text('target_url'),
  type: text('type', { enum: ['banner', 'card', 'sponsored_event'] }).notNull(),
  position: text('position', { enum: ['home_top', 'home_middle', 'search_results', 'event_detail'] }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  impressions: integer('impressions').notNull().default(0),
  clicks: integer('clicks').notNull().default(0),
  budget: real('budget').notNull(),
  targetAudienceInterests: text('target_audience_interests'),
  targetAudienceAgeMin: integer('target_audience_age_min'),
  targetAudienceAgeMax: integer('target_audience_age_max'),
  targetAudienceLocation: text('target_audience_location'),
  promoterId: text('promoter_id').references(() => promoters.id),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const following = sqliteTable('following', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  promoterId: text('promoter_id').references(() => promoters.id),
  artistId: text('artist_id'),
  friendId: text('friend_id').references(() => users.id),
  followedAt: text('followed_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const eventStatistics = sqliteTable('event_statistics', {
  id: text('id').primaryKey(),
  eventId: text('event_id').notNull().references(() => events.id),
  totalTicketsSold: integer('total_tickets_sold').notNull().default(0),
  totalRevenue: real('total_revenue').notNull().default(0),
  ticketTypeStats: text('ticket_type_stats').notNull().default('[]'),
  dailySales: text('daily_sales').notNull().default('[]'),
  lastUpdated: text('last_updated').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const pushTokens = sqliteTable('push_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  token: text('token').notNull(),
  platform: text('platform', { enum: ['ios', 'android', 'web'] }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  lastUsed: text('last_used').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type', { enum: ['event_approved', 'ad_approved', 'ticket_sold', 'event_reminder', 'follower', 'system', 'new_promoter_event'] }).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  data: text('data'),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const verificationCodes = sqliteTable('verification_codes', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  password: text('password').notNull(),
  expiresAt: text('expires_at').notNull(),
  isUsed: integer('is_used', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const paymentMethods = sqliteTable('payment_methods', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type', { enum: ['bank_transfer', 'mbway', 'paypal', 'stripe'] }).notNull(),
  isPrimary: integer('is_primary', { mode: 'boolean' }).notNull().default(false),
  accountHolderName: text('account_holder_name'),
  bankName: text('bank_name'),
  iban: text('iban'),
  swift: text('swift'),
  phoneNumber: text('phone_number'),
  email: text('email'),
  accountId: text('account_id'),
  isVerified: integer('is_verified', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const eventViews = sqliteTable('event_views', {
  id: text('id').primaryKey(),
  eventId: text('event_id').notNull().references(() => events.id),
  userId: text('user_id'),
  sessionId: text('session_id').notNull(),
  viewedAt: text('viewed_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  lastActiveAt: text('last_active_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const affiliates = sqliteTable('affiliates', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  code: text('code').notNull().unique(),
  commissionRate: real('commission_rate').notNull().default(0.1),
  totalEarnings: real('total_earnings').notNull().default(0),
  totalSales: integer('total_sales').notNull().default(0),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const affiliateSales = sqliteTable('affiliate_sales', {
  id: text('id').primaryKey(),
  affiliateId: text('affiliate_id').notNull().references(() => affiliates.id),
  ticketId: text('ticket_id').notNull().references(() => tickets.id),
  commission: real('commission').notNull(),
  status: text('status', { enum: ['pending', 'approved', 'paid'] }).notNull().default('pending'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const eventBundles = sqliteTable('event_bundles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  eventIds: text('event_ids').notNull(),
  discount: real('discount').notNull(),
  image: text('image').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  validUntil: text('valid_until').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const priceAlerts = sqliteTable('price_alerts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  eventId: text('event_id').notNull().references(() => events.id),
  targetPrice: real('target_price').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const identityVerifications = sqliteTable('identity_verifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  documentType: text('document_type', { enum: ['passport', 'id_card', 'drivers_license'] }).notNull(),
  documentNumber: text('document_number').notNull(),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  verifiedAt: text('verified_at'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

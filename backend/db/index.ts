/**
 * Database entry point: uses Supabase (PostgreSQL) when SUPABASE_DATABASE_URL is set,
 * otherwise uses Turso (libSQL). Ensure env is loaded before this module (e.g. backend/server.ts loads load-env first).
 */
import * as supabaseDb from './supabase-db';
import * as tursoDb from './turso-db';

const useSupabase = !!process.env.SUPABASE_DATABASE_URL;
const active = useSupabase ? supabaseDb : tursoDb;

if (!active.db) {
  throw new Error(
    useSupabase
      ? 'SUPABASE_DATABASE_URL is required. Get it from Supabase Dashboard → Settings → Database → Connection string (URI).'
      : 'TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required. Or set SUPABASE_DATABASE_URL to use Supabase as backend.'
  );
}

// Export db with 'any' type to allow dual SQLite/PostgreSQL support without type conflicts
export const db: any = active.db;
export const executeRaw = active.executeRaw;

export const users = active.users;
export const promoters = active.promoters;
export const promoterProfiles = active.promoterProfiles;
export const promoterAuth = active.promoterAuth;
export const events = active.events;
export const tickets = active.tickets;
export const advertisements = active.advertisements;
export const following = active.following;
export const eventStatistics = active.eventStatistics;
export const pushTokens = active.pushTokens;
export const notifications = active.notifications;
export const verificationCodes = active.verificationCodes;
export const paymentMethods = active.paymentMethods;
export const eventViews = active.eventViews;
export const affiliates = active.affiliates;
export const affiliateSales = active.affiliateSales;
export const eventBundles = active.eventBundles;
export const priceAlerts = active.priceAlerts;
export const identityVerifications = active.identityVerifications;

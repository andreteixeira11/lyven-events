/**
 * Database entry point: uses Supabase (PostgreSQL) when SUPABASE_DATABASE_URL is set,
 * otherwise uses Turso (libSQL). Uses dynamic imports to avoid crash when unused adapter's
 * native package is unavailable in the deployment environment.
 */

const useSupabase = !!process.env.SUPABASE_DATABASE_URL;

let active: any = {};
try {
  if (useSupabase) {
    console.log('[db] Loading Supabase adapter...');
    active = await import('./supabase-db');
  } else {
    console.log('[db] Loading Turso adapter...');
    active = await import('./turso-db');
  }
  console.log('[db] Adapter loaded successfully, db exists:', !!active.db);
} catch (err) {
  console.error('[db] Failed to load database adapter:', err);
  active = {};
}

if (!active.db) {
  console.error(
    useSupabase
      ? '[db] SUPABASE_DATABASE_URL is set but db could not be initialized.'
      : '[db] TURSO_DATABASE_URL/TURSO_AUTH_TOKEN missing or db could not be initialized.'
  );
}

export const db: any = active.db ?? null;
export const executeRaw = active.executeRaw ?? (async () => { throw new Error('Database not initialized'); });

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

/**
 * Database entry point: uses Supabase (PostgreSQL) when SUPABASE_DATABASE_URL is set,
 * otherwise uses Turso (libSQL). Uses lazy initialization to avoid crashing the
 * backend if the database adapter fails to load.
 *
 * Adds SQLite-compat methods (.get(), .all(), .run()) so existing route code works
 * unchanged against PostgreSQL.
 */

import * as pgSchema from './schema.pg';

let _active: any = null;
let _loadError: string | null = null;
let _loadPromise: Promise<any> | null = null;

function getUseSupabase(): boolean {
  return !!process.env.SUPABASE_DATABASE_URL;
}

async function loadAdapter(): Promise<any> {
  if (_active) return _active;
  if (_loadError) return {};

  try {
    const useSupabase = getUseSupabase();
    if (useSupabase) {
      console.log('[db] Loading Supabase adapter...');
      _active = await import('./supabase-db');
    } else {
      console.log('[db] Loading Turso adapter...');
      _active = await import('./turso-db');
    }
    console.log('[db] Adapter loaded successfully, db exists:', !!_active?.db);
    return _active;
  } catch (err: any) {
    _loadError = err?.message ?? String(err);
    console.error('[db] Failed to load database adapter:', _loadError);
    _active = {};
    return _active;
  }
}

export function ensureDbLoaded(): Promise<any> {
  if (!_loadPromise) {
    _loadPromise = loadAdapter();
  }
  return _loadPromise;
}

function getActive(): any {
  return _active ?? {};
}

export function getDb(): any {
  return getActive().db ?? null;
}

export async function getExecuteRaw(): Promise<(sql: string) => Promise<void>> {
  const mod = await ensureDbLoaded();
  if (mod?.executeRaw) return mod.executeRaw;
  return async () => { throw new Error('Database not initialized'); };
}

export const executeRaw = async (sql: string): Promise<void> => {
  const fn = await getExecuteRaw();
  return fn(sql);
};

function wrapChainable(val: any): any {
  if (!val || typeof val !== 'object') return val;

  return new Proxy(val, {
    get(target, prop) {
      if (prop === 'get') {
        return async () => {
          const rows = await target;
          return Array.isArray(rows) ? rows[0] ?? null : rows;
        };
      }
      if (prop === 'all') {
        return async () => {
          const rows = await target;
          return Array.isArray(rows) ? rows : [rows];
        };
      }
      if (prop === 'run') {
        return async () => {
          await target;
        };
      }
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        const fn = target[prop];
        return fn ? fn.bind(target) : undefined;
      }
      if (prop === Symbol.toStringTag) return target[prop];

      const inner = target[prop];
      if (typeof inner === 'function') {
        return (...args: any[]) => {
          const result = inner.apply(target, args);
          if (result && typeof result === 'object' && typeof result.then === 'function') {
            return wrapChainable(result);
          }
          if (result && typeof result === 'object') {
            return wrapChainable(result);
          }
          return result;
        };
      }
      return inner;
    },
  });
}

export const db: any = new Proxy({} as any, {
  get(_target, prop) {
    const a = getActive();
    if (!a?.db) return undefined;
    const val = a.db[prop];
    if (typeof val === 'function') {
      return (...args: any[]) => {
        const result = val.apply(a.db, args);
        if (result && typeof result === 'object') {
          return wrapChainable(result);
        }
        return result;
      };
    }
    if (prop === 'query') {
      return val;
    }
    return val;
  },
});

export const { users, promoters, promoterProfiles, promoterAuth, events, tickets,
  advertisements, following, eventStatistics, pushTokens, notifications,
  verificationCodes, paymentMethods, eventViews, affiliates, affiliateSales,
  eventBundles, priceAlerts, identityVerifications } = pgSchema;

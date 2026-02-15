/**
 * Supabase (PostgreSQL) database adapter – used when SUPABASE_DATABASE_URL is set.
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.pg';

let client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

try {
  const connectionString = process.env.SUPABASE_DATABASE_URL;
  console.log('[supabase-db] Connection string present:', !!connectionString);
  if (connectionString) {
    client = postgres(connectionString, {
      max: 1,
      connect_timeout: 10,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
    });
    _db = drizzle(client, { schema });
    console.log('[supabase-db] Drizzle client created successfully');
  } else {
    console.error('[supabase-db] SUPABASE_DATABASE_URL not set');
  }
} catch (err: any) {
  console.error('[supabase-db] Failed to create client:', err?.message ?? err);
}

export const db = _db as NonNullable<typeof _db>;

export async function executeRaw(sql: string): Promise<void> {
  if (!client) throw new Error('SUPABASE_DATABASE_URL not set or client failed to initialize');
  try {
    await client.unsafe(sql);
  } catch (err: any) {
    console.error('[supabase-db] executeRaw error:', err?.message?.substring(0, 200));
    throw err;
  }
}

export * from './schema.pg';

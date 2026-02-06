/**
 * Supabase (PostgreSQL) database adapter – used when SUPABASE_DATABASE_URL is set.
 * Get the connection string from Supabase Dashboard → Project Settings → Database → Connection string (URI).
 * Use "Transaction" pooler for serverless, or "Session" for long-lived connections.
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.pg';

const connectionString = process.env.SUPABASE_DATABASE_URL;
const client = connectionString ? postgres(connectionString, { max: 1 }) : null;
const _db = client ? drizzle(client, { schema }) : null;

export const db = _db as NonNullable<typeof _db>;

export async function executeRaw(sql: string): Promise<void> {
  if (!client) throw new Error('SUPABASE_DATABASE_URL not set');
  await client.unsafe(sql);
}

export * from './schema.pg';

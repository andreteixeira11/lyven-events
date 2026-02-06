/**
 * Turso (libSQL) database adapter – used when SUPABASE_DATABASE_URL is not set.
 */
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;
const client =
  tursoUrl && tursoToken
    ? createClient({ url: tursoUrl, authToken: tursoToken })
    : null;
const _db = client ? drizzle(client, { schema }) : null;

export const db = _db as NonNullable<typeof _db>;

/** Run a single SQL statement (for migrations). Turso/libSQL allows only one statement per execute. */
export async function executeRaw(sql: string): Promise<void> {
  if (!client) throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required when not using Supabase.');
  await client.execute(sql);
}

export * from './schema';

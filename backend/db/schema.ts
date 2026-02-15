/**
 * Schema re-export: always use PostgreSQL schema since the app uses Supabase.
 * Routes can import from '@/backend/db/schema' and get the correct PG tables.
 */
export * from './schema.pg';

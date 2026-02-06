# Using Supabase as the Backend

The Lyven app can use **Supabase (PostgreSQL)** as the backend database instead of Turso (libSQL). The same Hono + tRPC API runs; only the database driver changes.

## When Supabase is the backend

- **API**: Unchanged. The app still calls the same tRPC endpoints (e.g. `auth.login`, `events.list`).
- **Database**: Supabase PostgreSQL. Tables and RLS are in Supabase; the Node backend connects via a direct Postgres connection.
- **Env**: Set `SUPABASE_DATABASE_URL` and leave Turso vars unset (or set them; Supabase takes precedence if `SUPABASE_DATABASE_URL` is set).

## Setup

1. **Create tables in Supabase**  
   Use the SQL in `supabase/migrations/00001_lyven_schema.sql` (or apply via Supabase MCP). Tables must exist before the backend uses them.

2. **Get the database connection string**  
   - Supabase Dashboard → **Project Settings** → **Database**  
   - Under **Connection string**, choose **URI**  
   - Copy the URI. It looks like:  
     `postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`  
   - Replace `[YOUR-PASSWORD]` with your **database password** (the one you set when creating the project, not the anon or service role key).

3. **Configure `.env`**  
   ```env
   SUPABASE_DATABASE_URL=postgresql://postgres.fmjgrewkknqvxqwkouqj:YOUR_DB_PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
   ```  
   Do **not** set `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` if you want Supabase only, or the backend will use Turso when `SUPABASE_DATABASE_URL` is missing.

4. **Run the backend**  
   ```bash
   npm run start:backend
   ```  
   The backend will connect to Supabase PostgreSQL and use the same tRPC routes.

## Behaviour

- If **`SUPABASE_DATABASE_URL`** is set → backend uses **Supabase (PostgreSQL)**.
- Otherwise → backend uses **Turso (libSQL)** and requires `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.

RLS in Supabase applies when clients use the Supabase client (anon/authenticated keys). The Node backend uses the **direct Postgres connection** (`SUPABASE_DATABASE_URL`), which bypasses RLS (same as a superuser). So the backend can read/write all tables; security is enforced by your tRPC auth and logic.

## RLS policies

If you use Supabase client elsewhere (e.g. future features), run the RLS SQL in `supabase/RLS_POLICIES_FULL.sql` in the Supabase SQL Editor so authenticated users only see their own rows.

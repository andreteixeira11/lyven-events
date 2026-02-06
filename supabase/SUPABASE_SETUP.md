# Supabase setup (Lyven)

## Project

- **Project name:** lyvenapp  
- **Project ref / ID:** `fmjgrewkknqvxqwkouqj`  
- **Region:** eu-west-1  

## Schema

The Lyven schema is applied via migration **lyven_schema** and includes these tables:

| Table | Purpose |
|-------|--------|
| users | App users (buyers, promoters, admin) |
| promoters | Promoter entities |
| promoter_profiles | Promoter profile & approval |
| promoter_auth | Promoter login credentials |
| events | Events |
| tickets | User ticket purchases |
| advertisements | Ads & sponsored content |
| following | User follows (promoters, artists, friends) |
| event_statistics | Per-event sales/revenue stats |
| push_tokens | Device push tokens |
| notifications | In-app notifications |
| verification_codes | Email verification (auth) |
| payment_methods | User payment methods |
| event_views | Event view tracking |
| affiliates | Affiliate users |
| affiliate_sales | Affiliate commissions |
| event_bundles | Event bundles / packages |
| price_alerts | User price alerts |
| identity_verifications | ID verification status |

Indexes are created for: `users.email`, `events.category`, `events.venue_city`, `events.promoter_id`, `events.date`, `tickets.user_id`, `tickets.event_id`, `tickets.qr_code`, `notifications.user_id`, `event_views.event_id`.

## Applying migrations

### Option 1: Supabase MCP (Cursor)

Use the Supabase MCP server (`project-0-rork-lyven-main-supabase`) and call:

- **apply_migration** with:
  - `project_id`: `fmjgrewkknqvxqwkouqj`
  - `name`: e.g. `lyven_schema` or your migration name
  - `query`: the SQL string (DDL only; schema changes)

### Option 2: Supabase Dashboard

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **SQL Editor**.
3. Paste the contents of `supabase/migrations/00001_lyven_schema.sql` and run.

## Environment

Ensure `.env` has:

- `SUPABASE_URL` – project URL (e.g. `https://fmjgrewkknqvxqwkouqj.supabase.co`)
- `SUPABASE_ANON_KEY` – anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` – service role key (server-only)

See `env.example` for placeholders.

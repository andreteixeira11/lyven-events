-- =============================================================================
-- RLS (Row Level Security) – Lyven public schema
-- Review before applying. No data is dropped or modified.
-- Assumes: public.users.id = auth.uid()::text when using Supabase Auth.
-- Service role bypasses RLS (no policies needed for it).
-- =============================================================================
--
-- Summary by table:
-- | Table                  | RLS | Authenticated access              | Notes                    |
-- |------------------------|-----|-----------------------------------|--------------------------|
-- | users                  | ON  | SELECT, UPDATE own row            | No anon write            |
-- | promoters              | ON  | none                              | Service role only; TODO  |
-- | promoter_profiles      | ON  | SELECT own (user_id)              |                          |
-- | promoter_auth          | ON  | SELECT own (user_id)              |                          |
-- | events                 | ON  | SELECT where promoter = self      | Buyers get 0 rows; TODO   |
-- | tickets                | ON  | SELECT own (user_id)              |                          |
-- | advertisements         | ON  | SELECT own promoter or NULL       |                          |
-- | following              | ON  | SELECT own (user_id)              |                          |
-- | event_statistics       | ON  | none                              | Service role only; TODO  |
-- | push_tokens            | ON  | SELECT own (user_id)              |                          |
-- | notifications          | ON  | SELECT own (user_id)              |                          |
-- | verification_codes    | ON  | none                              | Service role only        |
-- | payment_methods        | ON  | SELECT own (user_id)              |                          |
-- | event_views            | ON  | SELECT own (user_id)              |                          |
-- | affiliates             | ON  | SELECT own (user_id)              |                          |
-- | affiliate_sales        | ON  | SELECT where affiliate = self     |                          |
-- | event_bundles          | ON  | none                              | Service role only; TODO  |
-- | price_alerts           | ON  | SELECT own (user_id)              |                          |
-- | identity_verifications | ON  | SELECT own (user_id)              |                          |
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. users
-- -----------------------------------------------------------------------------
-- Access: Service role full (bypasses RLS). Authenticated: SELECT + UPDATE own row only (id = auth.uid()::text).
-- No anon write. No INSERT for authenticated (signup via backend/verification flow).
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  TO authenticated
  USING (id = auth.uid()::text);

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- 2. promoters
-- -----------------------------------------------------------------------------
-- No direct user_id; ownership is via promoter_profiles. Service role only.
-- TODO: Add authenticated SELECT for public catalog if app needs it (e.g. list promoters).
ALTER TABLE public.promoters ENABLE ROW LEVEL SECURITY;

-- (No policies → only service_role can access)

-- -----------------------------------------------------------------------------
-- 3. promoter_profiles
-- -----------------------------------------------------------------------------
-- Access: Service role full. Authenticated: SELECT own row (user_id = auth.uid()::text).
ALTER TABLE public.promoter_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "promoter_profiles_select_own"
  ON public.promoter_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- 4. promoter_auth
-- -----------------------------------------------------------------------------
-- Access: Service role full. Authenticated: SELECT own row (user_id = auth.uid()::text). No writes.
ALTER TABLE public.promoter_auth ENABLE ROW LEVEL SECURITY;

CREATE POLICY "promoter_auth_select_own"
  ON public.promoter_auth FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- 5. events
-- -----------------------------------------------------------------------------
-- Ownership via promoter_id → promoter_profiles.user_id. Service role full.
-- Authenticated: SELECT events where current user is the promoter.
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select_own_promoter"
  ON public.events FOR SELECT
  TO authenticated
  USING (
    promoter_id IN (
      SELECT id FROM public.promoter_profiles WHERE user_id = auth.uid()::text
    )
  );

-- -----------------------------------------------------------------------------
-- 6. tickets
-- -----------------------------------------------------------------------------
-- Access: Service role full. Authenticated: SELECT own tickets (user_id = auth.uid()::text).
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tickets_select_own"
  ON public.tickets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- 7. advertisements
-- -----------------------------------------------------------------------------
-- Ownership via promoter_id (nullable). Service role full.
-- Authenticated: SELECT rows where promoter_id is current user's promoter profile.
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "advertisements_select_own_promoter"
  ON public.advertisements FOR SELECT
  TO authenticated
  USING (
    promoter_id IS NULL
    OR promoter_id IN (
      SELECT id FROM public.promoter_profiles WHERE user_id = auth.uid()::text
    )
  );

-- -----------------------------------------------------------------------------
-- 8. following
-- -----------------------------------------------------------------------------
-- user_id = follower. Access: Service role full. Authenticated: SELECT own rows (user_id = auth.uid()::text).
ALTER TABLE public.following ENABLE ROW LEVEL SECURITY;

CREATE POLICY "following_select_own"
  ON public.following FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- 9. event_statistics
-- -----------------------------------------------------------------------------
-- No user_id; belongs to event (promoter). Service role only.
-- TODO: Add authenticated SELECT where event.promoter_id in promoter_profiles for current user if needed.
ALTER TABLE public.event_statistics ENABLE ROW LEVEL SECURITY;

-- (No policies → only service_role can access)

-- -----------------------------------------------------------------------------
-- 10. push_tokens
-- -----------------------------------------------------------------------------
-- Access: Service role full. Authenticated: SELECT own rows (user_id = auth.uid()::text).
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_tokens_select_own"
  ON public.push_tokens FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- 11. notifications
-- -----------------------------------------------------------------------------
-- Access: Service role full. Authenticated: SELECT own rows (user_id = auth.uid()::text).
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- 12. verification_codes
-- -----------------------------------------------------------------------------
-- No user ownership; used by backend for email verification. Service role only.
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- (No policies → only service_role can access)

-- -----------------------------------------------------------------------------
-- 13. payment_methods
-- -----------------------------------------------------------------------------
-- Access: Service role full. Authenticated: SELECT own rows (user_id = auth.uid()::text).
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_methods_select_own"
  ON public.payment_methods FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- 14. event_views
-- -----------------------------------------------------------------------------
-- user_id nullable (anonymous viewers). Access: Service role full.
-- Authenticated: SELECT rows where user_id = auth.uid()::text (own views only).
ALTER TABLE public.event_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_views_select_own"
  ON public.event_views FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- 15. affiliates
-- -----------------------------------------------------------------------------
-- Access: Service role full. Authenticated: SELECT own row (user_id = auth.uid()::text).
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliates_select_own"
  ON public.affiliates FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- 16. affiliate_sales
-- -----------------------------------------------------------------------------
-- Ownership via affiliate_id → affiliates.user_id. Service role full.
-- Authenticated: SELECT rows where affiliate belongs to current user.
ALTER TABLE public.affiliate_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliate_sales_select_own"
  ON public.affiliate_sales FOR SELECT
  TO authenticated
  USING (
    affiliate_id IN (
      SELECT id FROM public.affiliates WHERE user_id = auth.uid()::text
    )
  );

-- -----------------------------------------------------------------------------
-- 17. event_bundles
-- -----------------------------------------------------------------------------
-- No user_id or promoter_id; platform-level catalog. Service role only.
-- TODO: Add authenticated SELECT all if app needs to list bundles publicly.
ALTER TABLE public.event_bundles ENABLE ROW LEVEL SECURITY;

-- (No policies → only service_role can access)

-- -----------------------------------------------------------------------------
-- 18. price_alerts
-- -----------------------------------------------------------------------------
-- Access: Service role full. Authenticated: SELECT own rows (user_id = auth.uid()::text).
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "price_alerts_select_own"
  ON public.price_alerts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- 19. identity_verifications
-- -----------------------------------------------------------------------------
-- Access: Service role full. Authenticated: SELECT own rows (user_id = auth.uid()::text).
ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "identity_verifications_select_own"
  ON public.identity_verifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- =============================================================================
-- RLS: Enable Row Level Security and minimal starter policies (REVIEW BEFORE RUN)
-- =============================================================================
-- Rules: No anon writes; authenticated SELECT only on "own" rows; service_role
-- has full access (bypasses RLS). No data is dropped or modified.
-- Assumes: users.id = auth.uid()::text; promoter ownership via promoter_profiles.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. users
-- Access: Authenticated users may SELECT/UPDATE only their own row (id = auth.uid()).
-- service_role: full (bypasses RLS).
-- -----------------------------------------------------------------------------
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
-- Access: Authenticated users may SELECT only promoters linked to them via
-- promoter_profiles (promoter_profiles.id = promoters.id, promoter_profiles.user_id = auth.uid()).
-- service_role: full.
-- -----------------------------------------------------------------------------
ALTER TABLE public.promoters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "promoters_select_own"
  ON public.promoters FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT id FROM public.promoter_profiles WHERE user_id = auth.uid()::text
    )
  );

-- -----------------------------------------------------------------------------
-- 3. promoter_profiles
-- Access: Authenticated users may SELECT/UPDATE only their own profile (user_id = auth.uid()).
-- service_role: full.
-- -----------------------------------------------------------------------------
ALTER TABLE public.promoter_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "promoter_profiles_select_own"
  ON public.promoter_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "promoter_profiles_update_own"
  ON public.promoter_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- 4. promoter_auth
-- Access: Authenticated users may SELECT only their own row (user_id = auth.uid()).
-- No INSERT/UPDATE/DELETE for authenticated (credentials managed server-side).
-- service_role: full.
-- -----------------------------------------------------------------------------
ALTER TABLE public.promoter_auth ENABLE ROW LEVEL SECURITY;

CREATE POLICY "promoter_auth_select_own"
  ON public.promoter_auth FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- 5. events
-- Access: Authenticated users may SELECT only events for promoters they own
-- (promoter_id in their promoter_profiles).
-- service_role: full.
-- TODO (optional): Add policy for authenticated SELECT where status = 'published'
--   if app needs buyers to read events via Supabase client.
-- -----------------------------------------------------------------------------
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
-- Access: Authenticated users may SELECT only their own tickets (user_id = auth.uid()).
-- service_role: full.
-- -----------------------------------------------------------------------------
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tickets_select_own"
  ON public.tickets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- 7. advertisements
-- Access: Authenticated users may SELECT only ads for promoters they own.
-- service_role: full.
-- -----------------------------------------------------------------------------
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "advertisements_select_own_promoter"
  ON public.advertisements FOR SELECT
  TO authenticated
  USING (
    promoter_id IN (
      SELECT id FROM public.promoter_profiles WHERE user_id = auth.uid()::text
    )
  );

-- -----------------------------------------------------------------------------
-- 8. following
-- Access: Authenticated users may SELECT only rows where they are the follower (user_id = auth.uid()).
-- service_role: full.
-- -----------------------------------------------------------------------------
ALTER TABLE public.following ENABLE ROW LEVEL SECURITY;

CREATE POLICY "following_select_own"
  ON public.following FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- 9. event_statistics
-- Access: Authenticated users may SELECT only stats for events they promote
-- (event's promoter_id in their promoter_profiles).
-- service_role: full.
-- -----------------------------------------------------------------------------
ALTER TABLE public.event_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_statistics_select_own_events"
  ON public.event_statistics FOR SELECT
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM public.events e
      WHERE e.promoter_id IN (
        SELECT id FROM public.promoter_profiles WHERE user_id = auth.uid()::text
      )
    )
  );

-- -----------------------------------------------------------------------------
-- 10. push_tokens
-- Access: Authenticated users may SELECT only their own tokens (user_id = auth.uid()).
-- service_role: full.
-- -----------------------------------------------------------------------------
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_tokens_select_own"
  ON public.push_tokens FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- 11. notifications
-- Access: Authenticated users may SELECT only their own notifications (user_id = auth.uid()).
-- service_role: full.
-- -----------------------------------------------------------------------------
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- 12. verification_codes
-- Access: service_role only. No user_id; used by backend for email verification.
-- Authenticated/anon: no access (avoids leaking codes).
-- -----------------------------------------------------------------------------
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- No policy for authenticated or anon; service_role bypasses RLS.

-- -----------------------------------------------------------------------------
-- 13. payment_methods
-- Access: Authenticated users may SELECT only their own payment methods (user_id = auth.uid()).
-- service_role: full.
-- -----------------------------------------------------------------------------
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_methods_select_own"
  ON public.payment_methods FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- 14. event_views
-- Access: Authenticated users may SELECT only rows where user_id = auth.uid()
-- (anonymous views with user_id NULL are not exposed).
-- service_role: full.
-- -----------------------------------------------------------------------------
ALTER TABLE public.event_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_views_select_own"
  ON public.event_views FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- 15. affiliates
-- Access: Authenticated users may SELECT only their own affiliate row (user_id = auth.uid()).
-- service_role: full.
-- -----------------------------------------------------------------------------
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliates_select_own"
  ON public.affiliates FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- 16. affiliate_sales
-- Access: Authenticated users may SELECT only rows where affiliate_id belongs to them
-- (affiliate_id in affiliates where user_id = auth.uid()).
-- service_role: full.
-- -----------------------------------------------------------------------------
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
-- Access: service_role only. No user/promoter ownership; catalog/admin data.
-- -----------------------------------------------------------------------------
ALTER TABLE public.event_bundles ENABLE ROW LEVEL SECURITY;

-- No policy for authenticated or anon; service_role bypasses RLS.

-- -----------------------------------------------------------------------------
-- 18. price_alerts
-- Access: Authenticated users may SELECT only their own alerts (user_id = auth.uid()).
-- service_role: full.
-- -----------------------------------------------------------------------------
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "price_alerts_select_own"
  ON public.price_alerts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- 19. identity_verifications
-- Access: Authenticated users may SELECT only their own verifications (user_id = auth.uid()).
-- service_role: full.
-- -----------------------------------------------------------------------------
ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "identity_verifications_select_own"
  ON public.identity_verifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

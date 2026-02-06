-- =============================================================================
-- RLS: Enable Row Level Security and minimal starter policies
-- Run this entire script in Supabase Dashboard → SQL Editor → New query
-- Safe to re-run (drops existing policies first).
-- =============================================================================

-- 1. users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users FOR SELECT TO authenticated USING (id = auth.uid()::text);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE TO authenticated USING (id = auth.uid()::text) WITH CHECK (id = auth.uid()::text);

-- 2. promoters
ALTER TABLE public.promoters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "promoters_select_own" ON public.promoters;
CREATE POLICY "promoters_select_own" ON public.promoters FOR SELECT TO authenticated USING (id IN (SELECT id FROM public.promoter_profiles WHERE user_id = auth.uid()::text));

-- 3. promoter_profiles
ALTER TABLE public.promoter_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "promoter_profiles_select_own" ON public.promoter_profiles;
DROP POLICY IF EXISTS "promoter_profiles_update_own" ON public.promoter_profiles;
CREATE POLICY "promoter_profiles_select_own" ON public.promoter_profiles FOR SELECT TO authenticated USING (user_id = auth.uid()::text);
CREATE POLICY "promoter_profiles_update_own" ON public.promoter_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()::text) WITH CHECK (user_id = auth.uid()::text);

-- 4. promoter_auth
ALTER TABLE public.promoter_auth ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "promoter_auth_select_own" ON public.promoter_auth;
CREATE POLICY "promoter_auth_select_own" ON public.promoter_auth FOR SELECT TO authenticated USING (user_id = auth.uid()::text);

-- 5. events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "events_select_own_promoter" ON public.events;
CREATE POLICY "events_select_own_promoter" ON public.events FOR SELECT TO authenticated USING (promoter_id IN (SELECT id FROM public.promoter_profiles WHERE user_id = auth.uid()::text));

-- 6. tickets
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tickets_select_own" ON public.tickets;
CREATE POLICY "tickets_select_own" ON public.tickets FOR SELECT TO authenticated USING (user_id = auth.uid()::text);

-- 7. advertisements
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "advertisements_select_own_promoter" ON public.advertisements;
CREATE POLICY "advertisements_select_own_promoter" ON public.advertisements FOR SELECT TO authenticated USING (promoter_id IN (SELECT id FROM public.promoter_profiles WHERE user_id = auth.uid()::text));

-- 8. following
ALTER TABLE public.following ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "following_select_own" ON public.following;
CREATE POLICY "following_select_own" ON public.following FOR SELECT TO authenticated USING (user_id = auth.uid()::text);

-- 9. event_statistics
ALTER TABLE public.event_statistics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "event_statistics_select_own_events" ON public.event_statistics;
CREATE POLICY "event_statistics_select_own_events" ON public.event_statistics FOR SELECT TO authenticated USING (event_id IN (SELECT e.id FROM public.events e WHERE e.promoter_id IN (SELECT id FROM public.promoter_profiles WHERE user_id = auth.uid()::text)));

-- 10. push_tokens
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "push_tokens_select_own" ON public.push_tokens;
CREATE POLICY "push_tokens_select_own" ON public.push_tokens FOR SELECT TO authenticated USING (user_id = auth.uid()::text);

-- 11. notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid()::text);

-- 12. verification_codes (service_role only; no policy for authenticated/anon)
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- 13. payment_methods
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payment_methods_select_own" ON public.payment_methods;
CREATE POLICY "payment_methods_select_own" ON public.payment_methods FOR SELECT TO authenticated USING (user_id = auth.uid()::text);

-- 14. event_views
ALTER TABLE public.event_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "event_views_select_own" ON public.event_views;
CREATE POLICY "event_views_select_own" ON public.event_views FOR SELECT TO authenticated USING (user_id = auth.uid()::text);

-- 15. affiliates
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "affiliates_select_own" ON public.affiliates;
CREATE POLICY "affiliates_select_own" ON public.affiliates FOR SELECT TO authenticated USING (user_id = auth.uid()::text);

-- 16. affiliate_sales
ALTER TABLE public.affiliate_sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "affiliate_sales_select_own" ON public.affiliate_sales;
CREATE POLICY "affiliate_sales_select_own" ON public.affiliate_sales FOR SELECT TO authenticated USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()::text));

-- 17. event_bundles (service_role only; no policy for authenticated/anon)
ALTER TABLE public.event_bundles ENABLE ROW LEVEL SECURITY;

-- 18. price_alerts
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "price_alerts_select_own" ON public.price_alerts;
CREATE POLICY "price_alerts_select_own" ON public.price_alerts FOR SELECT TO authenticated USING (user_id = auth.uid()::text);

-- 19. identity_verifications
ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "identity_verifications_select_own" ON public.identity_verifications;
CREATE POLICY "identity_verifications_select_own" ON public.identity_verifications FOR SELECT TO authenticated USING (user_id = auth.uid()::text);

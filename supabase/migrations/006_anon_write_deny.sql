-- Belt-and-suspenders: explicitly deny INSERT / UPDATE / DELETE for the
-- anon role on every public table.
--
-- Why: today every mutation in the app goes through server actions that
-- use the service role key, which bypasses RLS. The anon client has only
-- SELECT permissive policies, so anon writes are already denied by
-- Postgres's default-deny behavior. BUT "default deny" only holds as
-- long as nobody adds a loose permissive policy by accident. A single
-- future migration like `FOR ALL TO anon USING (true)` would silently
-- blow this open.
--
-- RESTRICTIVE policies are AND'd with any permissive ones, so even if a
-- future permissive write policy is added, the anon RESTRICTIVE here
-- keeps anon writes blocked. Think of these as a lock on the door
-- independent of the doorknob.
--
-- Scope: every public table that exists today. The one exception is
-- newsletter_subscribers which legitimately accepts anon INSERT for the
-- public signup form — INSERT is left out there, only UPDATE/DELETE are
-- restricted. Adjust if a future table needs anon writes.
--
-- If this migration fails on a table that doesn't exist in this
-- environment, just comment it out; the policies are independent.

-- Helper to skip re-runs cleanly if any policy already exists.
DO $$
DECLARE
  t TEXT;
  insert_tables TEXT[] := ARRAY[
    'profiles',
    'productos',
    'colores',
    'variantes',
    'imagenes',
    'resenas',
    'compras',
    'stock_notifications',
    'faqs',
    'faq_questions',
    'gift_cards',
    'gift_card_definitions',
    'favoritos',
    'blog_posts',
    'cupones',
    'cupon_usos',
    'newsletter_campaigns'
  ];
  update_delete_tables TEXT[] := insert_tables || ARRAY['newsletter_subscribers'];
BEGIN
  -- Deny anon INSERT on every table except newsletter_subscribers.
  FOREACH t IN ARRAY insert_tables LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS "anon_deny_insert" ON public.%I', t
    );
    EXECUTE format(
      'CREATE POLICY "anon_deny_insert" ON public.%I AS RESTRICTIVE '
      'FOR INSERT TO anon WITH CHECK (false)', t
    );
  END LOOP;

  -- Deny anon UPDATE and DELETE on every table (including newsletter —
  -- anon can sign up but should not modify or remove subscriptions).
  FOREACH t IN ARRAY update_delete_tables LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS "anon_deny_update" ON public.%I', t
    );
    EXECUTE format(
      'CREATE POLICY "anon_deny_update" ON public.%I AS RESTRICTIVE '
      'FOR UPDATE TO anon USING (false) WITH CHECK (false)', t
    );

    EXECUTE format(
      'DROP POLICY IF EXISTS "anon_deny_delete" ON public.%I', t
    );
    EXECUTE format(
      'CREATE POLICY "anon_deny_delete" ON public.%I AS RESTRICTIVE '
      'FOR DELETE TO anon USING (false)', t
    );
  END LOOP;
END $$;

-- Documentation: the security model this codebase relies on.
COMMENT ON SCHEMA public IS
  'Write model: all mutations MUST go through server actions using the '
  'service role client (createServiceClient in src/lib/supabase/server.ts). '
  'The anon role has SELECT permissive policies for catalog tables only; '
  'all INSERT/UPDATE/DELETE by anon are explicitly denied by RESTRICTIVE '
  'policies in migration 006. The authenticated role is allowed to write '
  'to a narrow set of user-owned tables (favoritos, resenas, '
  'faq_questions, stock_notifications) via permissive policies scoped to '
  'user_id = auth.uid(). Adding any new permissive write policy for anon '
  'requires dropping the corresponding RESTRICTIVE policy deliberately.';

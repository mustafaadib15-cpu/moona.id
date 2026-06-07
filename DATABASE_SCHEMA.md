# Moona Client Portal - Database Schema (Supabase / PostgreSQL)

Two roles share one schema: `client` and `admin`. Clients see only rows tied to their own client account. Admins see everything. Access is enforced with Row Level Security on every table, using two SECURITY DEFINER helpers so policies never recurse on `profiles`.

Apply this whole file as the first migration. Never change a table without updating this doc.

## Conventions
- UUIDs for auth-linked rows; `BIGINT GENERATED ALWAYS AS IDENTITY` for content rows.
- `TIMESTAMPTZ` for all timestamps. Every table has `created_at` and `updated_at`.
- Index every foreign key.
- RLS enabled on every table immediately.

```sql
-- ============================================================
-- EXTENSIONS + SHARED HELPERS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- CLIENT ACCOUNTS  (one per engagement / company)
-- ============================================================
CREATE TYPE engagement_status AS ENUM ('active','paused','completed');

CREATE TABLE public.client_accounts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,                 -- contact full name, e.g. عبدالرحمن الطيفور
  company       TEXT,                          -- e.g. تأجيل
  role_title    TEXT,                          -- e.g. الرئيس التنفيذي
  plan_label    TEXT,                          -- e.g. باقة الحضور التنفيذي
  phase_label   TEXT,                          -- current engagement phase
  next_label    TEXT,                          -- next milestone, e.g. اجتماع المراجعة · الإثنين
  status        engagement_status NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER client_accounts_updated_at BEFORE UPDATE ON public.client_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- PROFILES  (extends auth.users; ties a user to a role + account)
-- ============================================================
CREATE TYPE user_role AS ENUM ('client','admin');

CREATE TABLE public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT NOT NULL,
  full_name   TEXT,
  role        user_role NOT NULL DEFAULT 'client',
  client_id   UUID REFERENCES public.client_accounts(id) ON DELETE SET NULL, -- null for admins
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX profiles_client_id_idx ON public.profiles(client_id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create a profile on signup. New users default to role 'client'.
-- Admins are promoted manually (UPDATE profiles SET role='admin' ...).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---- RLS HELPERS (SECURITY DEFINER avoids recursive policy checks) ----
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.current_client_id()
RETURNS UUID LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT client_id FROM public.profiles WHERE id = auth.uid();
$$;

-- ============================================================
-- CONTENT PLANS  ->  GROUPS  ->  POSTS
-- ============================================================
CREATE TABLE public.content_plans (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id    UUID NOT NULL REFERENCES public.client_accounts(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,                  -- تقويم المحتوى · يونيو ويوليو 2026
  period_label TEXT,                           -- 1 يونيو · 1 يوليو 2026
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','archived')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX content_plans_client_id_idx ON public.content_plans(client_id);
CREATE TRIGGER content_plans_updated_at BEFORE UPDATE ON public.content_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TYPE group_kind AS ENUM ('week','series');

CREATE TABLE public.content_groups (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  plan_id      BIGINT NOT NULL REFERENCES public.content_plans(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,                  -- الأسبوع الأول  /  سلسلة: ...
  kind         group_kind NOT NULL DEFAULT 'week',
  range_label  TEXT,                           -- من 1 يونيو إلى 6 يونيو  /  ثلاثة أجزاء · ...
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX content_groups_plan_id_idx ON public.content_groups(plan_id);
CREATE TRIGGER content_groups_updated_at BEFORE UPDATE ON public.content_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TYPE post_decision AS ENUM ('pending','approved','revision');

CREATE TABLE public.posts (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  plan_id       BIGINT NOT NULL REFERENCES public.content_plans(id) ON DELETE CASCADE,
  group_id      BIGINT NOT NULL REFERENCES public.content_groups(id) ON DELETE CASCADE,
  seq           INTEGER NOT NULL,              -- chronological number across the plan (01..16)
  day_label     TEXT,                          -- الإثنين
  post_date     TEXT,                          -- kept as label "1 - 6 - 2026" to preserve source formatting
  subject       TEXT NOT NULL,                 -- الموضوع
  why_now       TEXT,                          -- لماذا هو مهم الآن
  content_form  TEXT,                          -- شكل المحتوى
  hook          TEXT NOT NULL,                 -- الخطّاف
  body          JSONB NOT NULL DEFAULT '[]',   -- array of paragraph strings, verbatim
  tags          TEXT,                          -- hashtags line
  part_label    TEXT,                          -- الجزء الأول (series only), nullable
  decision      post_decision NOT NULL DEFAULT 'pending',
  decided_at    TIMESTAMPTZ,
  decided_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX posts_plan_id_idx  ON public.posts(plan_id);
CREATE INDEX posts_group_id_idx ON public.posts(group_id);
CREATE TRIGGER posts_updated_at BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Threaded notes on a post (client + admin can both write). One latest note is
-- enough for MVP UI, but store as a thread for history.
CREATE TABLE public.post_comments (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id     BIGINT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id   UUID REFERENCES auth.users(id),
  author_role user_role NOT NULL,
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX post_comments_post_id_idx ON public.post_comments(post_id);

-- ============================================================
-- DELIVERABLES
-- ============================================================
CREATE TYPE deliverable_status AS ENUM ('delivered','in_review','upcoming');

CREATE TABLE public.deliverables (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id    UUID NOT NULL REFERENCES public.client_accounts(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  status       deliverable_status NOT NULL DEFAULT 'upcoming',
  date_label   TEXT,                           -- مايو 2026
  file_url     TEXT,                            -- Supabase Storage path, nullable
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX deliverables_client_id_idx ON public.deliverables(client_id);
CREATE TRIGGER deliverables_updated_at BEFORE UPDATE ON public.deliverables
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- Pattern: admins full access; clients limited to their own client_id.
-- ============================================================
ALTER TABLE public.client_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_plans   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_groups  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables    ENABLE ROW LEVEL SECURITY;

-- profiles: a user reads/updates own profile; admins read all
CREATE POLICY profiles_self_select ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_admin());
CREATE POLICY profiles_self_update ON public.profiles FOR UPDATE
  USING (id = auth.uid());
CREATE POLICY profiles_admin_write ON public.profiles FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- client_accounts
CREATE POLICY ca_client_read ON public.client_accounts FOR SELECT
  USING (public.is_admin() OR id = public.current_client_id());
CREATE POLICY ca_admin_all ON public.client_accounts FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- content_plans
CREATE POLICY cp_client_read ON public.content_plans FOR SELECT
  USING (public.is_admin() OR client_id = public.current_client_id());
CREATE POLICY cp_admin_all ON public.content_plans FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- content_groups (scoped through its plan)
CREATE POLICY cg_client_read ON public.content_groups FOR SELECT
  USING (public.is_admin() OR EXISTS (
    SELECT 1 FROM public.content_plans p
    WHERE p.id = plan_id AND p.client_id = public.current_client_id()));
CREATE POLICY cg_admin_all ON public.content_groups FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- posts: clients read own; clients may UPDATE only decision-related columns
CREATE POLICY posts_client_read ON public.posts FOR SELECT
  USING (public.is_admin() OR EXISTS (
    SELECT 1 FROM public.content_plans p
    WHERE p.id = plan_id AND p.client_id = public.current_client_id()));
CREATE POLICY posts_client_decide ON public.posts FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.content_plans p
    WHERE p.id = plan_id AND p.client_id = public.current_client_id()))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.content_plans p
    WHERE p.id = plan_id AND p.client_id = public.current_client_id()));
-- NOTE: restrict editable columns to decision/decided_at/decided_by via a
-- Server Action that only sets those fields. Do not expose full post UPDATE in UI.
CREATE POLICY posts_admin_all ON public.posts FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- post_comments: read if you can read the post; clients insert their own notes
CREATE POLICY pc_read ON public.post_comments FOR SELECT
  USING (public.is_admin() OR EXISTS (
    SELECT 1 FROM public.posts po JOIN public.content_plans p ON p.id = po.plan_id
    WHERE po.id = post_id AND p.client_id = public.current_client_id()));
CREATE POLICY pc_client_insert ON public.post_comments FOR INSERT
  WITH CHECK (author_id = auth.uid() AND (public.is_admin() OR EXISTS (
    SELECT 1 FROM public.posts po JOIN public.content_plans p ON p.id = po.plan_id
    WHERE po.id = post_id AND p.client_id = public.current_client_id())));
CREATE POLICY pc_admin_all ON public.post_comments FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- deliverables
CREATE POLICY dl_client_read ON public.deliverables FOR SELECT
  USING (public.is_admin() OR client_id = public.current_client_id());
CREATE POLICY dl_admin_all ON public.deliverables FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());
```

## Type Generation
After applying, run `supabase gen types typescript --linked > src/lib/database.types.ts` and import the generated types in all queries.

## Notes for the build
- Client approve / request-edit writes only `decision`, `decided_at`, `decided_by` via a Server Action. The client comment is an INSERT into `post_comments`.
- Inviting a client: admin creates a `client_accounts` row, invites the user by email (Supabase `inviteUserByEmail`), then sets that profile's `client_id` to the account and keeps `role = 'client'`.
- Promote an admin once, by hand, in SQL: `UPDATE public.profiles SET role='admin' WHERE email='you@moona.id';`

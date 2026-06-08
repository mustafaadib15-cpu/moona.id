-- ============================================================
-- MOONA CLIENT PORTAL — FULL SETUP (run once in the Supabase SQL Editor)
-- 1) schema  2) seed content (verbatim Arabic). Admin user is created
--    and promoted afterwards via the Admin API, so no email edit needed.
-- ============================================================

-- Moona Client Portal — initial schema (see DATABASE_SCHEMA.md).
-- Two roles share one schema: client and admin. Clients see only rows tied to
-- their own client account. Admins see everything. RLS on every table, using
-- two SECURITY DEFINER helpers so policies never recurse on profiles.

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

-- ============================================================
-- SEED
-- ============================================================

-- Seed: Abdulrahman AlTaifour (Taajeel) full content plan + deliverables,
-- plus a second empty client for testing the empty state.
-- Arabic content is verbatim. Do not edit any word, mark, or numbering.

DO $$
DECLARE
  v_client uuid; v_client2 uuid; v_plan bigint;
  g_1 bigint; g_2 bigint; g_3 bigint; g_4 bigint; g_5 bigint;
BEGIN
  INSERT INTO public.client_accounts(name,company,role_title,plan_label,phase_label,next_label,status)
  VALUES ($m$عبدالرحمن الطيفور$m$,$m$تأجيل$m$,$m$الرئيس التنفيذي$m$,$m$باقة الحضور التنفيذي$m$,$m$تحسين الحضور على لينكدإن$m$,$m$اجتماع المراجعة · الإثنين$m$,'active') RETURNING id INTO v_client;
  INSERT INTO public.content_plans(client_id,title,period_label,status)
  VALUES (v_client,$m$تقويم المحتوى · يونيو ويوليو 2026$m$,$m$1 يونيو · 1 يوليو 2026$m$,'active') RETURNING id INTO v_plan;
  INSERT INTO public.content_groups(plan_id,name,kind,range_label,sort_order)
  VALUES (v_plan,$m$الأسبوع الأول$m$,'week',$m$من 1 يونيو إلى 6 يونيو$m$,1) RETURNING id INTO g_1;
  INSERT INTO public.content_groups(plan_id,name,kind,range_label,sort_order)
  VALUES (v_plan,$m$سلسلة: كيف تجذب السعودية المستثمر العالمي في زمن الأزمات$m$,'series',$m$ثلاثة أجزاء مترابطة · 3 يونيو · 7 يونيو · 15 يونيو$m$,2) RETURNING id INTO g_2;
  INSERT INTO public.content_groups(plan_id,name,kind,range_label,sort_order)
  VALUES (v_plan,$m$الأسبوع الثاني$m$,'week',$m$من 7 يونيو إلى 13 يونيو$m$,3) RETURNING id INTO g_3;
  INSERT INTO public.content_groups(plan_id,name,kind,range_label,sort_order)
  VALUES (v_plan,$m$الأسبوع الثالث$m$,'week',$m$من 15 يونيو إلى 21 يونيو$m$,4) RETURNING id INTO g_4;
  INSERT INTO public.content_groups(plan_id,name,kind,range_label,sort_order)
  VALUES (v_plan,$m$الأسبوع الرابع والأخير$m$,'week',$m$من 23 يونيو إلى 1 يوليو$m$,5) RETURNING id INTO g_5;
  INSERT INTO public.posts(plan_id,group_id,seq,day_label,post_date,subject,why_now,content_form,hook,body,tags,part_label)
  VALUES (v_plan,g_1,1,$m$الإثنين$m$,$m$1 - 6 - 2026$m$,$m$تفكيك صفقة انسحاب بو مالح من ثمانية.$m$,$m$ترند الساعة إدارياً وإعلامياً في الخليج.$m$,$m$منشور تحليلي طويل (Long-form).$m$,$m$مأسسة الإبداع: ماذا بعد انسحاب بو مالح من ثمانية؟$m$,$j$["خبر خروج المبدع عبد الرحمن بو مالح من إدارة \"ثمانية\" لم يكن مجرد خبر عادي في الأوساط الإعلامية، بل هو \"دراسة حالة\" (Case Study) عميقة في علم إدارة المشاريع واستمرارية الأعمال (Business Continuity).", "أكبر تحدٍّ يواجه الشركات القائمة على \"المحتوى والإبداع\" هو فخ \"الرجل الأيقونة\" (The Icon Trap). عندما يرتبط اسم البراند بوجه واحد، يصبح خروج هذا الوجه خطراً استراتيجياً يهدد قيمة الشركة.", "ولكن، لماذا أرى أن هذا الانسحاب هو علامة نضج مؤسسي وليس تعثراً؟", "1- مأسسة الإبداع: نجاح \"ثمانية\" في بناء نظام تشغيلي (System) مستقل عن الأفراد طوال السنوات الماضية هو ما جعلها جاذبة للاستحواذ أصلاً.", "2- استراتيجية الخروج (Exit Strategy): القائد الذكي هو من يبني منظومة تستطيع النمو والعمل بكفاءة حتى لو قرر هو الترجل من منصبه.", "3- انتقال القيادة السلس: الإعلان الهادئ والمنظم يعكس وجود خطط تعاقب (Succession Planning) مدروسة مسبقاً.", "كمؤسس أو مدير مشروع.", "هل بنيت منظومتك لتعتمد على \"وجودك الدائم\"، أم لتستمر وتكبر في غيابك؟", "كل التوفيق لبو مالح في رحلته القادمة، ولـ \"ثمانية\" في فصلها الجديد."]$j$::jsonb,$m$#إدارة_المشاريع #استمرارية_الأعمال #ثمانية #قيادة$m$,NULL);
  INSERT INTO public.posts(plan_id,group_id,seq,day_label,post_date,subject,why_now,content_form,hook,body,tags,part_label)
  VALUES (v_plan,g_1,3,$m$الجمعة$m$,$m$5 - 6 - 2026$m$,$m$قصة شخصية عن خطأ إداري قديم.$m$,$m$حس إنساني وبناء أصالة وثقة مع المتابعين.$m$,$m$أسلوب قصصي (Storytelling).$m$,$m$الاعتراف الصعب: خطأ إداري كلفني عميلاً وعلّمني قيادة الفريق..$m$,$j$["في بداياتي كمدير مشاريع، كنت مؤمناً بأن \"النتائج هي كل شيء\". وفي أحد المشاريع الحساسة، وقع ضغط كبير من العميل لتعديل المخرجات في وقت قياسي.", "بدلاً من حماية فريقي، قمت بنقل الضغط مباشرة إليهم. ألغيت الإجازات، وزدت ساعات العمل، وكنت أتابع أدق التفاصيل بصرامة (Micromanagement).", "النتيجة؟ تسلم المشروع في وقته، ولكن: انهار شغف الفريق، استقال مهندس أساسي بعد أسبوع، وخسرنا العميل نفسه في المشروع التالي لأن الروح الإبداعية في العمل اختفت!", "يومها تعلمت درساً قاسياً: \"المدير الفاشل يحمي الأرقام على حساب البشر، والقائد الناجح يحمي البشر وهم من يحمون له الأرقام.\"", "المشاريع تنتهي وتُسلم، ولكن ثقافة الفريق وعلاقته بك هي رأس مالك الحقيقي المستدام.", "جمعة مباركة، وأتمنى لكم ولفرقكم عطلة أسبوع مريحة."]$j$::jsonb,$m$#قصص_إدارية #قيادة_الفريق #الإنسان_أولاً #إدارة_المشاريع$m$,NULL);
  INSERT INTO public.posts(plan_id,group_id,seq,day_label,post_date,subject,why_now,content_form,hook,body,tags,part_label)
  VALUES (v_plan,g_2,2,$m$الأربعاء$m$,$m$3 - 6 - 2026$m$,$m$كيف تجذب السعودية كبار المستثمرين في زمن الأزمات (جزء 1).$m$,$m$تثقيفي رسمي يستعرض القوة الاقتصادية للمملكة.$m$,$m$منشور رسمي مدعم بالحقائق.$m$,$m$عندما تتصاعد الأحداث وتتوتر الأسواق: كيف تجذب السعودية كبار المستثمرين في زمن الأزمات؟ (1/3)$m$,$j$["في عالم المال والأعمال، هناك قاعدة ذهبية: \"رأس المال جبان، لكنه يبحث دائماً عن الملاذ الآمن\".", "في وقت تشهد فيه الساحة الدولية والجيوسياسية تقلبات كبرى، نرى تدفقاً مستمراً لكبار المستثمرين والشركات العالمية نحو المملكة العربية السعودية. هذا ليس وليد الصدفة، بل هو نتيجة هندسة استراتيجية دقيقة لبيئة المخاطر (Risk Management).", "كيف تحولت المخاطر الإقليمية إلى فرص جاذبة في المملكة؟", "1- الاستقرار التشريعي: المستثمر الأجنبي لا يخاف من الضرائب بقدر ما يخاف من المفاجأة فوضوح القوانين الاستثمارية وتطوير البيئة العدلية التجارية في المملكة وفّر \"عنصر التنبؤ\" الهام للمشاريع المليارية.", "وذلك عن طريق توفر العنصر النادر في ظل تصاعد الأحداث وهو \"الأمان\"، والبيئة المستقرة للأحداث.", "2- الحوكمة الشفافة: تطبيق معايير عالمية في مكافحة البيروقراطية وسرعة إصدار التراخيص قلص \"زمن الاستجابة للأسواق\" (Time to Market).", "عندما تنجح في تحويل البيئة المحيطة بك إلى منطقة \"صفر مفاجآت\"، سيتسابق إليك العمالقة حتى في أشد الأوقات حرجاً.", "في المنشور القادم، سنتحدث عن دور الصناديق السيادية كأداة تحوط وجذب."]$j$::jsonb,$m$#رؤية_السعودية_2030 #الاستثمار_الأجنبي #إدارة_المخاطر #اقتصاد$m$,$m$الجزء الأول$m$);
  INSERT INTO public.posts(plan_id,group_id,seq,day_label,post_date,subject,why_now,content_form,hook,body,tags,part_label)
  VALUES (v_plan,g_2,4,$m$الأحد$m$,$m$7 - 6 - 2026$m$,$m$أمن الطاقة والتحوط السيادي (جزء 2).$m$,$m$بناء سلطة معرفية (Authority) كخبير استراتيجي.$m$,$m$منشور رسمي رصين.$m$,$m$أمن الطاقة والتحوط السيادي: السعودية والمستثمر الأجنبي (2/3)$m$,$j$["عندما ينظر المستثمر العالمي إلى مشاريع الرؤية في المملكة، هو لا يرى مجرد مبانٍ شاهقة أو مدن ذكية، بل يرى \"منظومة تحوط استراتيجي\" (Strategic Hedging) متكاملة ضد تقلبات الاقتصاد التقليدي.", "في الجزء الثاني من سلسلتنا، نناقش كيف تدار المخاطر في مشاريع بمليارات الدولارات:", "1- تنويع المحفظة الاستثمارية (Portfolio Diversification): من خلال صندوق الاستثمارات العامة (PIF)، نجحت المملكة في عدم وضع البيض كله في سلة النفط، مما أعطى مرونة (Resilience) مالية للمشاريع الكبرى مثل نيوم والقدية والبحر الأحمر.", "2- دمج الطاقة المتجددة بالصناعات الثقيلة: ربط المدن الصناعية الجديدة (مثل مدن الهيدروجين الأخضر) بالطاقة المستدامة، يضمن للمستثمر خفض تكاليف التشغيل على المدى الطويل ويحميه من تقلبات أسعار الطاقة العالمية.", "إدارة المشاريع العملاقة (Mega Projects) تتطلب نَفَساً استراتيجياً يرى أثر القرار الاستثماري بعد 10 و 20 سنة من الآن.", "في المنشور القادم، نختم السلسلة بالحديث عن كيفية تهيئة المشاريع المحلية لتكون \"جاهزة للاستثمار العالمي\"."]$j$::jsonb,$m$#صندوق_الاستثمارات_العامة #إدارة_المحافظ #رؤية_2030 #استراتيجية$m$,$m$الجزء الثاني$m$);
  INSERT INTO public.posts(plan_id,group_id,seq,day_label,post_date,subject,why_now,content_form,hook,body,tags,part_label)
  VALUES (v_plan,g_2,8,$m$الإثنين$m$,$m$15 - 6 - 2026$m$,$m$كيف تبني الشركات المحلية آلية دفاع تجذب المستثمر (جزء 3).$m$,$m$تقديم حلول عملية واختتام السلسلة الاقتصادية.$m$,$m$منشور ملخص بنقاط تنفيذية (Actionable).$m$,$m$المستثمر لا يبحث عن فكرة.. يبحث عن "آلية دفاع" (3/3 والأخير)$m$,$j$["نختم سلسلتنا حول جذب الاستثمارات بالسؤال الأهم لكل صاحب شركة أو مشروع محلي: كيف تهيئ منظومتك لتكون شريكاً جذاباً للعمالقة الداخليين أو الدوليين في المملكة؟", "المستثمر الذكي لا يشتري أفكاراً، بل يشتري \"أنظمة تشغيل مرنة\" (Scalable Systems). إليك 3 ركائز يجب بناؤها في مشروعك الآن:", "- مأسسة العمليات (Process Institutionalization): تأكد أن طريقة سير العمل موثقة بوضوح (SOPs) وليست محفوظة في عقول الموظفين فقط. إذا غاب شخص، لا يجب أن يقف المشروع.", "- إدارة المخاطر الاستباقية: أظهر للمستثمر أنك تملك (Plan B) جاهزة ومسعرة لكل خطر محتمل (تأخر سلاسل الإمداد، تغير القوانين، تقلبات السوق).", "- الحوكمة والشفافية المالية: التقارير المالية المنظمة والمدققة تعطي انطباعاً فورياً بالجدية وتقلل من فترات الفحص النافي للجهالة (Due Diligence).", "عندما تبني مشروعك بعقلية \"المؤسسة العالمية\" منذ اليوم الأول، ستجد أن رؤوس الأموال هي من تبحث عنك.", "يمكنك قراءة الأجزاء السابقة عبر ملفي الشخصي."]$j$::jsonb,$m$#تطوير_الأعمال #الحوكمة #جذب_الاستثمار #استراتيجية_الشركات$m$,$m$الجزء الثالث$m$);
  INSERT INTO public.posts(plan_id,group_id,seq,day_label,post_date,subject,why_now,content_form,hook,body,tags,part_label)
  VALUES (v_plan,g_3,5,$m$الثلاثاء$m$,$m$9 - 6 - 2026$m$,$m$العميل يطلب تعديلاً ينسف الجدول الزمني قُبيل التسليم بـ 48 ساعة.$m$,$m$نقاش تفاعلي يمس معضلة يومية لكل المدراء.$m$,$m$سؤال مفتوح للجمهور لرفع التفاعل.$m$,$m$معضلة الثلاثاء: عندما يطلب العميل تعديلاً ينسف الجدول الزمني قبل التسليم بـ 48 ساعة$m$,$j$["السيناريو المتكرر: المشروع شارف على الانتهاء، الفريق مستنزف وينتظر لحظة الإغلاق، فجأة يصل إيميل من العميل: \"نريد تغيير هذه الخاصية الجوهرية، ونريد التسليم في نفس الموعد\"", "كيف تتصرف كمدير مشروع دون أن تخسر العميل ودون أن تكسر ظهر الفريق؟", "من تجربتي، كلمة \"نعم\" الفورية هي انتحار مهني، وكلمة \"لا\" الجافة هي خسارة تسويقية. الحل يكمن في \"إدارة التوقعات\" (Expectation Management) من خلال مثلث إدارة المشاريع الشهير (نطاق العمل، الوقت، التكلفة):", "أهلاً بالعميل، هذا التغيير رائع وسيضيف قيمة (مرحلة الاستيعاب).", "ولكن، تطبيق هذا التعديل يتطلب (X) من الساعات الإضافية، وبالتالي تمديد موعد التسليم لـ (Y) أو ميزانية إضافية لفرز موارد جديدة (مرحلة لغة الأرقام).", "الخيار لك: هل نسلم النسخة الحالية في موعدها ونؤجل التعديل للمرحلة القادمة، أم نعدل الخطة الآن؟", "عندما تضع العميل أمام \"التبعات والخيارات\" بالأرقام، يتحول من موقف \"المطالب\" إلى موقف \"الشريك في القرار\".", "شاركوني في التعليقات: كيف تتعاملون مع طلبات اللحظات الأخيرة؟"]$j$::jsonb,$m$#نطاق_العمل #إدارة_العملاء #ScopeCreep #LinkedInEngagement$m$,NULL);
  INSERT INTO public.posts(plan_id,group_id,seq,day_label,post_date,subject,why_now,content_form,hook,body,tags,part_label)
  VALUES (v_plan,g_3,6,$m$الخميس$m$,$m$11 - 6 - 2026$m$,$m$إعادة هيكلة وتأخير بعض المشاريع في المملكة.$m$,$m$قراءة إدارية ذكية لقضية اقتصادية ساخنة.$m$,$m$تحليل استراتيجي بلغة الـ Business.$m$,$m$المشاريع الكبرى في المملكة: لماذا يعتبر "التأجيل" أحياناً ذروة النجاح الاستراتيجي؟$m$,$j$["يرى البعض في قرار إعادة هيكلة أو تمديد الجداول الزمنية لبعض المشاريع الكبرى في المملكة علامة تعثر، بينما يراها خبراء إدارة المشاريع الحقيقيون علامة \"نضج ونمو متسارع\".", "في علم إدارة المحافظ الاستراتيجية (Portfolio Management)، الإصرار على تنفيذ كل شيء بالتوازي رغم تغير المعطيات الاقتصادية هو الفشل بعينه.", "لماذا تعد إعادة الهيكلة الحالية خطوة ذكية؟", "1- إعادة توازن الموارد (Resource Leveling): الضغط على المقاولين والمواد والمواهب البشرية في وقت واحد يرفع التكاليف ويقلل الجودة. التمهل يمنح السوق فرصة للتنفس والاستيعاب.", "2- ترتيب الأولويات الاستراتيجية: التركيز على المشاريع ذات العائد السريع والأثر المباشر في المرحلة الحالية يدعم استدامة التدفقات النقدية للمشاريع الأكثر تعقيداً لاحقاً.", "3- مرونة التخطيط (Agility): الخطط الاستراتيجية ليست قرآناً منزلاً؛ القدرة على المناورة والمراجعة هي ما يميز الإدارات المرنة عن الإدارات البيروقراطية الجامدة.", "العبرة ليست بمن ينتهي أولاً، بل بمن يبني بجودة مستدامة تخدم الأجيال القادمة."]$j$::jsonb,$m$#المشاريع_العملاقة #إعادة_الهيكلة #التخطيط_الاستراتيجي #كفاءة_الإنفاق$m$,NULL);
  INSERT INTO public.posts(plan_id,group_id,seq,day_label,post_date,subject,why_now,content_form,hook,body,tags,part_label)
  VALUES (v_plan,g_3,7,$m$السبت$m$,$m$13 - 6 - 2026$m$,$m$الضغط النفسي والإداري الذي يتعرض له المدراء.$m$,$m$حس إنساني يلامس مشاعر القادة والمدراء التنفيذيين.$m$,$m$منشور وجداني/تأملي (Reflective).$m$,$m$الحكمة الصامتة: خلف كل مدير صارم حكاية لا يعرفها الموظفون.$m$,$j$["في عالم الشركات، غالباً ما يتم تصوير \"المدير\" على أنه الشخص المرتاح الذي يوزع المهام ويراقب العقارب. لكن الواقع الذي نعيشه في غرف الاجتماعات المغلقة مختلف تماماً.", "المدير الذكي يعيش دائماً بين مطرقة الإدارة العليا (التي تطالب بأرقام ومستهدفات شبه مستحيلة)، وسندان الفريق (الذي يعاني من الضغط ويطلب الدعم والمرونة).", "- عندما يواجه مجلس الإدارة لحماية ميزانية فريقه.. لا أحد يرى.", "- عندما يقضي ليلته يفكر في كيفية تجنب تسريح موظف قصرت أرقامه.. لا أحد يرى.", "- عندما يمتص غضب عميل ثائر ليبقى فريقه في بيئة عمل هادئة.. لا أحد يرى.", "الإدارة ليست سلطة، الإدارة هي \"امتصاص الصدمات\".", "وتحية لكل قائد يحمل عبء حماية فريقه بصمت، ويظهر لهم مبتسماً كل صباح ليقودهم نحو النجاح.", "زملائي المدراء.. كيف توازنون بين ضغط الأرقام وإنسانية القيادة؟"]$j$::jsonb,$m$#صناع_القرار #البيئة_المؤسسية #الصحة_المهنية #القيادة_بالإيجابية$m$,NULL);
  INSERT INTO public.posts(plan_id,group_id,seq,day_label,post_date,subject,why_now,content_form,hook,body,tags,part_label)
  VALUES (v_plan,g_4,9,$m$الأربعاء$m$,$m$17 - 6 - 2026$m$,$m$هل يقضي الذكاء الاصطناعي على مدراء المشاريع؟$m$,$m$مواكبة ترند التقنية وربطه بالجانب الإنساني.$m$,$m$منشور نقاشي مدعم بأمثلة.$m$,$m$هل يقضي الذكاء الاصطناعي على مدراء المشاريع؟ (الرد الحقيقي)$m$,$j$["مع التطور المتسارع لأدوات الذكاء الاصطناعي وقدرتها على جدولة المهام، كتابة التقارير، وتوقع الميزانيات بدقة مذهلة، يتردد سؤال مقلق: هل سنصبح خارج الخدمة قريباً؟", "الإجابة المختصرة: الذكاء الاصطناعي لن يستبدل مدير المشروع، بل سيستبدل المدير الذي لا يستخدم الذكاء الاصطناعي.", "الأتمتة (Automation) ستأخذ منا الجانب الجاف والبيروقراطي من الوظيفة:", "- صياغة جداول الـ Gantt وتتبع الـ KPIs.", "- كتابة محاضر الاجتماعات وتحديث مصفوفة المخاطر.", "لكن، ما الذي لا يمكن للذكاء الاصطناعي أتمتته؟", "- قراءة ما بين السطور: نبرة صوت موظف محبط يحتاج إلى دعم.", "- فن التفاوض: إقناع عميل متردد بقرار استراتيجي صعب.", "- بناء الثقافة والولاء: تحفيز الفريق عندما تنهار المعنويات في منتصف المشروع.", "ميزتنا التنافسية القادمة هي \"إنسانيتنا ومهاراتنا الناعمة\" (Soft Skills). استخدم الأدوات لتتحرر من الأوراق، وتتفرغ لقيادة البشر.", "ما هي أكثر أداة ذكاء اصطناعي ساعدتكم في إدارة مشاريعكم مؤخراً؟"]$j$::jsonb,$m$#الذكاء_الاصطناعي #مستقبل_العمل #إدارة_المشاريع #المهارات_الناعمة$m$,NULL);
  INSERT INTO public.posts(plan_id,group_id,seq,day_label,post_date,subject,why_now,content_form,hook,body,tags,part_label)
  VALUES (v_plan,g_4,10,$m$الجمعة$m$,$m$19 - 6 - 2026$m$,$m$انصر فريقك في العلن، وعاتبه في السر.$m$,$m$حكمة وأخلاقيات قيادية تعزز فلسفة "أنسنة الإدارة".$m$,$m$منشور قصير ومباشر (Quote-style).$m$,$m$"انصر فريقك في العلن.. وعاتبه في السر."$m$,$j$["واحدة من أثمن القواعد الإدارية التي تحول \"المدير\" إلى \"قائد\" يفتديه فريقه.", "عندما يخطئ أحد أعضاء فريقك في اجتماع مع أطراف خارجية أو إدارة عليا:", "- إياك أن تلومه أو توبخه أمامهم لتبرئ نفسك. مسؤوليته هي مسؤوليتك أنت أولاً وأخيراً أمام الجميع. دافع عنه، خذ الرصاصة بدلاً منه، وتعهد بإصلاح الأمر.", "وعندما تغلقون باب مكتبكم الخاص:", "هنا يأتي وقت الحساب، التوجيه، وتفكيك الخطأ بصرامة وحب، ليتعلم ويفهم كيف لا يكررها.", "الأمان النفسي (Psychological Safety) الذي تمنحه لفريقك في لحظات الخطأ، هو الذي يصنع ولاءهم، وهو الذي يجعلهم يقدمون 200% من طاقتهم في الأوقات الحرجة لأنهم يعلمون أن خلفهم \"ظهر يحميهم\".", "جمعة طيبة ومباركة للجميع."]$j$::jsonb,$m$#أخلاقيات_القيادة #الأمان_النفسي #بناء_الفرق #ثقافة_العمل$m$,NULL);
  INSERT INTO public.posts(plan_id,group_id,seq,day_label,post_date,subject,why_now,content_form,hook,body,tags,part_label)
  VALUES (v_plan,g_4,11,$m$الأحد$m$,$m$21 - 6 - 2026$m$,$m$هندسة الأولويات لإنقاذ مشروع متعثر.$m$,$m$دليل تثقيفي بحت يقدم قيمة عملية ممتازة للحفظ والـ Share.$m$,$m$دليل خطوة بخطوة (How-to Guide).$m$,$m$هندسة الأولويات: كيف تنقذ مشروعاً يغرق بسبب سوء الهيكلة؟$m$,$j$["إذا استلمت إدارة مشروع متعثر، الميزانية تنزف، المواعيد تتأخر، والمعنويات في الحضيض.. لا تبدأ بالصراخ أو زيادة ساعات العمل. ابدأ بـ \"إعادة الهندسة\" عبر هذه الخطوات الثلاث:", "1- تجميد النطاق (Scope Freeze): أوقف فوراً استقبال أي طلبات تعديل جديدة من العميل. ركز فقط على \"الحد الأدنى من المخرجات الصالحة للتشغيل\" (MVP) لتعيد للمشروع توازنه.", "3- إعادة فرز الموارد (Resource Audit): غالباً ما يكون التعثر بسبب وضع الشخص المناسب في المكان غير المناسب، أو تحميل مهندس واحد فوق طاقته بينما الآخرون في حالة انتظار. أعد توزيع المهام بناءً على الكفاءة اللحظية لا المسميات الجافة.", "4- شفافية التواصل (Over-communication): اعقد اجتماعاً صريحاً مع العميل والممولين. اعرض الواقع بالأرقام، وقدم الخطة الجديدة المعدلة. الصدمة بالحقائق الآن أفضل بكثير من الخيبة عند نهاية الموعد.", "إنقاذ المشاريع لا يحتاج إلى معجزات، يحتاج إلى شجاعة إدارية لرسم خط أحمر، والبدء من جديد بترتيب أولويات صحيح.", "انصح بحفظ المنشور للرجوع إليه عند الحاجة لتعديل مسار مشاريعكم."]$j$::jsonb,$m$#إدارة_الأزمات #إنقاذ_المشاريع #إعادة_الهيكلة #دليل_عملي$m$,NULL);
  INSERT INTO public.posts(plan_id,group_id,seq,day_label,post_date,subject,why_now,content_form,hook,body,tags,part_label)
  VALUES (v_plan,g_5,12,$m$الثلاثاء$m$,$m$23 - 6 - 2026$m$,$m$المدير الـ Micromanager: هل هو صعب أم ضحية؟$m$,$m$قضايا ترند إداري دائم الجاذبية، يطرح زاوية إنسانية مختلفة.$m$,$m$منشور نقاشي يوازن بين وجهتي نظر.$m$,$m$المدير الـ Micromanager: هل هو شرير أم ضحية؟$m$,$j$["نهاجم جميعاً المدير الذي يتدخل في تفاصيل التفاصيل، ويدقق في لون الخط، ويطلب إيميل إشعار عند كل حركة. نراه \"ديكتاتوراً\" يدمر الإبداع والإنتاجية.", "ولكن، هل جربنا يوماً أن نضع أنفسنا مكانه لنفهم \"لماذا\" يفعل ذلك؟", "في كثير من الأحيان، الـ Micromanager هو ضحية لـ:", "- غياب نظام الحوكمة: لا توجد آليات متابعة واضحة في الشركة، فيشعر أن الطريقة الوحيدة لضمان العمل هي مراقبته يدوياً.", "- تجارب سابقة قاسية: ربما وثق بفريق سابق وتلقى صدمة أو خسارة فادحة كادت تنهي مسيرته المهنية.", "- ضغط الإدارة العليا: عندما يكون المدير واقعاً تحت تهديد المحاسبة الشديدة، يتحول خوفه تلقائياً إلى رغبة في السيطرة الكاملة على التفاصيل لتقليل نسبة الخطأ.", "العلاج ليس في كره هذا المدير، بل في إعطائه \"مصل الأمان البصري\"؛ أطلعه على سير العمل قبل أن يطلب منك، أثبت له بدقة الأرقام أنك ممسك بزمام الأمور، وسترى كيف سيتراجع خطوة للخلف تدريجياً ليتنفس وتتنفس معه.", "هل واجهتم مديراً من هذا النوع؟ وكيف نجحتم في كسب ثقته؟"]$j$::jsonb,$m$#بيئة_العمل #الإنتاجية #الثقة_المؤسسية #تطوير_الذات$m$,NULL);
  INSERT INTO public.posts(plan_id,group_id,seq,day_label,post_date,subject,why_now,content_form,hook,body,tags,part_label)
  VALUES (v_plan,g_5,13,$m$الخميس$m$,$m$25 - 6 - 2026$m$,$m$المقارنة بين الـ KPI والـ KBI.$m$,$m$مكس استراتيجي جامد + لمسة إنسانية مبتكرة تظهره كمجدد في الفكر الإداري.$m$,$m$منشور فكري مقارن.$m$,$m$بين الـ KPI والـ KBI: لماذا نسينا مؤشرات السلوك الإنساني؟$m$,$j$["نقضي كمدراء مشاريع ساعات طويلة في مراقبة مؤشرات الأداء الرئيسية (KPIs) لضمان الأرقام والمستهدفات. ولكن، هل فكرنا يوماً بمراقبة مؤشرات السلوك الرئيسية (KBIs - Key Behavior Indicators)؟", "الأرقام قد تخبرك أن المشروع يسير في وقته (KPI ممتاز)، ولكنها لن تخبرك أن الفريق يمر بحالة \"احتراق وظيفي صامت\" قد تجعلهم يستقيلون جميعاً فور تسليم المشروع!", "موازنة القائد الذكي تعتمد على الطرفين:", "- الـ KPI: يقيس (ماذا) حققنا؟ (أرقام، تسليمات، ميزانيات).", "- الـ KBI: يقيس (كيف) حققناه؟ (مستوى التعاون، الأمان النفسي، نبرة التواصل في الأزمات، الالتزام الطوعي).", "إذا ركزت على الـ KPI وحده، ستحصل على نجاحات قصيرة المدى بفريق ممزق. وإذا ركزت على الـ KBI وحده، ستحصل على فريق سعيد بمشاريع خاسرة ومتأخرة.", "الدمج بين رصانة الأرقام وأنسنة السلوك هو سر ديمومة واستدامة الشركات الكبرى."]$j$::jsonb,$m$#مؤشرات_الأداء #أنسنة_الإدارة #KBIs #التطوير_المؤسسي$m$,NULL);
  INSERT INTO public.posts(plan_id,group_id,seq,day_label,post_date,subject,why_now,content_form,hook,body,tags,part_label)
  VALUES (v_plan,g_5,14,$m$السبت$m$,$m$27 - 6 - 2026$m$,$m$نصيحة وحكمة عن التوازن بين الحياة والعمل والتوطئة لشهور الإجازات.$m$,$m$تهيئة ذكية للجمهور للسلسلة القادمة في شهر يوليو.$m$,$m$منشور شخصي هادئ وملهم.$m$,$m$درس من الحياة: النجاح في إدارة مشروعك لا يعني الفشل في إدارة حياتك..$m$,$j$["في سباق التميز المهني، وصعود السلم الإداري، من السهل جداً أن يسرقنا الوقت. نجد أنفسنا ننهي مشاريع بملايين الريالات والدولارات، ولكننا نهمل أهم مشروع شخصي في حياتنا: عائلتنا وصحتنا النفسية.", "مررت بفترات كنت أظن فيها أن الرد على إيميل الساعة 11 مساءً هو قمة الالتزام، حتى اكتشفت أن التزامك الحقيقي يبدأ بوضع حدود صحية تحمي بها مساحتك الخاصة.", "المدير العظيم ليس هو من يعمل 16 ساعة في اليوم، بل هو من يبني منظومة ذكية تتيح له العمل بذكاء والرحيل في وقته ليعود لعائلته بكامل طاقته الذهنية والنفسية.", "نحن على أبواب شهر يوليو، شهر الإجازات الصيفية والتقاط الأنفاس..", "هل أنت مستعد لإغلاق اللابتوب وأخذ إجازة حقيقية؟ أم أن مشروعك سيتوقف بمجرد غيابك؟", "لنا حديث طويل ومفصل عن هذا الأمر الأسبوع القادم.. كونوا بالقرب."]$j$::jsonb,$m$#التوازن_المهني #WorkLifeBalance #صحة_المدير #تأملات$m$,NULL);
  INSERT INTO public.posts(plan_id,group_id,seq,day_label,post_date,subject,why_now,content_form,hook,body,tags,part_label)
  VALUES (v_plan,g_5,15,$m$الإثنين$m$,$m$29 - 6 - 2026$m$,$m$تشريح الفشل: 3 أسباب خفية تقتل المشاريع الكبرى.$m$,$m$ختام الشهر بمنشور قوي يعزز مكانته كمرجع استشاري للمشاريع والشركات.$m$,$m$منشور تحليلي مدعم بدراسة حالة مصغرة (Mini Case Study).$m$,$m$تشريح الفشل: 3 أسباب خفية تقتل المشاريع قبل أن تبدأ$m$,$j$["طوال مسيرتي، رأيت مشاريع رُصدت لها ميزانيات ضخمة، ووُظفت لها ألمع العقول، ومع ذلك فشلت فشلاً ذريعاً. عند التشريح الإداري لأسباب الفشل، نجد أن السبب نادراً ما يكون \"نقص الأموال\"، بل هي أسباب خفية تتعلق بالثقافة والإدارة:", "1- فجوة الرؤية (The Vision Gap): الإدارة العليا تفهم أين تريد الذهاب، لكن فريق التنفيذ على الأرض يرى مهاماً يومية جافة دون فهم الصورة الكبرى (The Big Picture). غياب الرؤية المشتركة يقتل الشغف والإنتاجية.", "2- خوف الموظفين من قول الحقيقة (The Hippo Effect): عندما يسود الخوف في بيئة العمل، ويصبح الجميع موافقاً دائماً على رأي \"المدير الأعلى أجراً\" خوفاً من الصدام، تُخفى المشاكل الحقيقية تحت السجادة حتى تنفجر الأزمة في وجه الجميع عند موعد التسليم.", "3- سوء إدارة التغيير (Poor Change Management): إدخال أنظمة جديدة أو تعديل مسار المشروع دون تهيئة نفسية وعملية للفريق يولد مقاومة داخلية خفية كفيلة بإفشال أي نظام مهما كان متطوراً.", "النجاح في إدارة المشاريع ليس معادلة رياضية فقط، بل هو فهم عميق لـ \"سيكولوجية البشر\" المحركين لهذه المشاريع."]$j$::jsonb,$m$#تشريح_الفشل #إدارة_التغيير #الحوكمة #مستشار_مشاريع$m$,NULL);
  INSERT INTO public.posts(plan_id,group_id,seq,day_label,post_date,subject,why_now,content_form,hook,body,tags,part_label)
  VALUES (v_plan,g_5,16,$m$الأربعاء$m$,$m$1 - 7 - 2026$m$,$m$منشور تشويقي لسلسلة شهر يوليو (إجازة بلا رنين).$m$,$m$ربط استراتيجي بين الشهور لضمان بقاء تفاعل المتابعين.$m$,$m$بوست تشويقي قصير وجذاب (Teaser).$m$,$m$ترقبوا الأحد القادم: إطلاق سلسلة "إجازة بلا رنين" للمدراء والقادة$m$,$j$["كيف تأخذ إجازة مريحة، تستمتع بعطلتك الصيفية كاملة، وتغلق هاتفك وأنت مطمئن بنسبة 100% أن فريقك مؤمن والمشاريع تسير بسلاسة ودون أي مشاكل؟", "خلال شهر يوليو بالكامل، سأشارككم دليلي العملي المجرب في:", "- فن التفاوض والتفويض الذكي (Delegation).", "- معادلة توزيع المهام بناءً على الكفاءة النفسية والعملية.", "- تأمين خطوط الدفاع الإدارية قبل الرحيل.", "موعدنا الأحد القادم مع البوست الأول.. جهزوا حقائبكم واضمنوا سلامة مشاريعكم!"]$j$::jsonb,$m$#إجازة_بلا_رنين #التفويض_الذكي #إدارة_المشاريع #سلسلة_يوليو$m$,NULL);
  INSERT INTO public.deliverables(client_id,title,status,date_label,sort_order)
  VALUES (v_client,$m$بانر لينكدإن$m$,'delivered',$m$مايو 2026$m$,1);
  INSERT INTO public.deliverables(client_id,title,status,date_label,sort_order)
  VALUES (v_client,$m$قسم "نبذة عني" والعنوان المهني$m$,'delivered',$m$مايو 2026$m$,2);
  INSERT INTO public.deliverables(client_id,title,status,date_label,sort_order)
  VALUES (v_client,$m$تقويم المحتوى · يونيو ويوليو$m$,'in_review',$m$يونيو 2026$m$,3);
  INSERT INTO public.deliverables(client_id,title,status,date_label,sort_order)
  VALUES (v_client,$m$خطة الحضور الفصلية$m$,'upcoming',$m$يوليو 2026$m$,4);
  INSERT INTO public.client_accounts(name,company,role_title,plan_label,phase_label,next_label,status)
  VALUES ($m$سطام الحزامي$m$,$m$MVPI$m$,$m$الرئيس التنفيذي$m$,$m$باقة الهوية التنفيذية$m$,$m$بناء الهوية البصرية$m$,$m$جلسة الاكتشاف · قريباً$m$,'active') RETURNING id INTO v_client2;
  INSERT INTO public.deliverables(client_id,title,status,date_label,sort_order)
  VALUES (v_client2,$m$جلسة الاكتشاف$m$,'upcoming',$m$يونيو 2026$m$,1);
  INSERT INTO public.deliverables(client_id,title,status,date_label,sort_order)
  VALUES (v_client2,$m$مسودة الهوية البصرية$m$,'upcoming',$m$يونيو 2026$m$,2);
END $$;

-- After seeding, link client users once they accept their invite:
--   UPDATE public.profiles SET client_id=(SELECT id FROM public.client_accounts WHERE company=$m$تأجيل$m$)
--   WHERE email=$m$altaifour@taajeel.sa$m$;
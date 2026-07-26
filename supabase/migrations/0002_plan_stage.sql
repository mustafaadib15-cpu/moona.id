-- Plan approval flow: which stage the client engagement is in.
-- 'plan'         -> the content plan is under client review (Tally form embedded in the portal)
-- 'schedule'     -> the plan is approved; Moona is scheduling the content
-- 'deliverables' -> scheduling done; the client follows outputs in the Deliverables tab
ALTER TABLE public.client_accounts
  ADD COLUMN plan_stage TEXT NOT NULL DEFAULT 'plan'
  CHECK (plan_stage IN ('plan', 'schedule', 'deliverables'));

import { createClient } from "@/lib/supabase/server";
import {
  ApprovalsView,
  type ApprovalGroup,
  type ApprovalPost,
} from "@/components/portal/ApprovalsView";

export default async function ApprovalsPage() {
  const supabase = await createClient();

  const [{ data: account }, { data: plan }, { data: groups }, { data: posts }, { data: comments }] =
    await Promise.all([
      supabase.from("client_accounts").select("name").maybeSingle(),
      supabase
        .from("content_plans")
        .select("id, title, period_label")
        .order("id")
        .limit(1)
        .maybeSingle(),
      supabase.from("content_groups").select("id, name, kind, sort_order").order("sort_order"),
      supabase
        .from("posts")
        .select(
          "id, group_id, seq, day_label, post_date, subject, why_now, content_form, hook, body, tags, part_label, decision",
        )
        .order("seq"),
      supabase
        .from("post_comments")
        .select("post_id, body, created_at")
        .order("created_at", { ascending: false }),
    ]);

  if (!plan || !groups || groups.length === 0) {
    return (
      <div className="view">
        <div className="page-kicker">الموافقة على المحتوى</div>
        <h1 className="page-title">لا توجد منشورات بعد</h1>
        <p className="page-sub">سيظهر تقويم المحتوى هنا فور جهوزه للمراجعة.</p>
      </div>
    );
  }

  // Latest comment per post (comments are sorted newest-first).
  const latestComment: Record<number, string> = {};
  for (const c of comments ?? []) {
    if (!(c.post_id in latestComment)) latestComment[c.post_id] = c.body;
  }

  const toPost = (p: NonNullable<typeof posts>[number]): ApprovalPost => ({
    id: p.id,
    seq: p.seq,
    dayLabel: p.day_label ?? "",
    postDate: p.post_date ?? "",
    subject: p.subject,
    whyNow: p.why_now ?? "",
    contentForm: p.content_form ?? "",
    hook: p.hook,
    body: Array.isArray(p.body) ? (p.body as unknown[]).map(String) : [],
    tags: p.tags ?? "",
    partLabel: p.part_label,
    decision: p.decision,
    comment: latestComment[p.id] ?? "",
  });

  const viewGroups: ApprovalGroup[] = groups.map((g) => ({
    id: g.id,
    name: g.name,
    kind: g.kind,
    posts: (posts ?? []).filter((p) => p.group_id === g.id).map(toPost),
  }));

  return (
    <ApprovalsView
      planTitle={plan.title}
      planSub="راجع كل منشور، واعتمده أو اطلب تعديلاً. ملاحظاتك تصل الفريق مباشرة."
      clientName={account?.name ?? ""}
      groups={viewGroups}
      total={(posts ?? []).length}
    />
  );
}

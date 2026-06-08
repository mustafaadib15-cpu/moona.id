import { createClient } from "@/lib/supabase/server";

const DELIVERABLE_LABEL: Record<string, string> = {
  delivered: "تم التسليم",
  in_review: "بانتظار المراجعة",
  upcoming: "قادم",
};

// Client overview. Counters, plan label, phase, next milestone, and recent
// activity — all read from the DB (RLS scopes everything to this client).
export default async function OverviewPage() {
  const supabase = await createClient();

  const [{ data: account }, { data: plan }, { data: posts }, { data: deliverables }] =
    await Promise.all([
      supabase
        .from("client_accounts")
        .select("name, plan_label, phase_label, next_label")
        .maybeSingle(),
      supabase.from("content_plans").select("title, period_label").maybeSingle(),
      supabase.from("posts").select("decision"),
      supabase
        .from("deliverables")
        .select("title, date_label, status")
        .order("sort_order")
        .limit(3),
    ]);

  let pending = 0;
  let approved = 0;
  let revision = 0;
  for (const p of posts ?? []) {
    if (p.decision === "approved") approved += 1;
    else if (p.decision === "revision") revision += 1;
    else pending += 1;
  }

  const firstName = (account?.name ?? "").split(" ")[0];

  const activity: { body: string; time: string }[] = [];
  if (plan) {
    activity.push({
      body: `${plan.title} جاهز لمراجعتك`,
      time: plan.period_label ?? "",
    });
  }
  for (const d of deliverables ?? []) {
    activity.push({
      body: d.title,
      time: [d.date_label, DELIVERABLE_LABEL[d.status]].filter(Boolean).join(" · "),
    });
  }
  if (account?.next_label) {
    activity.push({ body: account.next_label, time: "سيصلك تذكير قبل الموعد" });
  }

  return (
    <div className="view">
      <div className="page-kicker">لوحة التحكم</div>
      <h1 className="page-title">مساء الخير، {firstName}</h1>
      <p className="page-sub">
        {account?.plan_label}
        {account?.phase_label ? ` · المرحلة الحالية: ${account.phase_label}` : ""}
      </p>

      <div className="stat-grid">
        <div className="stat">
          <div className="lab">بانتظار مراجعتك</div>
          <div className="val">{pending}</div>
          <div className="sub">منشور يحتاج قرارك</div>
        </div>
        <div className="stat">
          <div className="lab">معتمدة</div>
          <div className="val">{approved}</div>
          <div className="sub">جاهزة للنشر</div>
        </div>
        <div className="stat">
          <div className="lab">تحتاج تعديل</div>
          <div className="val">{revision}</div>
          <div className="sub">بانتظار التعديل</div>
        </div>
        <div className="stat">
          <div className="lab">القادم</div>
          <div className="vtext">{account?.next_label ?? "—"}</div>
        </div>
      </div>

      <div className="panel">
        <h3>آخر التحديثات</h3>
        {activity.length === 0 ? (
          <p className="page-sub">لا توجد تحديثات بعد.</p>
        ) : (
          activity.map((a, i) => (
            <div className="act" key={i}>
              <span className="am" />
              <div>
                <div className="ab">{a.body}</div>
                <div className="at">{a.time}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { PLAN_STAGES, normalizePlanStage } from "@/lib/tally";

const DELIVERABLE_LABEL: Record<string, string> = {
  delivered: "تم التسليم",
  in_review: "بانتظار المراجعة",
  upcoming: "قادم",
};

const STAGE_ACTIVITY: Record<string, string> = {
  plan: "خطة المحتوى جاهزة لمراجعتك واعتمادك",
  schedule: "خطتك معتمدة وجاري جدولة النشر",
  deliverables: "الجدولة مكتملة والمتابعة في المخرجات",
};

// Client overview. Plan stage, plan label, next milestone, and recent
// activity — all read from the DB (RLS scopes everything to this client).
export default async function OverviewPage() {
  const supabase = await createClient();

  const [{ data: account }, { data: deliverables }] = await Promise.all([
    supabase
      .from("client_accounts")
      .select("name, plan_label, phase_label, next_label, plan_stage")
      .maybeSingle(),
    supabase
      .from("deliverables")
      .select("title, date_label, status")
      .order("sort_order")
      .limit(3),
  ]);

  const stage = normalizePlanStage(account?.plan_stage);
  const stageIndex = PLAN_STAGES.findIndex((s) => s.key === stage);
  const stageInfo = PLAN_STAGES[stageIndex];

  const firstName = (account?.name ?? "").split(" ")[0];

  const activity: { body: string; time: string }[] = [];
  activity.push({ body: STAGE_ACTIVITY[stage], time: "من صفحة الخطة" });
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
          <div className="lab">مرحلة الخطة</div>
          <div className="vtext">{stageInfo.label}</div>
          <div className="sub">{stageInfo.sub}</div>
        </div>
        <div className="stat">
          <div className="lab">التقدم</div>
          <div className="val">{stageIndex + 1}/3</div>
          <div className="sub">الخطة ثم الجدولة ثم التسليمات</div>
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

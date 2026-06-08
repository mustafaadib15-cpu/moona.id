import { createClient } from "@/lib/supabase/server";

const CHIP_CLASS: Record<string, string> = {
  delivered: "done",
  in_review: "review",
  upcoming: "soon",
};
const CHIP_LABEL: Record<string, string> = {
  delivered: "تم التسليم",
  in_review: "بانتظار المراجعة",
  upcoming: "قادم",
};

export default async function DeliverablesPage() {
  const supabase = await createClient();
  const [{ data: account }, { data: deliverables }] = await Promise.all([
    supabase.from("client_accounts").select("plan_label").maybeSingle(),
    supabase
      .from("deliverables")
      .select("title, description, status, date_label, file_url")
      .order("sort_order"),
  ]);

  return (
    <div className="view">
      <div className="page-kicker">المخرجات</div>
      <h1 className="page-title">مخرجاتك</h1>
      <p className="page-sub">
        كل ما سلّمناه أو قيد العمل عليه{account?.plan_label ? ` ضمن ${account.plan_label}` : ""}
      </p>

      {!deliverables || deliverables.length === 0 ? (
        <div className="empty">لا توجد مخرجات بعد.</div>
      ) : (
        <div className="deliv">
          {deliverables.map((d, i) => (
            <div className="ditem" key={i}>
              <div>
                <div className="dt">{d.title}</div>
                {d.description ? <div className="dd">{d.description}</div> : null}
              </div>
              <div className="dmeta">
                <span className={`chipx ${CHIP_CLASS[d.status] ?? ""}`}>
                  {CHIP_LABEL[d.status] ?? d.status}
                </span>
                {d.file_url ? (
                  <a className="dview" href={d.file_url} target="_blank" rel="noopener noreferrer">
                    عرض
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

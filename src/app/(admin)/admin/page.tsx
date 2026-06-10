import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AccountForm } from "@/components/admin/AccountForm";

const STATUS_LABEL: Record<string, string> = {
  active: "نشط",
  paused: "متوقف",
  completed: "مكتمل",
};
const STATUS_CLASS: Record<string, string> = {
  active: "done",
  paused: "soon",
  completed: "review",
};

export default async function AdminClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("client_accounts")
    .select("id, name, company, status")
    .order("created_at");

  return (
    <div className="view">
      <div className="page-kicker">الإدارة</div>
      <h1 className="page-title">العملاء</h1>
      <p className="page-sub">إدارة حسابات العملاء، الخطط، المخرجات، والملاحظات.</p>

      {!clients || clients.length === 0 ? (
        <div className="empty">لا يوجد عملاء بعد. أضف أول عميل بالأسفل.</div>
      ) : (
        <div className="deliv">
          {clients.map((c) => (
            <div className="ditem" key={c.id}>
              <div>
                <div className="dt">{c.name}</div>
                {c.company ? <div className="dd">{c.company}</div> : null}
              </div>
              <div className="dmeta">
                <span className={`chipx ${STATUS_CLASS[c.status] ?? ""}`}>
                  {STATUS_LABEL[c.status] ?? c.status}
                </span>
                <Link className="dview" href={`/admin/clients/${c.id}`}>
                  إدارة
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="divider" />

      <div className="panel">
        <h3>إضافة عميل جديد</h3>
        <AccountForm mode="create" />
      </div>
    </div>
  );
}

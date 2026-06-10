import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientTabs } from "@/components/admin/ClientTabs";
import { AccountForm } from "@/components/admin/AccountForm";
import { InviteForm } from "@/components/admin/InviteForm";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: account } = await supabase
    .from("client_accounts")
    .select("id, name, company, role_title, plan_label, phase_label, next_label, status")
    .eq("id", id)
    .maybeSingle();
  if (!account) notFound();

  const { data: users } = await supabase
    .from("profiles")
    .select("email, role")
    .eq("client_id", id);

  return (
    <div className="view">
      <div className="page-kicker">عميل</div>
      <h1 className="page-title">{account.name}</h1>
      <ClientTabs id={id} />

      <div className="panel">
        <h3>بيانات الحساب</h3>
        <AccountForm mode="edit" clientId={id} account={account} />
      </div>

      <div className="divider" />

      <div className="panel">
        <h3>المستخدمون</h3>
        {users && users.length > 0 ? (
          users.map((u, i) => (
            <div className="kv" key={i}>
              <span className="k" dir="ltr">
                {u.email}
              </span>
              <span className="v">{u.role === "admin" ? "مدير" : "عميل"}</span>
            </div>
          ))
        ) : (
          <p className="page-sub">لا يوجد مستخدمون مرتبطون بعد.</p>
        )}
        <div className="divider" />
        <InviteForm clientId={id} />
      </div>
    </div>
  );
}

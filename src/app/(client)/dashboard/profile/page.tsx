import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/profile";

export default async function ProfilePage() {
  const supabase = await createClient();
  const [{ data: account }, profile] = await Promise.all([
    supabase
      .from("client_accounts")
      .select("name, role_title, company, plan_label, phase_label")
      .maybeSingle(),
    getCurrentProfile(),
  ]);

  return (
    <div className="view">
      <div className="page-kicker">الملف الشخصي</div>
      <h1 className="page-title">{account?.name ?? profile?.full_name ?? "—"}</h1>
      <p className="page-sub">معلومات حسابك</p>

      <div className="panel">
        <div className="kv">
          <span className="k">الاسم</span>
          <span className="v">{account?.name ?? "—"}</span>
        </div>
        <div className="kv">
          <span className="k">المنصب</span>
          <span className="v">{account?.role_title ?? "—"}</span>
        </div>
        <div className="kv">
          <span className="k">الجهة</span>
          <span className="v">{account?.company ?? "—"}</span>
        </div>
        <div className="kv">
          <span className="k">البريد</span>
          <span className="v" dir="ltr">
            {profile?.email}
          </span>
        </div>
        <div className="kv">
          <span className="k">الباقة</span>
          <span className="v">{account?.plan_label ?? "—"}</span>
        </div>
        <div className="kv">
          <span className="k">المرحلة</span>
          <span className="v">{account?.phase_label ?? "—"}</span>
        </div>
      </div>
    </div>
  );
}

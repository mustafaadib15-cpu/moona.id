import { signOut } from "@/app/(auth)/actions";
import { getCurrentProfile } from "@/lib/supabase/profile";

// Phase 1: a minimal authenticated landing proving admin auth + role routing.
// Phase 4 replaces this with the full admin dashboard (clients, plan builder,
// deliverables manager, feedback view).
export default async function AdminPage() {
  const profile = await getCurrentProfile();
  const name = profile?.full_name ?? profile?.email ?? "";

  return (
    <section className="login">
      <div className="login-card">
        <div className="login-kicker">Admin</div>
        <h1 className="login-title">لوحة الإدارة</h1>
        <div className="kv">
          <span className="k">المسؤول</span>
          <span className="v">{name}</span>
        </div>
        <div className="kv">
          <span className="k">البريد</span>
          <span className="v" dir="ltr">
            {profile?.email}
          </span>
        </div>
        <div className="kv">
          <span className="k">الدور</span>
          <span className="v">مدير</span>
        </div>
        <form action={signOut} className="mt-6">
          <button className="btn full" type="submit">
            تسجيل الخروج
          </button>
        </form>
      </div>
    </section>
  );
}

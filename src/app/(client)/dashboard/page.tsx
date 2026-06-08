import { signOut } from "@/app/(auth)/actions";
import { getCurrentProfile } from "@/lib/supabase/profile";

// Phase 1: a minimal authenticated landing proving auth + role routing.
// Phase 2 replaces this with the full client dashboard (top bar, side nav,
// overview counters, approvals, deliverables, profile).
export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const name = profile?.full_name ?? profile?.email ?? "";

  return (
    <section className="login">
      <div className="login-card">
        <div className="login-kicker">Client Portal</div>
        <h1 className="login-title">مساء الخير، {name}</h1>
        <div className="kv">
          <span className="k">البريد</span>
          <span className="v" dir="ltr">
            {profile?.email}
          </span>
        </div>
        <div className="kv">
          <span className="k">الدور</span>
          <span className="v">عميل</span>
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

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SetPasswordForm } from "@/components/auth/SetPasswordForm";

// Where an invited client sets their own password after following the email
// link. Requires the session established by /confirm.
export default async function SetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal");

  return (
    <section className="login">
      <div className="login-card">
        <div className="login-kicker">Client Portal</div>
        <h1 className="login-title">تعيين كلمة المرور</h1>
        <SetPasswordForm />
      </div>
    </section>
  );
}

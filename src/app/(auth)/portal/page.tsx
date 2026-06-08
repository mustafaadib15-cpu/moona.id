import Image from "next/image";
import { redirect } from "next/navigation";
import logo from "@/assets/logo.png";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentProfile } from "@/lib/supabase/profile";

export default async function PortalLoginPage() {
  // Already signed in? Send them to their area.
  const profile = await getCurrentProfile();
  if (profile) {
    redirect(profile.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <section className="login">
      <div className="login-card">
        <Image
          className="login-logo"
          src={logo}
          alt="Moona"
          width={170}
          height={54}
          priority
        />
        <div className="login-kicker">Client Portal</div>
        <h1 className="login-title">بوابة العملاء</h1>
        <LoginForm />
      </div>
    </section>
  );
}

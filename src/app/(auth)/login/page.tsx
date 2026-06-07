import Image from "next/image";
import logo from "@/assets/logo.png";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
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

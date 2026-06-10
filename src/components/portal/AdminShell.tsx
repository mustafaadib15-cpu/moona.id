import Image from "next/image";
import logo from "@/assets/logo.png";
import { signOut } from "@/app/(auth)/actions";
import { AdminNav } from "./AdminNav";

interface AdminShellProps {
  adminName: string;
  children: React.ReactNode;
}

export function AdminShell({ adminName, children }: AdminShellProps) {
  const initial = adminName.trim().charAt(0) || "M";
  return (
    <section className="app">
      <div className="topbar">
        <Image className="tb-logo" src={logo} alt="Moona" width={83} height={26} priority />
        <div className="tb-spacer" />
        <div className="tb-client">
          <div className="tb-name">
            <b>{adminName}</b>
            <span>الإدارة</span>
          </div>
          <div className="avatar">{initial}</div>
        </div>
        <form action={signOut}>
          <button className="logout" type="submit">
            خروج
          </button>
        </form>
      </div>
      <div className="layout">
        <AdminNav />
        <main className="main">{children}</main>
      </div>
    </section>
  );
}

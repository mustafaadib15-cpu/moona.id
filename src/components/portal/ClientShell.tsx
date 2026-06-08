import Image from "next/image";
import logo from "@/assets/logo.png";
import { signOut } from "@/app/(auth)/actions";
import { SideNav } from "./SideNav";

interface ClientShellProps {
  clientName: string;
  roleLabel: string;
  initial: string;
  children: React.ReactNode;
}

// Portal app shell: sticky top bar (logo, client, logout) + right-hand side
// nav (RTL). Matches the approved prototype.
export function ClientShell({
  clientName,
  roleLabel,
  initial,
  children,
}: ClientShellProps) {
  return (
    <section className="app">
      <div className="topbar">
        <Image className="tb-logo" src={logo} alt="Moona" width={83} height={26} priority />
        <div className="tb-spacer" />
        <div className="tb-client">
          <div className="tb-name">
            <b>{clientName}</b>
            <span>{roleLabel}</span>
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
        <SideNav />
        <main className="main">{children}</main>
      </div>
    </section>
  );
}

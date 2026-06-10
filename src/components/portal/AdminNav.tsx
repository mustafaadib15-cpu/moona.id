"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [{ href: "/admin", label: "العملاء" }];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="side">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith("/admin/clients");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav${active ? " active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className="dot" />
            {item.label}
          </Link>
        );
      })}
      <div className="side-foot">Moona · Admin</div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "لوحة التحكم" },
  { href: "/dashboard/approvals", label: "الموافقة على المحتوى" },
  { href: "/dashboard/deliverables", label: "المخرجات" },
  { href: "/dashboard/profile", label: "الملف الشخصي" },
];

export function SideNav() {
  const pathname = usePathname();
  return (
    <nav className="side">
      {items.map((item) => {
        const active = pathname === item.href;
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
      <div className="side-foot">Moona · 2026</div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ClientTabs({ id }: { id: string }) {
  const pathname = usePathname();
  const base = `/admin/clients/${id}`;
  const tabs = [
    { href: base, label: "الحساب" },
    { href: `${base}/plan`, label: "الخطة" },
    { href: `${base}/deliverables`, label: "المخرجات" },
    { href: `${base}/feedback`, label: "الملاحظات" },
  ];
  return (
    <div className="adm-tabs">
      {tabs.map((t) => (
        <Link key={t.href} href={t.href} className={pathname === t.href ? "active" : ""}>
          {t.label}
        </Link>
      ))}
    </div>
  );
}

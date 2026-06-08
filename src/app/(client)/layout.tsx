import type { Metadata } from "next";
import { redirect } from "next/navigation";
import "@/app/globals.css";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { ClientShell } from "@/components/portal/ClientShell";

export const metadata: Metadata = {
  title: "Moona · لوحة العميل",
};

// Client area. Requires an authenticated profile with role 'client'; admins
// are routed to their own area. RLS still enforces row access in the DB.
export default async function ClientLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/portal");
  if (profile.role === "admin") redirect("/admin");

  const supabase = await createClient();
  const { data: account } = await supabase
    .from("client_accounts")
    .select("name, company, role_title")
    .maybeSingle();

  const clientName = account?.name ?? profile.full_name ?? profile.email;
  const roleLabel = [account?.role_title, account?.company]
    .filter(Boolean)
    .join(" · ");
  const initial = clientName.trim().charAt(0) || "•";

  return (
    <>
      <div className="tex" aria-hidden="true" />
      <ClientShell clientName={clientName} roleLabel={roleLabel} initial={initial}>
        {children}
      </ClientShell>
    </>
  );
}

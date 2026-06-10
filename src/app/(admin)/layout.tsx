import type { Metadata } from "next";
import { redirect } from "next/navigation";
import "@/app/globals.css";
import "@/styles/admin.css";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { AdminShell } from "@/components/portal/AdminShell";

export const metadata: Metadata = {
  title: "Moona · لوحة الإدارة",
};

// Admin area. Requires an authenticated profile with role 'admin'; clients are
// routed to their own area.
export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/portal");
  if (profile.role !== "admin") redirect("/dashboard");

  const adminName = profile.full_name ?? profile.email;

  return (
    <>
      <div className="tex" aria-hidden="true" />
      <AdminShell adminName={adminName}>{children}</AdminShell>
    </>
  );
}

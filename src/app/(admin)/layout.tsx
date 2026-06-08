import type { Metadata } from "next";
import { redirect } from "next/navigation";
import "@/app/globals.css";
import { getCurrentProfile } from "@/lib/supabase/profile";

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

  return (
    <>
      <div className="tex" aria-hidden="true" />
      {children}
    </>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import "@/app/globals.css";
import { getCurrentProfile } from "@/lib/supabase/profile";

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

  return (
    <>
      <div className="tex" aria-hidden="true" />
      {children}
    </>
  );
}

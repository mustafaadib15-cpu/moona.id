import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Moona · بوابة العملاء",
  description: "بوابة عملاء منى. مراجعة المحتوى واعتماده ومتابعة المخرجات.",
};

// Portal auth area (login, invite-accept). Owns the portal design system
// (near-black starfield) and the readability vignette.
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="tex" aria-hidden="true" />
      {children}
    </>
  );
}

import "@/styles/marketing/tokens.css";
import "@/styles/marketing/global.css";
import "@/styles/marketing/components.css";
import "@/styles/marketing/atmosphere.css";
import "@/styles/marketing/sections.css";

// Marketing route group: loads the navy design system. Each page renders its
// own MarketingShell (locale-aware), so EN routes can flip to LTR.
export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

import "@/styles/marketing/tokens.css";
import "@/styles/marketing/global.css";
import "@/styles/marketing/components.css";
import "@/styles/marketing/atmosphere.css";
import "@/styles/marketing/sections.css";

import { t } from "@/lib/marketing/i18n";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { Stars } from "@/components/marketing/Stars";
import { StarsParallax } from "@/components/marketing/StarsParallax";
import { Grain } from "@/components/marketing/Grain";
import { Vignette } from "@/components/marketing/Vignette";

// Marketing site shell (Arabic, the default locale). Owns the navy design
// system, the atmospheric background layers, the nav (with the portal link),
// and the footer. EN routes live under /en with their own locale.
export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = "ar" as const;
  return (
    <>
      <Stars />
      <StarsParallax />
      <Vignette />
      <Grain />
      <a className="skip-link" href="#main">
        {t(locale, "a11y.skip")}
      </a>
      <Nav locale={locale} />
      <main id="main" className="has-pattern">
        {children}
      </main>
      <Footer locale={locale} />
    </>
  );
}

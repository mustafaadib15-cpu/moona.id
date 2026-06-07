import { dirFor, t, type Locale } from "@/lib/marketing/i18n";
import { organizationLd } from "@/lib/marketing/seo";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

interface MarketingShellProps {
  locale: Locale;
  children: React.ReactNode;
}

// Per-page marketing chrome: a lang/dir wrapper (so EN routes flip to LTR even
// though the document defaults to Arabic RTL), skip link, Nav (with the portal
// link), main, Footer, and Organization JSON-LD. Atmosphere is page-specific
// (only the about page renders it) so it is passed in via children.
export function MarketingShell({ locale, children }: MarketingShellProps) {
  return (
    <div lang={locale} dir={dirFor(locale)}>
      <a className="skip-link" href="#main">
        {t(locale, "a11y.skip")}
      </a>
      <Nav locale={locale} />
      <main id="main" className="has-pattern">
        {children}
      </main>
      <Footer locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: organizationLd(locale) }}
      />
    </div>
  );
}

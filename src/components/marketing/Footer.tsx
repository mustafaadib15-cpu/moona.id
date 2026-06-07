import Image from "next/image";
import { t, type Locale } from "@/lib/marketing/i18n";
import { LangSwitch } from "./LangSwitch";
import { MoonIcon } from "./MoonIcon";

interface FooterProps {
  locale: Locale;
}

// Thin top border, brand + contact columns, a hairline rule, and the legal
// line with the language toggle.
export function Footer({ locale }: FooterProps) {
  const base = locale === "en" ? "/en" : "";
  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__cols">
          <div className="footer__col footer__col--brand">
            {locale === "en" ? (
              <a href={`${base}/`} className="footer__logo-link" aria-label="Moona">
                <Image
                  className="footer__logo"
                  src="/assets/logo_2.png"
                  width={200}
                  height={54}
                  alt="Moona, Refined Presence"
                  loading="lazy"
                />
              </a>
            ) : (
              <>
                <MoonIcon size={40} />
                <a href={`${base}/`} className="footer__brand">
                  {t(locale, "nav.brand")}
                </a>
                <p className="overline">{t(locale, "footer.tagline")}</p>
              </>
            )}
          </div>

          <div className="footer__col">
            <a href="https://moona.id">moona.id</a>
            <a href="mailto:gov@moona.id">gov@moona.id</a>
            <span>{t(locale, "footer.location")}</span>
          </div>
        </div>

        <hr className="rule footer__rule" />

        <div className="footer__base">
          <p className="caption">{t(locale, "footer.legal")}</p>
          <LangSwitch locale={locale} className="footer__lang" />
        </div>
      </div>
    </footer>
  );
}

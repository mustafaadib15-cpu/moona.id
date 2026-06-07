import { t, type Locale } from "@/lib/marketing/i18n";
import { MoonIcon } from "./MoonIcon";

export function AudienceReceived({ locale }: { locale: Locale }) {
  const base = locale === "en" ? "/en" : "";
  return (
    <section className="section received">
      <div className="container received__inner">
        <MoonIcon size={56} />
        <h1 className="display-section">{t(locale, "audience.received.heading")}</h1>
        <p className="body-lg received__body">{t(locale, "audience.received.body")}</p>
        <a className="btn btn--outline" href={`${base}/`}>
          {t(locale, "audience.received.back")}
        </a>
      </div>
    </section>
  );
}

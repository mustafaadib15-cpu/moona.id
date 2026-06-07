import { t, type Locale } from "@/lib/marketing/i18n";
import { Reveal } from "../Reveal";

export function MidCta({ locale }: { locale: Locale }) {
  const base = locale === "en" ? "/en" : "";
  return (
    <section className="midcta has-pattern">
      <div className="container midcta__inner">
        <Reveal>
          <p className="body-lg midcta__text">{t(locale, "midcta.text")}</p>
        </Reveal>
        <Reveal delay={0.08}>
          <a className="btn btn--solid" href={`${base}/audience`}>
            {t(locale, "midcta.button")}
          </a>
        </Reveal>
      </div>
    </section>
  );
}

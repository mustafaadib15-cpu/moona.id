import { t, type Locale } from "@/lib/marketing/i18n";
import { Reveal } from "../Reveal";

export function AudienceCTA({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const base = isAr ? "" : "/en";
  const contact = t(locale, "about.audience.contact");

  return (
    <section id="audience" className={`about-section about-audience${isAr ? " is-ar" : ""}`}>
      <Reveal className="about-audience__eyebrow">{t(locale, "about.audience.eyebrow")}</Reveal>
      <Reveal as="h2" className="about-audience__title" delay={0.15}>
        {t(locale, "about.audience.title")}
      </Reveal>
      <Reveal as="p" className="about-audience__body" delay={0.3}>
        {t(locale, "about.audience.body")}
      </Reveal>
      <Reveal className="about-audience__cta-wrap" delay={0.45}>
        <a className="about-audience__cta" href={`${base}/audience`}>
          <span>{t(locale, "about.audience.cta")}</span>
        </a>
      </Reveal>
      <a className="about-audience__contact" href={`mailto:${contact}`}>
        {contact}
      </a>
    </section>
  );
}

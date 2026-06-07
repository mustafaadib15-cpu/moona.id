import { t, type Locale } from "@/lib/marketing/i18n";
import { MoonIcon } from "../MoonIcon";
import { Reveal } from "../Reveal";

export function ClosingCTA({ locale }: { locale: Locale }) {
  const base = locale === "en" ? "/en" : "";
  const isAr = locale === "ar";
  // The CTA shows the tagline in the opposite script: AR page -> "Refined
  // Presence"; EN page -> "حضور راقي".
  const taglineText = isAr ? "Refined Presence" : "حضور راقي";
  const taglineLang = isAr ? "en" : "ar";

  return (
    <section id="cta" className="section cta has-pattern">
      <div className="container cta__inner">
        <Reveal className="cta__icon">
          <MoonIcon size={56} />
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="display-section cta__headline">{t(locale, "cta.headline")}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="cta__tagline" lang={taglineLang}>
            {taglineText}
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="body cta__subline">{t(locale, "cta.subline")}</p>
        </Reveal>
        <Reveal delay={0.2}>
          <a className="btn btn--solid" href={`${base}/audience`}>
            {t(locale, "cta.button")}
          </a>
        </Reveal>
      </div>
    </section>
  );
}

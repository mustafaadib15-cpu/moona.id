import { t, type Locale } from "@/lib/marketing/i18n";
import { MoonIcon } from "../MoonIcon";

export function Hero({ locale }: { locale: Locale }) {
  const base = locale === "en" ? "/en" : "";
  return (
    <section className="hero has-pattern">
      <div className="container hero__inner">
        <div className="hero__icon" data-hero="1">
          <MoonIcon size={64} />
        </div>
        <p className="overline hero__eyebrow" data-hero="2">
          {t(locale, "hero.eyebrow")}
        </p>
        <h1 className="display-hero hero__headline" data-hero="3">
          {t(locale, "hero.headline")}
        </h1>
        <p className="body-lg hero__subhead" data-hero="4">
          {t(locale, "hero.subhead")}
        </p>
        <ul className="hero__stats" data-hero="5" aria-label={t(locale, "hero.eyebrow")}>
          <li className="hero__stat">{t(locale, "hero.stats.accounts")}</li>
          <li className="hero__stat">{t(locale, "hero.stats.posts")}</li>
          <li className="hero__stat">{t(locale, "hero.stats.impressions")}</li>
        </ul>
        <div className="hero__actions" data-hero="6">
          <a className="btn btn--solid" href={`${base}/audience`}>
            {t(locale, "hero.cta")}
          </a>
          <a className="hero__secondary" href="#workflow">
            {t(locale, "hero.secondary")}
          </a>
        </div>
      </div>
      <a className="hero__scroll" href="#workflow" aria-label={t(locale, "hero.secondary")}>
        <span></span>
      </a>
    </section>
  );
}

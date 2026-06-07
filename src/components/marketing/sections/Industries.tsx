import { t, type Locale } from "@/lib/marketing/i18n";
import { Reveal } from "../Reveal";

export function Industries({ locale }: { locale: Locale }) {
  const items = [1, 2, 3, 4, 5, 6].map((n) => t(locale, `industries.${n}`));

  return (
    <section id="industries" className="section industries">
      <div className="container">
        <Reveal>
          <p className="overline">{t(locale, "industries.overline")}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="display-section industries__headline">
            {t(locale, "industries.headline")}
          </h2>
        </Reveal>

        <ul className="industries__grid">
          {items.map((title, i) => (
            <Reveal as="li" className="industries__card" delay={0.05 + i * 0.05} key={title}>
              <h3 className="heading">{title}</h3>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={0.1}>
          <p className="body-lg industries__outcome">{t(locale, "industries.outcome")}</p>
        </Reveal>
      </div>
    </section>
  );
}

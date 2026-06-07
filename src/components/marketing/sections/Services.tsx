import { t, type Locale } from "@/lib/marketing/i18n";
import { Reveal } from "../Reveal";

export function Services({ locale }: { locale: Locale }) {
  const services = [1, 2, 3, 4, 5].map((n) => ({
    num: String(n).padStart(2, "0"),
    title: t(locale, `services.${n}.title`),
    desc: t(locale, `services.${n}.desc`),
  }));

  return (
    <section id="services" className="section services">
      <div className="container">
        <Reveal>
          <p className="overline">{t(locale, "services.overline")}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="display-section services__headline">
            {t(locale, "services.headline")}
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="body-lg services__intro">{t(locale, "services.intro")}</p>
        </Reveal>

        <div className="services__list">
          {services.map((s, i) => (
            <Reveal className="services__row" delay={i * 0.06} key={s.num}>
              <span className="services__num">{s.num}</span>
              <h3 className="heading services__title">{s.title}</h3>
              <p className="body services__desc">{s.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

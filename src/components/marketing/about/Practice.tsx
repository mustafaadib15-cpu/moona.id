import { t, type Locale } from "@/lib/marketing/i18n";
import { Reveal } from "../Reveal";

export function Practice({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const items = [1, 2, 3, 4].map((i) => ({
    n: t(locale, `about.practice.${i}.n`),
    name: t(locale, `about.practice.${i}.name`),
    desc: t(locale, `about.practice.${i}.desc`),
  }));

  return (
    <section id="practice" className={`about-section about-practice${isAr ? " is-ar" : ""}`}>
      <div className="about-practice__header">
        <Reveal className="about-practice__eyebrow">{t(locale, "about.practice.eyebrow")}</Reveal>
        <Reveal as="h2" className="about-practice__title" delay={0.15}>
          {t(locale, "about.practice.title")}
        </Reveal>
      </div>
      <div className="about-practice__grid">
        {items.map((item, i) => (
          <Reveal className="about-practice__item" delay={0.05 + i * 0.12} key={item.n}>
            <div className="about-practice__n">{item.n}</div>
            <h3 className="about-practice__name">{item.name}</h3>
            <p className="about-practice__desc">{item.desc}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

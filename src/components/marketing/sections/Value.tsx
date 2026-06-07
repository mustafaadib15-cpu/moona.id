import { t, type Locale } from "@/lib/marketing/i18n";
import { Reveal } from "../Reveal";

const arNums = ["٠١", "٠٢", "٠٣", "٠٤", "٠٥", "٠٦"];

export function Value({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const cards = [1, 2, 3, 4, 5, 6].map((n, i) => ({
    num: isAr ? arNums[i] : String(n).padStart(2, "0"),
    title: t(locale, `value.${n}.title`),
    desc: t(locale, `value.${n}.desc`),
  }));

  return (
    <section id="value" className="section value">
      <div className="container">
        <Reveal>
          <p className="overline">{t(locale, "value.overline")}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="display-section value__headline">{t(locale, "value.headline")}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="body-lg value__subline">{t(locale, "value.subline")}</p>
        </Reveal>

        <ol className="value__grid">
          {cards.map((card, i) => (
            <Reveal as="li" className="value__card" delay={0.08 + i * 0.06} key={card.num}>
              <span className="value__num">{card.num}</span>
              <h3 className="heading value__title">{card.title}</h3>
              <p className="body value__desc">{card.desc}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

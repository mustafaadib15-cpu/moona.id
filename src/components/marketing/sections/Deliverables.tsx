import { t, type Locale } from "@/lib/marketing/i18n";
import { Reveal } from "../Reveal";

const arNums = ["٠١", "٠٢", "٠٣", "٠٤", "٠٥", "٠٦"];

export function Deliverables({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const items = [1, 2, 3, 4, 5, 6].map((n, i) => ({
    num: isAr ? arNums[i] : String(n).padStart(2, "0"),
    title: t(locale, `deliverables.${n}.title`),
    desc: t(locale, `deliverables.${n}.desc`),
  }));

  return (
    <section id="deliverables" className="section deliverables">
      <div className="container">
        <Reveal>
          <p className="overline">{t(locale, "deliverables.overline")}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="display-section deliverables__headline">
            {t(locale, "deliverables.headline")}
          </h2>
        </Reveal>

        <ol className="deliverables__grid">
          {items.map((item, i) => (
            <Reveal as="li" className="deliverables__item" delay={0.08 + i * 0.06} key={item.num}>
              <span className="deliverables__num">{item.num}</span>
              <h3 className="heading deliverables__title">{item.title}</h3>
              <p className="body deliverables__desc">{item.desc}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

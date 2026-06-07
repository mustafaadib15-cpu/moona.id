import { t, type Locale } from "@/lib/marketing/i18n";
import { Reveal } from "../Reveal";

export function Faq({ locale }: { locale: Locale }) {
  const items = [1, 2, 3, 4, 5].map((n) => ({
    q: t(locale, `faq.${n}.q`),
    a: t(locale, `faq.${n}.a`),
  }));

  return (
    <section id="faq" className="section faq">
      <div className="container faq__inner">
        <Reveal>
          <p className="overline">{t(locale, "faq.overline")}</p>
        </Reveal>

        <div className="faq__list">
          {items.map((item, i) => (
            <Reveal className="faq__item" delay={0.05 + i * 0.05} key={item.q}>
              <details className="faq__details">
                <summary className="faq__summary">
                  <span className="heading faq__q">{item.q}</span>
                  <span className="faq__chevron" aria-hidden="true"></span>
                </summary>
                <p className="body faq__a">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

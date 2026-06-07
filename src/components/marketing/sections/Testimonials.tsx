import { t, type Locale } from "@/lib/marketing/i18n";
import { Reveal } from "../Reveal";

export function Testimonials({ locale }: { locale: Locale }) {
  const items = [1, 2, 3].map((n) => ({
    quote: t(locale, `testimonials.${n}.quote`),
    name: t(locale, `testimonials.${n}.name`),
    title: t(locale, `testimonials.${n}.title`),
    company: t(locale, `testimonials.${n}.company`),
  }));

  return (
    <section id="testimonials" className="section testimonials">
      <div className="container">
        <Reveal>
          <p className="overline">{t(locale, "testimonials.overline")}</p>
        </Reveal>

        <div className="testimonials__grid">
          {items.map((it, i) => (
            <Reveal as="figure" className="testimonials__card" delay={i * 0.08} key={it.name}>
              <span className="testimonials__mark" aria-hidden="true">
                {"“"}
              </span>
              <blockquote className="testimonials__quote body-lg">{it.quote}</blockquote>
              <figcaption className="testimonials__cite">
                <span className="testimonials__name">{it.name}</span>
                <span className="testimonials__role caption">
                  {it.title}, {it.company}
                </span>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

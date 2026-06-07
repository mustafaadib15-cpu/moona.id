import { t, type Locale } from "@/lib/marketing/i18n";
import { Reveal } from "../Reveal";

export function Story({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const acts = [1, 2, 3, 4].map((i) => ({
    n: t(locale, `about.story.${i}.n`),
    title: t(locale, `about.story.${i}.title`),
    arabic: t(locale, `about.story.${i}.arabic`),
    translit: t(locale, `about.story.${i}.translit`),
    body: t(locale, `about.story.${i}.body`),
    body2: t(locale, `about.story.${i}.body2`),
  }));
  const closing = [1, 2, 3].map((i) => t(locale, `about.story.closing.${i}`));

  return (
    <section id="story" className={`about-section about-story${isAr ? " is-ar" : ""}`}>
      <div className="about-story__intro">
        <Reveal className="about-story__eyebrow">{t(locale, "about.story.eyebrow")}</Reveal>
        <Reveal as="h2" className="about-story__kicker" delay={0.2}>
          {t(locale, "about.story.kicker")}
        </Reveal>
      </div>

      {acts.map((act) => (
        <div className="about-story__act" key={act.n}>
          <div className="about-story__act-inner">
            <Reveal className="about-story__meta">
              <span className="about-story__n">{act.n}</span>
              <span className="about-story__rule" />
            </Reveal>
            <Reveal className="about-story__glyph" delay={0.15}>
              <span className="about-story__arabic" lang="ar">
                {act.arabic}
              </span>
              <span className="about-story__translit">{act.translit}</span>
            </Reveal>
            <Reveal as="h3" className="about-story__title" delay={0.3}>
              {act.title}
            </Reveal>
            <Reveal as="p" className="about-story__body" delay={0.45}>
              {act.body}
            </Reveal>
            <Reveal as="p" className="about-story__accent" delay={0.6}>
              {act.body2}
            </Reveal>
          </div>
        </div>
      ))}

      <div className="about-story__closing">
        <Reveal className="about-story__crescent">
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <defs>
              <mask id="story-crescent-mask">
                <rect width="24" height="24" fill="white" />
                <circle cx="15" cy="12" r="8" fill="black" />
              </mask>
            </defs>
            <circle cx="11" cy="12" r="8" fill="#C5CEE0" mask="url(#story-crescent-mask)" opacity="0.7" />
          </svg>
        </Reveal>
        <Reveal as="p" className="about-story__closing-line" delay={0.2}>
          {closing[0]}
        </Reveal>
        <Reveal as="p" className="about-story__closing-line" delay={0.4}>
          {closing[1]}
        </Reveal>
        <Reveal as="p" className="about-story__closing-line about-story__closing-final" delay={0.7}>
          {closing[2]}
        </Reveal>
      </div>
    </section>
  );
}

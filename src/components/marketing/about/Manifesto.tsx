import { t, type Locale } from "@/lib/marketing/i18n";
import { Reveal } from "../Reveal";

export function Manifesto({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const lines = [1, 2, 3, 4, 5, 6, 7].map((i) => t(locale, `about.manifesto.${i}`));

  return (
    <section className={`about-section about-manifesto${isAr ? " is-ar" : ""}`}>
      <Reveal className="about-manifesto__eyebrow">{t(locale, "about.manifesto.eyebrow")}</Reveal>
      <div className="about-manifesto__divider" />
      <div className="about-manifesto__lines">
        {lines.map((line, i) =>
          line === "" ? (
            <div className="about-manifesto__line is-spacer" key={`spacer-${i}`} />
          ) : (
            <Reveal as="p" className="about-manifesto__line" delay={i * 0.2} key={`line-${i}`}>
              {line}
            </Reveal>
          ),
        )}
      </div>
      <svg className="about-manifesto__wolf" viewBox="0 0 600 400" aria-hidden="true">
        <defs>
          <linearGradient id="wolf-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8ECF4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#E8ECF4" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          fill="url(#wolf-fade)"
          d="M120 320 L130 240 L115 200 L130 170 L160 150 L195 100 L210 130 L235 95 L250 135 L290 110 L305 145 L350 130 L370 165 L410 155 L435 195 L470 200 L490 235 L495 280 L480 320 L450 335 L420 330 L390 340 L360 335 L330 345 L290 338 L250 348 L210 340 L170 345 L140 335 Z"
        />
        <path fill="url(#wolf-fade)" d="M195 100 L188 70 L210 92 Z" />
        <path fill="url(#wolf-fade)" d="M250 135 L245 105 L265 128 Z" />
      </svg>
    </section>
  );
}

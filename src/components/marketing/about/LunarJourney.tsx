"use client";

import { useEffect, useRef } from "react";
import { t, type Locale } from "@/lib/marketing/i18n";
import { Reveal } from "../Reveal";

// Scroll-driven lunar phase: the shadow circle slides across the disc, the halo
// brightens, the moon scales up, and the rail highlights the current chapter as
// the section scrolls past.
export function LunarJourney({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const label = t(locale, "about.chapter.label");
  const chapters = [1, 2, 3, 4].map((i) => ({
    index: t(locale, `about.chapter.${i}.index`),
    phase: t(locale, `about.chapter.${i}.phase`),
    title: t(locale, `about.chapter.${i}.title`),
    body: t(locale, `about.chapter.${i}.body`),
  }));

  const sectionRef = useRef<HTMLElement>(null);
  const moonRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<SVGCircleElement>(null);
  const haloRef = useRef<SVGCircleElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const moon = moonRef.current;
    const shadow = shadowRef.current;
    const halo = haloRef.current;
    const rail = railRef.current;
    if (!section || !moon || !shadow || !halo || !rail) return;
    const dots = Array.from(section.querySelectorAll<HTMLElement>("[data-dot]"));
    const r = 220;
    let frame = 0;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const scrolled = Math.max(0, Math.min(total, -rect.top));
      const progress = total > 0 ? scrolled / total : 0;

      const shadowX = -r * 1.6 + progress * (r * 2.0);
      const glow = 0.15 + progress * 0.5;
      const scale = 0.9 + progress * 0.15;
      shadow.setAttribute("cx", String(shadowX));
      halo.setAttribute("opacity", String(glow));
      moon.style.transform = `translate(-50%, -50%) scale(${scale})`;

      const inView = rect.top < vh && rect.bottom > 0;
      moon.classList.toggle("is-visible", inView);
      rail.classList.toggle("is-visible", inView);

      const current = Math.min(dots.length - 1, Math.floor(progress * dots.length));
      dots.forEach((d, i) => d.classList.toggle("is-active", i === current));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        update();
        frame = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      id="lunar-journey"
      className={`about-section about-journey${isAr ? " is-ar" : ""}`}
      ref={sectionRef}
      style={{ height: `${chapters.length * 100}vh` }}
    >
      <div className="about-journey__moon" ref={moonRef} aria-hidden="true">
        <svg width="440" height="440" viewBox="-220 -220 440 440">
          <defs>
            <radialGradient id="journey-glow" cx="0" cy="0" r="0.5">
              <stop offset="0%" stopColor="#E8ECF4" stopOpacity="0.6" />
              <stop offset="40%" stopColor="#C5CEE0" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#060F2B" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="journey-disc" cx="-0.2" cy="-0.2" r="1.1">
              <stop offset="0%" stopColor="#F0F2F7" />
              <stop offset="55%" stopColor="#C5CEE0" />
              <stop offset="100%" stopColor="#5A6680" />
            </radialGradient>
            <radialGradient id="journey-texture" cx="0.3" cy="0.4" r="0.8">
              <stop offset="0%" stopColor="#060F2B" stopOpacity="0" />
              <stop offset="80%" stopColor="#060F2B" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#060F2B" stopOpacity="0.4" />
            </radialGradient>
            <clipPath id="journey-clip">
              <circle cx="0" cy="0" r="220" />
            </clipPath>
          </defs>
          <circle cx="0" cy="0" r="418" fill="url(#journey-glow)" ref={haloRef} opacity="0.15" />
          <circle cx="0" cy="0" r="220" fill="url(#journey-disc)" />
          <g opacity="0.1" clipPath="url(#journey-clip)">
            <circle cx="-60" cy="-40" r="22" fill="#060F2B" />
            <circle cx="40" cy="20" r="14" fill="#060F2B" />
            <circle cx="80" cy="-70" r="9" fill="#060F2B" />
            <circle cx="-30" cy="80" r="18" fill="#060F2B" />
            <circle cx="100" cy="60" r="11" fill="#060F2B" />
            <circle cx="-110" cy="30" r="7" fill="#060F2B" />
          </g>
          <circle cx="0" cy="0" r="220" fill="url(#journey-texture)" />
          <g clipPath="url(#journey-clip)">
            <circle cx="-352" cy="0" r="224" fill="#060F2B" ref={shadowRef} />
          </g>
          <circle cx="0" cy="0" r="220" fill="none" stroke="#3A4563" strokeWidth="0.5" opacity="0.6" />
        </svg>
      </div>

      <div className="about-journey__rail" ref={railRef} aria-hidden="true">
        {chapters.map((c, i) => (
          <div className={`about-journey__dot${i === 0 ? " is-active" : ""}`} data-dot key={c.index}>
            <span>
              {label} {c.index}
            </span>
          </div>
        ))}
      </div>

      <div className="about-journey__inner">
        {chapters.map((chapter, i) => (
          <div
            className={`about-journey__chapter about-journey__chapter--${i % 2 === 0 ? "odd" : "even"}`}
            key={chapter.index}
          >
            <div className="about-journey__content">
              <Reveal className="about-journey__chapter-index">
                {label} {chapter.index}
              </Reveal>
              <Reveal className="about-journey__chapter-phase" delay={0.1}>
                {chapter.phase}
              </Reveal>
              <Reveal as="h2" className="about-journey__chapter-title" delay={0.2}>
                {chapter.title}
              </Reveal>
              <Reveal as="p" className="about-journey__chapter-body" delay={0.35}>
                {chapter.body}
              </Reveal>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import { t, type Locale } from "@/lib/marketing/i18n";

const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

// Full-viewport about hero: staggered entrance (via .is-loaded) plus a gentle
// mouse parallax on the content.
export function AboutHero({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    const raf = requestAnimationFrame(() => section?.classList.add("is-loaded"));
    if (!content || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => cancelAnimationFrame(raf);
    }
    let frame = 0;
    const onMove = (e: MouseEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * -8;
        const y = (e.clientY / window.innerHeight - 0.5) * -8;
        content.style.transform = `translate(${x}px, ${y}px)`;
        frame = 0;
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const brand = t(locale, "about.hero.brand");
  return (
    <section
      ref={sectionRef}
      className={`about-section about-hero${isAr ? " is-ar" : ""}`}
    >
      <div className="about-hero__vignette" aria-hidden="true" />
      <div className="about-hero__content" data-parallax ref={contentRef}>
        <div className="about-hero__eyebrow" data-reveal>
          {t(locale, "about.hero.eyebrow")}
        </div>
        <div className="about-hero__mark" data-reveal style={delay(200)}>
          {isAr ? (
            <span className="about-hero__brand" lang="ar">
              {brand}
            </span>
          ) : (
            <Image
              className="about-hero__logo"
              src="/assets/logo_2.png"
              alt={brand}
              width={680}
              height={183}
              priority
            />
          )}
        </div>
        <div className="about-hero__divider" data-reveal style={delay(500)} />
        <p className="about-hero__lede" data-reveal style={delay(700)}>
          {t(locale, "about.hero.lede")}
        </p>
      </div>
      <div className="about-hero__scroll" data-reveal style={delay(1400)} aria-hidden="true">
        <span className="about-hero__scroll-text">{t(locale, "about.hero.scroll")}</span>
        <span className="about-hero__scroll-line" />
      </div>
    </section>
  );
}

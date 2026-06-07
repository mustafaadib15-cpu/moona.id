"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { t, type Locale } from "@/lib/marketing/i18n";

// Full-screen intro: brand mark holds, then fades out, releasing scroll.
export function IntroOverlay({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = ref.current;
    if (!overlay) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      overlay.classList.add("is-done");
      return;
    }
    document.body.style.overflow = "hidden";
    const t1 = window.setTimeout(() => overlay.classList.add("is-hold"), 100);
    const t2 = window.setTimeout(() => {
      overlay.classList.remove("is-hold");
      overlay.classList.add("is-exit");
    }, 2800);
    const t3 = window.setTimeout(() => {
      overlay.classList.add("is-done");
      document.body.style.overflow = "";
    }, 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="intro-overlay" ref={ref} aria-hidden="true">
      {isAr ? (
        <div className="intro-overlay__brand" lang="ar">
          {t(locale, "about.intro.brand")}
        </div>
      ) : (
        <Image
          className="intro-overlay__logo"
          src="/assets/logo_2.png"
          alt={t(locale, "about.intro.alt")}
          width={620}
          height={167}
          priority
        />
      )}
    </div>
  );
}

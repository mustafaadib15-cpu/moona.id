"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { t, type Locale } from "@/lib/marketing/i18n";
import { LangSwitch } from "./LangSwitch";

interface NavProps {
  locale: Locale;
}

// Fixed top bar. Transparent over the hero; gains a translucent kohl
// background + blur after 80px of scroll. On mobile, a hamburger opens a
// full-screen overlay. Cross-area portal link uses a full navigation.
export function Nav({ locale }: NavProps) {
  const base = locale === "en" ? "/en" : "";
  const home = `${base}/`;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const links = [
    { href: `${base}/#services`, label: t(locale, "nav.services") },
    { href: `${base}/about`, label: t(locale, "nav.about") },
    { href: `${base}/audience`, label: t(locale, "nav.contact") },
  ];
  // Clear, brand-recognizable link into the sign-in (same label both locales).
  const portalLabel = "Moona Portal";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const cls = ["nav", scrolled ? "is-scrolled" : "", open ? "is-open" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={cls} data-nav>
      <div className="nav__inner container">
        {locale === "en" ? (
          <a className="nav__brand nav__brand--logo" href={home} aria-label="Moona">
            <Image
              className="nav__logo"
              src="/assets/logo_1.png"
              width={119}
              height={22}
              alt="Moona"
            />
          </a>
        ) : (
          <a className="nav__brand" href={home}>
            {t(locale, "nav.brand")}
          </a>
        )}

        <nav className="nav__links" aria-label="Primary">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          <a className="nav__portal" href="/portal" lang="en">
            {portalLabel}
          </a>
          <LangSwitch locale={locale} className="nav__lang" />
          <a className="btn btn--outline nav__cta" href={`${base}/audience`}>
            {t(locale, "nav.cta")}
          </a>
          <button
            className="nav__toggle"
            type="button"
            aria-expanded={open}
            aria-controls="nav-menu"
            aria-label={t(locale, "nav.menu")}
            onClick={() => setOpen((o) => !o)}
          >
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <div className="nav__overlay" id="nav-menu">
        <nav className="nav__overlay-links" aria-label="Mobile">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a className="nav__portal" href="/portal" lang="en" onClick={() => setOpen(false)}>
            {portalLabel}
          </a>
          <a
            className="btn btn--outline"
            href={`${base}/audience`}
            onClick={() => setOpen(false)}
          >
            {t(locale, "nav.cta")}
          </a>
        </nav>
        <LangSwitch locale={locale} className="nav__overlay-lang" />
      </div>
    </header>
  );
}

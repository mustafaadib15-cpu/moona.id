import type { Metadata } from "next";
import { alternatePath, ogLocale, type Locale } from "./i18n";

export const SITE = "https://moona.id";
export const OG_IMAGE = "/assets/og.png";

function abs(path: string): string {
  if (path === "/") return `${SITE}/`;
  return SITE + path.replace(/\/+$/, "");
}

export function canonicalUrl(path: string): string {
  return abs(path.replace(/\/+$/, "") || "/");
}

// Organization JSON-LD as a string, ready for a ld+json script tag.
export function organizationLd(locale: Locale): string {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: locale === "ar" ? "منى التنفيذية" : "Moona Executive",
    alternateName: locale === "ar" ? "مُنى" : "Moona",
    url: SITE,
    email: "gov@moona.id",
    slogan: locale === "ar" ? "حضور راقي" : "Refined Presence",
    foundingLocation: {
      "@type": "Place",
      name: locale === "ar" ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: locale === "ar" ? "الرياض" : "Riyadh",
      addressCountry: "SA",
    },
    founder: {
      "@type": "Person",
      name: locale === "ar" ? "مصطفى أديب" : "Mustafa Adib",
    },
  };
  return JSON.stringify(data);
}

// Build a Next Metadata object with canonical + hreflang alternates and OG.
export function marketingMetadata(opts: {
  locale: Locale;
  path: string;
  title: string;
  description?: string;
}): Metadata {
  const { locale, path, title, description } = opts;
  const canonical = canonicalUrl(path);
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: abs(alternatePath(path, "en")),
        ar: abs(alternatePath(path, "ar")),
        "x-default": abs(alternatePath(path, "ar")),
      },
    },
    openGraph: {
      type: "website",
      siteName: "Moona",
      title,
      description,
      url: canonical,
      locale: ogLocale(locale),
      images: [SITE + OG_IMAGE],
    },
    twitter: { card: "summary_large_image" },
  };
}

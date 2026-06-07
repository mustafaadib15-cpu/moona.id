import type { Metadata } from "next";
import "@/styles/marketing/about.css";
import { t } from "@/lib/marketing/i18n";
import { marketingMetadata } from "@/lib/marketing/seo";
import { AboutView } from "@/components/marketing/views/AboutView";

const locale = "en" as const;

export const metadata: Metadata = marketingMetadata({
  locale,
  path: "/en/about",
  title: t(locale, "about.meta.title"),
  description: t(locale, "about.meta.description"),
});

export default function AboutPageEn() {
  return <AboutView locale={locale} />;
}

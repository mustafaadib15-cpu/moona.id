import type { Metadata } from "next";
import { t } from "@/lib/marketing/i18n";
import { marketingMetadata } from "@/lib/marketing/seo";
import { HomeView } from "@/components/marketing/views/HomeView";

const locale = "en" as const;

export const metadata: Metadata = marketingMetadata({
  locale,
  path: "/en/",
  title: t(locale, "meta.title"),
  description: t(locale, "meta.description"),
});

export default function HomePageEn() {
  return <HomeView locale={locale} />;
}

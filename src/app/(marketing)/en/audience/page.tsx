import type { Metadata } from "next";
import "@/styles/marketing/audience.css";
import { t } from "@/lib/marketing/i18n";
import { marketingMetadata } from "@/lib/marketing/seo";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { AudienceForm } from "@/components/marketing/AudienceForm";

const locale = "en" as const;

export const metadata: Metadata = marketingMetadata({
  locale,
  path: "/en/audience",
  title: t(locale, "audience.meta.title"),
  description: t(locale, "audience.meta.description"),
});

export default function AudiencePageEn() {
  return (
    <MarketingShell locale={locale}>
      <AudienceForm locale={locale} />
    </MarketingShell>
  );
}

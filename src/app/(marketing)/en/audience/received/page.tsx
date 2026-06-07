import type { Metadata } from "next";
import "@/styles/marketing/audience.css";
import { t } from "@/lib/marketing/i18n";
import { marketingMetadata } from "@/lib/marketing/seo";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { AudienceReceived } from "@/components/marketing/AudienceReceived";

const locale = "en" as const;

export const metadata: Metadata = marketingMetadata({
  locale,
  path: "/en/audience/received",
  title: t(locale, "audience.received.meta.title"),
});

export default function AudienceReceivedPageEn() {
  return (
    <MarketingShell locale={locale}>
      <AudienceReceived locale={locale} />
    </MarketingShell>
  );
}

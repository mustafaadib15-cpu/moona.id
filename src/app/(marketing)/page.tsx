import type { Metadata } from "next";
import { t } from "@/lib/marketing/i18n";
import { Hero } from "@/components/marketing/sections/Hero";
import { Value } from "@/components/marketing/sections/Value";
import { Workflow } from "@/components/marketing/sections/Workflow";
import { Industries } from "@/components/marketing/sections/Industries";
import { Services } from "@/components/marketing/sections/Services";
import { Deliverables } from "@/components/marketing/sections/Deliverables";
import { MidCta } from "@/components/marketing/sections/MidCta";
import { Testimonials } from "@/components/marketing/sections/Testimonials";
import { Faq } from "@/components/marketing/sections/Faq";
import { ClosingCTA } from "@/components/marketing/sections/ClosingCTA";

const locale = "ar" as const;

export const metadata: Metadata = {
  title: t(locale, "meta.title"),
  description: t(locale, "meta.description"),
};

export default function HomePage() {
  return (
    <>
      <Hero locale={locale} />
      <Value locale={locale} />
      <Workflow locale={locale} />
      <Industries locale={locale} />
      <Services locale={locale} />
      <Deliverables locale={locale} />
      <MidCta locale={locale} />
      <Testimonials locale={locale} />
      <Faq locale={locale} />
      <ClosingCTA locale={locale} />
    </>
  );
}

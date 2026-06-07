import { type Locale } from "@/lib/marketing/i18n";
import { MarketingShell } from "../MarketingShell";
import { Hero } from "../sections/Hero";
import { Value } from "../sections/Value";
import { Workflow } from "../sections/Workflow";
import { Industries } from "../sections/Industries";
import { Services } from "../sections/Services";
import { Deliverables } from "../sections/Deliverables";
import { MidCta } from "../sections/MidCta";
import { Testimonials } from "../sections/Testimonials";
import { Faq } from "../sections/Faq";
import { ClosingCTA } from "../sections/ClosingCTA";

export function HomeView({ locale }: { locale: Locale }) {
  return (
    <MarketingShell locale={locale}>
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
    </MarketingShell>
  );
}

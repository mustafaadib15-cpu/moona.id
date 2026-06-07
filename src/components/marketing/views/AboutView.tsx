import { type Locale } from "@/lib/marketing/i18n";
import { MarketingShell } from "../MarketingShell";
import { Stars } from "../Stars";
import { StarsParallax } from "../StarsParallax";
import { Vignette } from "../Vignette";
import { Grain } from "../Grain";
import { IntroOverlay } from "../about/IntroOverlay";
import { AboutHero } from "../about/AboutHero";
import { Story } from "../about/Story";
import { LunarJourney } from "../about/LunarJourney";
import { Practice } from "../about/Practice";
import { Manifesto } from "../about/Manifesto";
import { AudienceCTA } from "../about/AudienceCTA";

export function AboutView({ locale }: { locale: Locale }) {
  return (
    <MarketingShell locale={locale}>
      <IntroOverlay locale={locale} />
      <Stars />
      <StarsParallax />
      <Vignette />
      <Grain />
      <div className="about-stage">
        <AboutHero locale={locale} />
        <Story locale={locale} />
        <LunarJourney locale={locale} />
        <Practice locale={locale} />
        <Manifesto locale={locale} />
        <AudienceCTA locale={locale} />
      </div>
    </MarketingShell>
  );
}

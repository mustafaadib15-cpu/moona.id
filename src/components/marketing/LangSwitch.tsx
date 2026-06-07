"use client";

import { usePathname } from "next/navigation";
import { LOCALES, alternatePath, type Locale } from "@/lib/marketing/i18n";

interface LangSwitchProps {
  locale: Locale;
  className?: string;
}

const labels: Record<Locale, string> = { en: "EN", ar: "ع" };
const ariaLabels: Record<Locale, string> = { en: "View in English", ar: "العربية" };

// EN | ع toggle. Each option links to the matching-locale version of the
// current path. The Arabic glyph carries lang="ar" so it renders in Amiri.
export function LangSwitch({ locale, className }: LangSwitchProps) {
  const pathname = usePathname() || "/";
  return (
    <div
      className={["lang-switch", className].filter(Boolean).join(" ")}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((loc) => (
        <a
          key={loc}
          href={alternatePath(pathname, loc)}
          className={["lang-switch__opt", loc === locale ? "is-active" : ""]
            .filter(Boolean)
            .join(" ")}
          lang={loc}
          aria-label={ariaLabels[loc]}
          aria-current={loc === locale ? "true" : undefined}
        >
          {labels[loc]}
        </a>
      ))}
    </div>
  );
}

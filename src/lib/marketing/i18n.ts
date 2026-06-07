import en from "@/i18n/en.json";
import ar from "@/i18n/ar.json";

export type Locale = "en" | "ar";
export type Direction = "ltr" | "rtl";

const DICTIONARIES = { en, ar } as const;

export type TranslationKey = keyof typeof en & keyof typeof ar;

export function isLocale(value: string | undefined): value is Locale {
  return value === "en" || value === "ar";
}

export function resolveLocale(input: string | undefined): Locale {
  return isLocale(input) ? input : "ar";
}

export function dirFor(locale: Locale): Direction {
  return locale === "ar" ? "rtl" : "ltr";
}

export function ogLocale(locale: Locale): string {
  return locale === "ar" ? "ar_SA" : "en_US";
}

export function htmlLang(locale: Locale): string {
  return locale === "ar" ? "ar" : "en";
}

/**
 * Translate a key. Overloaded so static known keys are checked against
 * TranslationKey, while dynamic template-literal keys (e.g. `value.${i}.title`)
 * compile via the string overload. Missing keys fall back to the EN entry,
 * then to the key itself.
 */
export function t(locale: Locale, key: TranslationKey): string;
export function t(locale: Locale, key: string): string;
export function t(locale: Locale, key: string): string {
  const value = (DICTIONARIES[locale] as Record<string, string>)[key];
  if (typeof value === "string") return value;
  const fallback = (DICTIONARIES.en as Record<string, string>)[key];
  return typeof fallback === "string" ? fallback : key;
}

/**
 * Map an AR path to its EN equivalent and vice versa. AR is the default and
 * lives at root; EN lives under /en/. Used by LangSwitch and hreflang.
 */
export function alternatePath(currentPath: string, targetLocale: Locale): string {
  const clean = currentPath.replace(/\/+$/, "") || "/";
  const stripped = clean.startsWith("/en/")
    ? clean.slice(3) || "/"
    : clean === "/en"
      ? "/"
      : clean;
  if (targetLocale === "en") {
    return stripped === "/" ? "/en/" : `/en${stripped}`;
  }
  return stripped === "" ? "/" : stripped;
}

export const LOCALES: Locale[] = ["en", "ar"];

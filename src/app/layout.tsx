import type { Metadata } from "next";
import { Amiri, Tajawal, Cormorant_Garamond, Outfit } from "next/font/google";

// Arabic display: titles, hooks, subjects.
const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

// Arabic body / UI: paragraphs, labels, buttons.
const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

// Latin display: marketing display type, portal numerals.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

// Latin UI / kickers: uppercase, wide tracking.
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Moona",
  description: "Moona, refined presence.",
};

// Thin document shell shared by the whole site (marketing + portal). Each
// route group imports its own design system; the default direction is
// Arabic RTL. EN marketing routes override dir/lang on their own wrapper.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${amiri.variable} ${tajawal.variable} ${cormorant.variable} ${outfit.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}

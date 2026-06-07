# Moona Design System - Client Portal

Dark, calm, editorial. Deep navy night sky, moonlight silver, generous space, sharp corners. Arabic-first, RTL. No bright colors, no light mode, no gradients beyond the background. The prototype in `reference/moona-client-portal.html` is the visual target; match it.

## Color Tokens
| Token | Hex / value | Use |
|-------|-------------|-----|
| `--kohl` | `#07080c` | page background base |
| `--navy-panel` | `rgba(10,14,28,0.55)` | cards, panels |
| `--navy-panel-2` | `rgba(13,24,58,0.5)` | raised panels |
| `--silver` | `#c8c4ba` | lunar silver: primary accent, solid buttons, labels |
| `--ice` | `#d7e6f2` | moonlight highlight: hooks, links, key text |
| `--moon` | `#dbe7f4` | moon dots, fine highlights |
| `--text` | `#dde4ef` | body text |
| `--muted` | `#8e98ad` | secondary text, meta |
| `--line` | `rgba(215,230,242,0.13)` | borders |
| `--line-2` | `rgba(215,230,242,0.07)` | inner dividers |

Solid buttons: silver background `#c8c4ba`, text `#0a1330`; hover -> ice `#d7e6f2`.
Status chips: approved/delivered = silver solid; revision/in-review = ice outline; pending/upcoming = muted outline.

## Typography
Load via next/font. Default UI is Arabic.
| Role | Font | Notes |
|------|------|-------|
| Arabic display / headings | Amiri (700/400) | titles, hooks, subjects |
| Arabic body / UI | Tajawal (300-700) | paragraphs, labels, buttons |
| Latin display | Cormorant Garamond | big numerals (post numbers, counters), lining-nums |
| Latin UI / kickers | Outfit (300-500) | uppercase kickers, letterspacing .18-.36em |

Rules: Arabic text always `letter-spacing: 0` and never italic. Numerals use `font-variant-numeric: lining-nums`. Kickers are uppercase Outfit with wide tracking.

## Shape + Motion
- Border radius: 0 everywhere. The only round elements are "moon" dots (small circles, `border-radius: 50%`).
- Borders are 1px hairlines in `--line`. Cards sit on translucent navy panels.
- Background: fixed full-cover starfield (`reference/assets/starfield.png`) under a soft radial edge vignette for readability. Stays fixed on scroll.
- Motion is minimal: short fade/translate on view change (~.35s). No bounces, no large animations.

## Tailwind 4 setup (globals.css)
```css
@import "tailwindcss";
@theme {
  --color-kohl: #07080c;
  --color-silver: #c8c4ba;
  --color-ice: #d7e6f2;
  --color-moon: #dbe7f4;
  --color-fg: #dde4ef;
  --color-muted: #8e98ad;
  --radius: 0px;
  --font-ar-display: "Amiri", serif;
  --font-ar: "Tajawal", sans-serif;
  --font-latin-display: "Cormorant Garamond", serif;
  --font-latin: "Outfit", sans-serif;
}
html { color-scheme: dark; }
body {
  background-color: var(--color-kohl);
  background-image:
    radial-gradient(135% 100% at 50% 0%, rgba(7,8,12,0) 42%, rgba(6,7,12,0.6) 100%),
    url("/images/starfield.png");
  background-size: cover, cover;
  background-position: center top, center center;
  background-repeat: no-repeat, no-repeat;
  background-attachment: fixed, fixed;
  color: var(--color-fg);
  font-family: var(--font-ar);
}
```
Restyle shadcn components to these tokens: zero radius, hairline borders, silver/ice accents, translucent navy surfaces. Do not ship default shadcn rounded/colored variants.

## Brand Assets (in reference/assets)
- `logo.png` - Moona wordmark "REFINED PRESENCE" (light, transparent). Top bar + login.
- `starfield.png` - page background. Copy to `public/images/starfield.png`.
- Tagline for footers: "حضور راقي" (Refined Presence).

## Layout Notes
- Login: centered panel on the starfield, logo, "بوابة العملاء", email + password, then sign in.
- App shell: sticky top bar; right-hand side nav (RTL) with active item in silver solid; main content max-width ~1180px.
- Under 780px: side nav collapses to a sticky horizontal row beneath the top bar.

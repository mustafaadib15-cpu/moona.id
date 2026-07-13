import type { MetadataRoute } from "next";

// Web app manifest: drives the icon and colors when the site is saved to a phone
// home screen (Android reads these icons; iOS uses apple-icon.png). Next emits
// <link rel="manifest"> automatically.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Moona",
    short_name: "Moona",
    description: "Moona, refined presence.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A1B4D",
    theme_color: "#0A1B4D",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

"use client";

import { useEffect, useRef } from "react";

const EMBED_SCRIPT_SRC = "https://tally.so/widgets/embed.js";

declare global {
  interface Window {
    Tally?: { loadEmbeds: () => void };
  }
}

// Embeds a Tally form so it renders directly on the portal background.
// The form itself is themed dark navy from the Tally side, so with
// transparentBackground=1 it blends into the starfield layout.
export function TallyEmbed({ formId, title }: { formId: string; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const load = () => window.Tally?.loadEmbeds();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${EMBED_SCRIPT_SRC}"]`);
    if (window.Tally) {
      load();
    } else if (existing) {
      existing.addEventListener("load", load, { once: true });
    } else {
      const script = document.createElement("script");
      script.src = EMBED_SCRIPT_SRC;
      script.async = true;
      script.addEventListener("load", load, { once: true });
      document.body.appendChild(script);
    }
  }, []);

  return (
    <iframe
      ref={ref}
      data-tally-src={`https://tally.so/embed/${formId}?alignLeft=1&hideTitle=0&transparentBackground=1&dynamicHeight=1`}
      loading="lazy"
      width="100%"
      height="600"
      frameBorder="0"
      marginHeight={0}
      marginWidth={0}
      title={title}
      className="tally-frame"
    />
  );
}

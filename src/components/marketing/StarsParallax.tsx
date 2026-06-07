"use client";

import { useEffect } from "react";

// Gentle mouse-driven drift for the star field. Attaches to the server-
// rendered [data-stars] element so the stars themselves never re-render.
export function StarsParallax() {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>("[data-stars]");
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    let frame = 0;
    const onMove = (e: MouseEvent) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 4;
        const y = (e.clientY / window.innerHeight - 0.5) * 4;
        el.style.transform = `translate(${x}px, ${y}px)`;
        frame = 0;
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}

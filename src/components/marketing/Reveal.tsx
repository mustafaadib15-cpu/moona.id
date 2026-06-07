"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealProps {
  as?: "div" | "li" | "figure";
  className?: string;
  delay?: number;
  children: ReactNode;
}

// Scroll-triggered fade-up wrapper. Adds .is-visible when the element enters
// the viewport (once). Honors prefers-reduced-motion and degrades to visible
// if IntersectionObserver is unavailable. `delay` (seconds) staggers entrances.
export function Reveal({ as = "div", className, delay = 0, children }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      // No animation: reveal on the next frame (keeps setState out of the
      // effect body) and skip observing.
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const setRef = (node: HTMLElement | null) => {
    ref.current = node;
  };
  const cls = ["reveal", visible ? "is-visible" : "", className]
    .filter(Boolean)
    .join(" ");
  const style = delay ? { transitionDelay: `${delay}s` } : undefined;

  if (as === "li") {
    return (
      <li ref={setRef} className={cls} data-reveal="" style={style}>
        {children}
      </li>
    );
  }
  if (as === "figure") {
    return (
      <figure ref={setRef} className={cls} data-reveal="" style={style}>
        {children}
      </figure>
    );
  }
  return (
    <div ref={setRef} className={cls} data-reveal="" style={style}>
      {children}
    </div>
  );
}

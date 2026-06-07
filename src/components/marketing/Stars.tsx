import type { CSSProperties } from "react";

// Three parallax star layers built from box-shadows. Generated on the server
// so the field is part of the static HTML; StarsParallax adds the mouse drift.
function generate(count: number): string {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 2000);
    const y = Math.floor(Math.random() * 2000);
    out.push(`${x}px ${y}px #E8ECF4`);
  }
  return out.join(",");
}

export function Stars() {
  const small = generate(700);
  const medium = generate(200);
  const large = generate(100);
  const vars = {
    "--smallShadow": small,
    "--mediumShadow": medium,
    "--largeShadow": large,
  } as CSSProperties;

  return (
    <div className="cosmic-parallax" data-stars aria-hidden="true" style={vars}>
      <div className="cosmic-stars" style={{ boxShadow: small }} />
      <div className="cosmic-stars-medium" style={{ boxShadow: medium }} />
      <div className="cosmic-stars-large" style={{ boxShadow: large }} />
    </div>
  );
}

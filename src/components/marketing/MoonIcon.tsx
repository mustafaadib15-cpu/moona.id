import Image from "next/image";

interface MoonIconProps {
  size?: number;
  className?: string;
  title?: string;
}

// The Moona brand mark (calligraphic glyph, ~2.1:1). width drives the size;
// height is derived from the intrinsic aspect ratio.
export function MoonIcon({ size = 60, className, title }: MoonIconProps) {
  const height = Math.round(size / 2.1);
  return (
    <Image
      className={["moon-icon", className].filter(Boolean).join(" ")}
      src="/assets/icon-transparent.png"
      width={size}
      height={height}
      alt={title ?? "Moona"}
    />
  );
}

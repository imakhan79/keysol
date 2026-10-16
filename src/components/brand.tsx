import { useId } from "react";

// Capitalink Technologies arc mark. Mirrors public/logo-mark.svg; ids are scoped so several marks can share a page.
export function BrandMark({ className, light = false }: { className?: string; light?: boolean }) {
  const id = useId();
  const g = (n: number) => `${id}-g${n}`;
  // On dark backgrounds the deep blue end is lifted so the arcs stay visible.
  const deep = light ? "#3f8fd0" : "#105088";
  const mid = light ? "#3aa0c8" : "#2878a8";
  return (
    <svg viewBox="12 10 212 82" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={g(1)} x1="16" y1="0" x2="115" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4cc2b4" />
          <stop offset="1" stopColor="#3aa6b2" />
        </linearGradient>
        <linearGradient id={g(2)} x1="44" y1="0" x2="179" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#46b8b0" />
          <stop offset="0.5" stopColor="#2f8fb0" />
          <stop offset="1" stopColor={light ? "#3a8cc8" : "#1a5f98"} />
        </linearGradient>
        <linearGradient id={g(3)} x1="94" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3fb0b2" />
          <stop offset="0.45" stopColor={mid} />
          <stop offset="1" stopColor={deep} />
        </linearGradient>
      </defs>
      <path d="M16 90C30 70 50 56 75 52C92 50 105 54 115 60C100 58 85 57 70 60C50 64 32 76 16 90Z" fill={`url(#${g(1)})`} />
      <path d="M44 54C60 38 80 32 100 33C135 36 162 60 179 83L160 83C145 63 125 50 100 48C80 47 60 50 44 54Z" fill={`url(#${g(2)})`} />
      <path d="M94 24C110 14 135 11 155 18C185 30 205 60 220 85L193 85C178 60 160 42 140 33C125 26 110 24 94 24Z" fill={`url(#${g(3)})`} />
    </svg>
  );
}

/** Stacked lockup: arc mark centred over the small-caps wordmark, as in the brand logo. The wordmark is fixed artwork, not the CMS company name. */
export function BrandLogo({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <span className={`inline-flex flex-col items-center leading-none ${className}`}>
      <BrandMark light={light} className="-mb-0.5 h-[0.95em] w-auto translate-x-[-4%]" />
      <span
        className={`font-wordmark text-[1em] tracking-[0.02em] whitespace-nowrap [font-variant-caps:small-caps] ${
          light ? "text-white" : "text-navy"
        }`}
      >
        Capitalink Technologies
      </span>
    </span>
  );
}

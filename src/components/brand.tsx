// Capitalink Technologies brand artwork. Source files live in public/brand/
// (mark = arc icon only, logo = icon + wordmark lockup); -white variants are
// pre-recoloured for use on dark backgrounds.

/** Arc icon only, no wordmark. Used where space is tight (e.g. the admin sidebar). */
export function BrandMark({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static brand asset, no need for next/image here
    <img
      src={light ? "/brand/mark-white.png" : "/brand/mark.png"}
      alt=""
      className={`inline-block w-auto object-contain ${className ?? ""}`}
    />
  );
}

/** Full lockup: arc mark over the "Capitalink Technologies" wordmark, as fixed brand artwork. */
export function BrandLogo({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static brand asset, no need for next/image here
    <img
      src={light ? "/brand/logo-white.png" : "/brand/logo.png"}
      alt="Capitalink Technologies"
      className={`block w-auto object-contain ${className}`}
    />
  );
}

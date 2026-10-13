import Image from "next/image";

// Images uploaded through the admin live in Supabase Storage and go through the Next.js image
// optimiser (resized, modern formats). URLs pasted from other hosts render as-is.
const storagePrefix = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/`
  : null;

export function CmsImage({
  src,
  alt,
  className,
  sizes = "100vw",
  width = 1600,
  height = 1000,
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  width?: number;
  height?: number;
  eager?: boolean;
}) {
  if (storagePrefix && src.startsWith(storagePrefix)) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={className}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- external CMS URL from an arbitrary host
  return <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} className={className} />;
}

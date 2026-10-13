import type { Metadata } from "next";
import { getSeoSettings } from "./content";

export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
}: {
  title: string;
  description?: string | null;
  path: string;
  image?: string | null;
  type?: "website" | "article";
}): Metadata {
  return {
    title,
    description: description ?? undefined,
    alternates: { canonical: path },
    openGraph: {
      title,
      description: description ?? undefined,
      url: path,
      type,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

/** Applies any Admin → SEO settings override for this page's path. */
export async function withSeoOverrides(meta: Metadata): Promise<Metadata> {
  const path = String(meta.alternates?.canonical ?? "");
  const override = (await getSeoSettings()).find((s) => s.path === path);
  if (!override) return meta;
  // The homepage title is used as-is, without the "| Company" suffix.
  const title = override.meta_title ? (path === "/" ? { absolute: override.meta_title } : override.meta_title) : meta.title;
  const description = override.meta_description || meta.description;
  return {
    ...meta,
    title,
    description,
    openGraph: {
      ...meta.openGraph,
      title: (override.meta_title || meta.openGraph?.title) ?? undefined,
      description: description ?? undefined,
      ...(override.og_image_url ? { images: [{ url: override.og_image_url }] } : {}),
    },
    ...(override.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

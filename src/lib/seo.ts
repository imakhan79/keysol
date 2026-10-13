import type { Metadata } from "next";

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

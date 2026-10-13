import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Markdown } from "@/components/markdown";
import { PageHero } from "@/components/site/ui";
import { getPage } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

/** Pages edited in Admin → Pages (About, Privacy, Terms, ...). */
export async function cmsPageMetadata(slug: string): Promise<Metadata> {
  const page = await getPage(slug);
  if (!page) return {};
  return pageMetadata({ title: page.seo_title || page.title, description: page.seo_description, path: `/${slug}` });
}

export async function CmsPage({ slug, children }: { slug: string; children?: React.ReactNode }) {
  const page = await getPage(slug);
  if (!page) notFound();
  return (
    <>
      <PageHero title={page.title} description={page.seo_description ?? undefined} crumbs={[{ href: `/${slug}`, label: page.title }]} />
      <div className="container-page max-w-3xl py-16">
        <Markdown>{page.body}</Markdown>
      </div>
      {children}
    </>
  );
}

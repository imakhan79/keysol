import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { Markdown } from "@/components/markdown";
import { CtaBanner, DetailSkeleton, PageHero, PostCard } from "@/components/site/ui";
import { getPost, getPosts, getSettings, getSlugs } from "@/lib/content";
import { formatDate, siteUrl } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  return getSlugs("blog_posts");
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return { title: "Article not found" };
  return pageMetadata({
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.cover_image_url,
    type: "article",
  });
}

export default function PostPage(props: PageProps<"/blog/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <PostDetail params={props.params} />
    </Suspense>
  );
}

async function PostDetail({ params }: Pick<PageProps<"/blog/[slug]">, "params">) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  const [posts, { company }] = await Promise.all([getPosts(), getSettings()]);
  const more = posts.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.published_at ?? undefined,
          dateModified: post.updated_at,
          image: post.cover_image_url ?? undefined,
          author: { "@type": "Organization", name: post.author_name || company.name },
          publisher: { "@type": "Organization", name: company.name },
          mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
        }}
      />
      <PageHero
        eyebrow={post.tags.join(" · ") || "Blog"}
        title={post.title}
        description={post.excerpt}
        crumbs={[
          { href: "/blog", label: "Blog" },
          { href: `/blog/${post.slug}`, label: post.title },
        ]}
      >
        <p className="mt-6 text-sm text-slate-400">
          {post.author_name && <>{post.author_name} · </>}
          <time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at)}</time>
        </p>
      </PageHero>
      <article className="container-page max-w-3xl py-16">
        {post.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element -- CMS images come from arbitrary hosts
          <img src={post.cover_image_url} alt="" className="mb-10 w-full rounded-2xl border border-slate-200" />
        )}
        <Markdown className="prose-lg">{post.body}</Markdown>
        <div className="mt-12 rounded-2xl bg-slate-50 p-6">
          <p className="font-semibold">Need help putting this into practice?</p>
          <p className="mt-1 text-sm text-slate-600">Our team can review your situation and recommend next steps.</p>
          <Link href="/contact" className="btn-primary mt-4">
            Talk to an expert
          </Link>
        </div>
      </article>
      {more.length > 0 && (
        <section className="border-t border-slate-200 bg-slate-50 py-16">
          <div className="container-page">
            <h2 className="mb-8 text-2xl font-semibold tracking-tight">More articles</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {more.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaBanner />
    </>
  );
}

import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Share2 } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { Markdown } from "@/components/markdown";
import { CtaBanner, DetailSkeleton, PageHero, PostCard } from "@/components/site/ui";
import { getPost, getPosts, getSettings, getSlugs } from "@/lib/content";
import { formatDate, siteUrl } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import type { BlogPost } from "@/lib/types";

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
  const related = relatedPosts(post, posts);
  const url = `${siteUrl}/blog/${post.slug}`;

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
          mainEntityOfPage: url,
          articleSection: post.category || undefined,
          keywords: post.tags.join(", ") || undefined,
        }}
      />
      <PageHero
        eyebrow={post.category || "Blog"}
        title={post.title}
        description={post.excerpt}
        crumbs={[
          { href: "/blog", label: "Blog" },
          { href: `/blog/${post.slug}`, label: post.title },
        ]}
      >
        <p className="mt-6 text-sm text-slate-400">
          {post.author_name && (
            <>
              <Link href={`/blog?author=${encodeURIComponent(post.author_name)}`} className="hover:text-white">
                {post.author_name}
              </Link>{" "}
              ·{" "}
            </>
          )}
          <time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at)}</time>
        </p>
      </PageHero>
      <article className="container-page max-w-3xl py-16">
        {post.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element -- CMS images come from arbitrary hosts
          <img src={post.cover_image_url} alt="" className="mb-10 w-full rounded-2xl border border-slate-200" />
        )}
        <Markdown className="prose-lg">{post.body}</Markdown>
        <div className="mt-10 flex flex-col gap-6 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          {post.tags.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5 text-sm" aria-label="Tags">
              {post.tags.map((t) => (
                <li key={t}>
                  <Link
                    href={`/blog?tag=${encodeURIComponent(t)}`}
                    className="inline-block rounded-full border border-slate-200 px-2.5 py-1 text-slate-600 hover:border-brand-300 hover:text-brand-700"
                  >
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <span />
          )}
          <ShareLinks url={url} title={post.title} />
        </div>
        <div className="mt-12 rounded-2xl bg-slate-50 p-6">
          <p className="font-semibold">Need help putting this into practice?</p>
          <p className="mt-1 text-sm text-slate-600">Our team can review your situation and recommend next steps.</p>
          <Link href="/contact" className="btn-primary mt-4">
            Talk to an expert
          </Link>
        </div>
      </article>
      {related.length > 0 && (
        <section className="border-t border-slate-200 bg-slate-50 py-16">
          <div className="container-page">
            <h2 className="mb-8 text-2xl font-semibold tracking-tight">Related articles</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((p) => (
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

/** Same category and shared tags rank first; newer posts break ties (posts arrive newest first). */
function relatedPosts(post: BlogPost, posts: BlogPost[]) {
  const score = (p: BlogPost) =>
    (post.category && p.category === post.category ? 2 : 0) + p.tags.filter((t) => post.tags.includes(t)).length;
  return posts
    .filter((p) => p.id !== post.id)
    .map((p, i) => ({ p, s: score(p), i }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, 3)
    .map(({ p }) => p);
}

function ShareLinks({ url, title }: { url: string; title: string }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { label: "X", href: `https://x.com/intent/post?url=${u}&text=${t}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}` },
    { label: "Email", href: `mailto:?subject=${t}&body=${u}` },
  ];
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
        <Share2 className="size-4" /> Share
      </span>
      {links.map(({ label, href }) => (
        <a
          key={label}
          href={href}
          target={label === "Email" ? undefined : "_blank"}
          rel="noopener noreferrer"
          aria-label={`Share on ${label}`}
          className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
        >
          {label}
        </a>
      ))}
    </div>
  );
}

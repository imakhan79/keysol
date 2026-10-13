import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Search, X } from "lucide-react";
import { CtaBanner, EmptyState, PageHero, PostCard } from "@/components/site/ui";
import { getPosts } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import type { BlogPost } from "@/lib/types";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description: "Practical insights on digital communication, software, e-commerce, marketing and SEO.",
  path: "/blog",
});

export default function BlogPage(props: PageProps<"/blog">) {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Insights for growing businesses"
        description="Practical advice on messaging, software, e-commerce, digital marketing and technology strategy."
        crumbs={[{ href: "/blog", label: "Blog" }]}
      />
      <section className="container-page py-16">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-slate-50" />}>
          <BlogListing searchParams={props.searchParams} />
        </Suspense>
      </section>
      <CtaBanner />
    </>
  );
}

type Filters = { q: string; category: string; tag: string; author: string };

function matches(post: BlogPost, { q, category, tag, author }: Filters) {
  if (category && post.category !== category) return false;
  if (tag && !post.tags.includes(tag)) return false;
  if (author && post.author_name !== author) return false;
  if (!q) return true;
  const haystack = [post.title, post.excerpt, post.category, post.author_name, ...post.tags, post.body].join(" ").toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((word) => haystack.includes(word));
}

function hrefWith(filters: Filters, change: Partial<Filters>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...filters, ...change })) if (value) params.set(key, value);
  const qs = params.toString();
  return qs ? `/blog?${qs}` : "/blog";
}

async function BlogListing({ searchParams }: Pick<PageProps<"/blog">, "searchParams">) {
  const [sp, posts] = await Promise.all([searchParams, getPosts()]);
  const param = (key: string) => (typeof sp[key] === "string" ? (sp[key] as string).trim().slice(0, 100) : "");
  const filters: Filters = { q: param("q"), category: param("category"), tag: param("tag"), author: param("author") };
  const results = posts.filter((p) => matches(p, filters));

  const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))].sort();
  const tags = [...new Set(posts.flatMap((p) => p.tags))].sort();
  const active = Object.entries(filters).filter(([, v]) => v) as [keyof Filters, string][];
  const labels: Record<keyof Filters, string> = { q: "Search", category: "Category", tag: "Tag", author: "Author" };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
      <div className="order-2 lg:order-1">
        {active.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-600">
              {results.length} {results.length === 1 ? "article" : "articles"}
            </span>
            {active.map(([key, value]) => (
              <Link
                key={key}
                href={hrefWith(filters, { [key]: "" })}
                className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-brand-700 hover:bg-brand-100"
              >
                {labels[key]}: {value} <X className="size-3.5" aria-label="Remove filter" />
              </Link>
            ))}
            <Link href="/blog" className="text-slate-500 underline hover:text-brand-600">
              Clear all
            </Link>
          </div>
        )}
        {results.length === 0 ? (
          <EmptyState
            title={posts.length === 0 ? "No articles yet" : "No matching articles"}
            description={posts.length === 0 ? "Check back soon for new insights." : "Try a different search or clear the filters."}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {results.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      <aside className="order-1 space-y-8 lg:order-2">
        <form action="/blog" role="search">
          {filters.category && <input type="hidden" name="category" value={filters.category} />}
          {filters.tag && <input type="hidden" name="tag" value={filters.tag} />}
          <label htmlFor="blog-search" className="field-label">
            Search articles
          </label>
          <div className="relative">
            <input id="blog-search" name="q" type="search" defaultValue={filters.q} placeholder="e.g. CRM, SEO, SMS" className="field pr-10" />
            <button type="submit" aria-label="Search" className="absolute inset-y-0 right-0 grid w-10 place-items-center text-slate-500 hover:text-brand-600">
              <Search className="size-4" />
            </button>
          </div>
        </form>
        {categories.length > 0 && (
          <nav aria-label="Blog categories">
            <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Categories</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {categories.map((c) => (
                <li key={c}>
                  <Link
                    href={hrefWith(filters, { category: filters.category === c ? "" : c })}
                    aria-current={filters.category === c ? "true" : undefined}
                    className="flex justify-between rounded-md px-2 py-1.5 text-slate-700 hover:bg-slate-50 hover:text-brand-700 aria-[current]:bg-brand-50 aria-[current]:font-medium aria-[current]:text-brand-700"
                  >
                    {c}
                    <span className="text-slate-400">{posts.filter((p) => p.category === c).length}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {tags.length > 0 && (
          <nav aria-label="Blog tags">
            <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Tags</h2>
            <ul className="mt-3 flex flex-wrap gap-1.5 text-sm">
              {tags.map((t) => (
                <li key={t}>
                  <Link
                    href={hrefWith(filters, { tag: filters.tag === t ? "" : t })}
                    aria-current={filters.tag === t ? "true" : undefined}
                    className="inline-block rounded-full border border-slate-200 px-2.5 py-1 text-slate-600 hover:border-brand-300 hover:text-brand-700 aria-[current]:border-brand-500 aria-[current]:bg-brand-50 aria-[current]:text-brand-700"
                  >
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </aside>
    </div>
  );
}

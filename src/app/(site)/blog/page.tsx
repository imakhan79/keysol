import type { Metadata } from "next";
import { CtaBanner, EmptyState, PageHero, PostCard } from "@/components/site/ui";
import { getPosts } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description: "Practical insights on digital communication, software, e-commerce, marketing and SEO.",
  path: "/blog",
});

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Insights for growing businesses"
        description="Practical advice on messaging, software, e-commerce, digital marketing and technology strategy."
        crumbs={[{ href: "/blog", label: "Blog" }]}
      />
      <section className="container-page py-16">
        {posts.length === 0 ? (
          <EmptyState title="No articles yet" description="Check back soon for new insights." />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
      <CtaBanner />
    </>
  );
}

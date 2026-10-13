import type { Metadata } from "next";
import { CtaBanner, EmptyState, IndustryCard, PageHero } from "@/components/site/ui";
import { getIndustries } from "@/lib/content";
import { pageMetadata, withSeoOverrides } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverrides(
    pageMetadata({
  title: "Industries",
  description: "Technology, communication and marketing solutions tailored to retail, healthcare, education, finance and more.",
  path: "/industries",
}),
  );
}

export default async function IndustriesPage() {
  const industries = await getIndustries();
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title="Expertise across the sectors that matter to you"
        description="Every industry has its own customers, regulations and workflows. We bring proven patterns and adapt them to yours."
        crumbs={[{ href: "/industries", label: "Industries" }]}
      />
      <section className="container-page py-16">
        {industries.length === 0 ? (
          <EmptyState title="Industries coming soon" description="Get in touch to talk about your sector." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry) => (
              <IndustryCard key={industry.id} industry={industry} />
            ))}
          </div>
        )}
      </section>
      <CtaBanner />
    </>
  );
}

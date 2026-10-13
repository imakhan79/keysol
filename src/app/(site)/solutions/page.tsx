import type { Metadata } from "next";
import { CtaBanner, EmptyState, IndustryCard, PageHero, SectionHeading, SolutionCard } from "@/components/site/ui";
import { getIndustries, getSolutions } from "@/lib/content";
import { pageMetadata, withSeoOverrides } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverrides(
    pageMetadata({
  title: "Solutions",
  description:
    "Technology solutions for business owners, IT managers, marketing managers, startup founders, SMEs, enterprises and procurement teams.",
  path: "/solutions",
}),
  );
}

export default async function SolutionsPage() {
  const [solutions, industries] = await Promise.all([getSolutions(), getIndustries()]);
  const personas = solutions.filter((s) => s.kind === "persona");
  const segments = solutions.filter((s) => s.kind === "segment");

  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="The right technology for your role and organisation"
        description="Start from what you're responsible for. We'll show you the services, results and next steps that matter to you."
        crumbs={[{ href: "/solutions", label: "Solutions" }]}
      />
      <div className="container-page space-y-20 py-16">
        {solutions.length === 0 && <EmptyState title="Solutions coming soon" description="Tell us about your goals and we'll recommend a plan." />}
        {personas.length > 0 && (
          <section>
            <SectionHeading eyebrow="By role" title="Solutions for decision makers" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {personas.map((s) => (
                <SolutionCard key={s.id} solution={s} />
              ))}
            </div>
          </section>
        )}
        {segments.length > 0 && (
          <section>
            <SectionHeading eyebrow="By organisation" title="Solutions for every size of organisation" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {segments.map((s) => (
                <SolutionCard key={s.id} solution={s} />
              ))}
            </div>
          </section>
        )}
        {industries.length > 0 && (
          <section>
            <SectionHeading eyebrow="By sector" title="Industry solutions" action={{ href: "/industries", label: "All industries" }} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {industries.map((i) => (
                <IndustryCard key={i.id} industry={i} />
              ))}
            </div>
          </section>
        )}
      </div>
      <CtaBanner />
    </>
  );
}

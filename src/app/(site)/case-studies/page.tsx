import type { Metadata } from "next";
import { CaseStudyCard, CtaBanner, EmptyState, PageHero } from "@/components/site/ui";
import { getCaseStudies } from "@/lib/content";
import { pageMetadata, withSeoOverrides } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverrides(
    pageMetadata({
  title: "Case Studies",
  description: "How our clients use digital communication, software and marketing to achieve measurable results.",
  path: "/case-studies",
}),
  );
}

export default async function CaseStudiesPage() {
  const studies = await getCaseStudies();
  return (
    <>
      <PageHero
        eyebrow="Case studies"
        title="Challenges solved, results delivered"
        description="In-depth stories of how we helped clients tackle real business problems with technology."
        crumbs={[{ href: "/case-studies", label: "Case Studies" }]}
      />
      <section className="container-page py-16">
        {studies.length === 0 ? (
          <EmptyState
            title="Case studies coming soon"
            description="We're documenting recent client results. Contact us to hear about work relevant to your business."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {studies.map((study) => (
              <CaseStudyCard key={study.id} study={study} />
            ))}
          </div>
        )}
      </section>
      <CtaBanner />
    </>
  );
}

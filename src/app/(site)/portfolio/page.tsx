import type { Metadata } from "next";
import { CtaBanner, EmptyState, PageHero, ProjectCard } from "@/components/site/ui";
import { getProjects } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Portfolio",
  description: "Selected websites, apps, stores and platforms we have designed and built for our clients.",
  path: "/portfolio",
});

export default async function PortfolioPage() {
  const projects = await getProjects();
  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="Work we've delivered"
        description="A selection of websites, applications, e-commerce stores and platforms built by our team."
        crumbs={[{ href: "/portfolio", label: "Portfolio" }]}
      />
      <section className="container-page py-16">
        {projects.length === 0 ? (
          <EmptyState
            title="Our portfolio is being updated"
            description="We're preparing new project showcases. Contact us and we'll share examples relevant to your project."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
      <CtaBanner />
    </>
  );
}

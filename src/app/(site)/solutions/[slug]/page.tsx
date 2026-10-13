import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { Markdown } from "@/components/markdown";
import {
  CaseStudyCard,
  CtaBanner,
  DetailSkeleton,
  PageHero,
  ProjectCard,
  SectionHeading,
  ServiceCard,
  SolutionCard,
} from "@/components/site/ui";
import { getCaseStudies, getProjects, getServices, getSlugs, getSolution, getSolutions } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  return getSlugs("solutions");
}

export async function generateMetadata({ params }: PageProps<"/solutions/[slug]">): Promise<Metadata> {
  const solution = await getSolution((await params).slug);
  if (!solution) return { title: "Solution not found" };
  return pageMetadata({
    title: solution.seo_title || `Technology solutions for ${solution.title}`,
    description: solution.seo_description || solution.summary,
    path: `/solutions/${solution.slug}`,
  });
}

export default function SolutionPage(props: PageProps<"/solutions/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <SolutionDetail params={props.params} />
    </Suspense>
  );
}

async function SolutionDetail({ params }: Pick<PageProps<"/solutions/[slug]">, "params">) {
  const solution = await getSolution((await params).slug);
  if (!solution) notFound();

  const [services, projects, studies, solutions] = await Promise.all([
    getServices(),
    getProjects(),
    getCaseStudies(),
    getSolutions(),
  ]);
  const recommended = solution.service_slugs
    .map((slug) => services.find((s) => s.slug === slug))
    .filter((s) => s !== undefined);
  const serviceIds = new Set(recommended.map((s) => s.id));
  const relevantStudies = studies.filter((c) => c.service_id && serviceIds.has(c.service_id)).slice(0, 3);
  const relevantProjects = projects.filter((p) => p.service_id && serviceIds.has(p.service_id)).slice(0, 3 - relevantStudies.length);
  const technologies = [...new Set(recommended.flatMap((s) => s.technologies))];
  const others = solutions.filter((s) => s.id !== solution.id && s.kind === solution.kind).slice(0, 4);

  return (
    <>
      <PageHero
        eyebrow={`For ${solution.title}`}
        title={solution.headline || solution.title}
        description={solution.summary}
        crumbs={[
          { href: "/solutions", label: "Solutions" },
          { href: `/solutions/${solution.slug}`, label: solution.title },
        ]}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/quote" className="btn-primary">
            Request a quote
          </Link>
          <Link href="/contact" className="btn-ghost-light">
            Talk to a specialist
          </Link>
        </div>
      </PageHero>

      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1fr_340px]">
        <Markdown>{solution.body}</Markdown>
        {solution.needs.length > 0 && (
          <aside className="card h-fit p-6 lg:sticky lg:top-24">
            <h2 className="font-semibold">What {solution.title.toLowerCase()} need from us</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-700">
              {solution.needs.map((n) => (
                <li key={n} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-600" /> {n}
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>

      {recommended.length > 0 && (
        <section className="border-y border-slate-100 bg-slate-50/60 py-16">
          <div className="container-page">
            <SectionHeading eyebrow="Recommended" title={`Services for ${solution.title.toLowerCase()}`} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          </div>
        </section>
      )}

      {technologies.length > 0 && (
        <section className="container-page py-16">
          <SectionHeading eyebrow="Capabilities" title="Technologies and platforms we work with" />
          <ul className="flex flex-wrap gap-2">
            {technologies.map((t) => (
              <li key={t} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
                {t}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(relevantStudies.length > 0 || relevantProjects.length > 0) && (
        <section className="bg-slate-50 py-16">
          <div className="container-page">
            <SectionHeading title="Relevant work" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relevantStudies.map((s) => (
                <CaseStudyCard key={s.id} study={s} />
              ))}
              {relevantProjects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="container-page py-16">
          <SectionHeading title="Other solutions" action={{ href: "/solutions", label: "All solutions" }} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((s) => (
              <SolutionCard key={s.id} solution={s} />
            ))}
          </div>
        </section>
      )}

      <CtaBanner />
    </>
  );
}

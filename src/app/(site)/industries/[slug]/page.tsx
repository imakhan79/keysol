import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Markdown } from "@/components/markdown";
import { CaseStudyCard, CtaBanner, DetailSkeleton, PageHero, ProjectCard, SectionHeading } from "@/components/site/ui";
import { getCaseStudies, getIndustry, getProjects, getSlugs } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  return getSlugs("industries");
}

export async function generateMetadata({ params }: PageProps<"/industries/[slug]">): Promise<Metadata> {
  const industry = await getIndustry((await params).slug);
  if (!industry) return { title: "Industry not found" };
  return pageMetadata({
    title: industry.seo_title || `${industry.name} technology solutions`,
    description: industry.seo_description || industry.summary,
    path: `/industries/${industry.slug}`,
  });
}

export default function IndustryPage(props: PageProps<"/industries/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <IndustryDetail params={props.params} />
    </Suspense>
  );
}

async function IndustryDetail({ params }: Pick<PageProps<"/industries/[slug]">, "params">) {
  const industry = await getIndustry((await params).slug);
  if (!industry) notFound();

  const [projects, studies] = await Promise.all([
    getProjects({ industryId: industry.id }),
    getCaseStudies({ industryId: industry.id }),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Industry"
        title={industry.name}
        description={industry.summary}
        crumbs={[
          { href: "/industries", label: "Industries" },
          { href: `/industries/${industry.slug}`, label: industry.name },
        ]}
      >
        <div className="mt-8">
          <Link href="/quote" className="btn-primary">
            Discuss your project
          </Link>
        </div>
      </PageHero>
      <div className="container-page max-w-3xl py-16">
        <Markdown>{industry.body}</Markdown>
      </div>
      {(studies.length > 0 || projects.length > 0) && (
        <section className="bg-slate-50 py-16">
          <div className="container-page">
            <SectionHeading title={`Our work in ${industry.name.toLowerCase()}`} />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {studies.map((s) => (
                <CaseStudyCard key={s.id} study={s} />
              ))}
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaBanner />
    </>
  );
}

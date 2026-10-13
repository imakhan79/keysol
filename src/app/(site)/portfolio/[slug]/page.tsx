import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { CtaBanner, DetailSkeleton, PageHero } from "@/components/site/ui";
import { getIndustries, getProject, getServices, getSlugs } from "@/lib/content";
import { formatDate } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  return getSlugs("portfolio_projects");
}

export async function generateMetadata({ params }: PageProps<"/portfolio/[slug]">): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) return { title: "Project not found" };
  return pageMetadata({
    title: project.seo_title || project.title,
    description: project.seo_description || project.summary,
    path: `/portfolio/${project.slug}`,
    image: project.cover_image_url,
  });
}

export default function ProjectPage(props: PageProps<"/portfolio/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ProjectDetail params={props.params} />
    </Suspense>
  );
}

async function ProjectDetail({ params }: Pick<PageProps<"/portfolio/[slug]">, "params">) {
  const project = await getProject((await params).slug);
  if (!project) notFound();
  const [services, industries] = await Promise.all([getServices(), getIndustries()]);
  const service = services.find((s) => s.id === project.service_id);
  const industry = industries.find((i) => i.id === project.industry_id);

  const facts = [
    { label: "Client", value: project.client_name },
    { label: "Service", value: service?.title, href: service && `/services/${service.slug}` },
    { label: "Industry", value: industry?.name, href: industry && `/industries/${industry.slug}` },
    { label: "Completed", value: formatDate(project.completed_on) },
  ].filter((f) => f.value);

  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title={project.title}
        description={project.summary}
        crumbs={[
          { href: "/portfolio", label: "Portfolio" },
          { href: `/portfolio/${project.slug}`, label: project.title },
        ]}
      />
      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1fr_320px]">
        <div className="space-y-10">
          {project.cover_image_url && (
            // eslint-disable-next-line @next/next/no-img-element -- CMS images come from arbitrary hosts
            <img src={project.cover_image_url} alt={project.title} className="w-full rounded-2xl border border-slate-200" />
          )}
          <Markdown>{project.body}</Markdown>
        </div>
        <aside className="card h-fit space-y-5 p-6 lg:sticky lg:top-24">
          <dl className="space-y-4 text-sm">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="text-slate-500">{f.label}</dt>
                <dd className="font-medium text-slate-900">
                  {f.href ? (
                    <Link href={f.href} className="hover:text-brand-600">
                      {f.value}
                    </Link>
                  ) : (
                    f.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
          {project.technologies.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {project.technologies.map((t) => (
                <li key={t} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                  {t}
                </li>
              ))}
            </ul>
          )}
          {project.project_url && (
            <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full">
              Visit project <ExternalLink className="size-4" />
            </a>
          )}
        </aside>
      </div>
      <CtaBanner title="Want results like this?" />
    </>
  );
}

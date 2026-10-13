import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Markdown } from "@/components/markdown";
import { CtaBanner, DetailSkeleton, PageHero, TestimonialCard } from "@/components/site/ui";
import { getCaseStudy, getIndustries, getServices, getSlugs, getTestimonials } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  return getSlugs("case_studies");
}

export async function generateMetadata({ params }: PageProps<"/case-studies/[slug]">): Promise<Metadata> {
  const study = await getCaseStudy((await params).slug);
  if (!study) return { title: "Case study not found" };
  return pageMetadata({
    title: study.seo_title || study.title,
    description: study.seo_description || study.summary,
    path: `/case-studies/${study.slug}`,
    image: study.cover_image_url,
    type: "article",
  });
}

export default function CaseStudyPage(props: PageProps<"/case-studies/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <CaseStudyDetail params={props.params} />
    </Suspense>
  );
}

async function CaseStudyDetail({ params }: Pick<PageProps<"/case-studies/[slug]">, "params">) {
  const study = await getCaseStudy((await params).slug);
  if (!study) notFound();
  const [services, industries, testimonials] = await Promise.all([getServices(), getIndustries(), getTestimonials()]);
  const service = services.find((s) => s.id === study.service_id);
  const industry = industries.find((i) => i.id === study.industry_id);
  const testimonial = testimonials.find((t) => t.id === study.testimonial_id);
  const technologies = study.technologies ?? [];
  const screenshots = study.screenshots ?? [];

  const sections = [
    { title: "The challenge", body: study.challenge },
    { title: "Our solution", body: study.solution },
    { title: "Implementation", body: study.implementation ?? "" },
    { title: "The results", body: study.results },
  ].filter((s) => s.body.trim());

  return (
    <>
      <PageHero
        eyebrow={study.client_name || "Case study"}
        title={study.title}
        description={study.summary}
        crumbs={[
          { href: "/case-studies", label: "Case Studies" },
          { href: `/case-studies/${study.slug}`, label: study.title },
        ]}
      >
        {study.metrics.length > 0 && (
          <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
            {study.metrics.map((m) => (
              <div key={m.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <dd className="text-2xl font-semibold text-white">{m.value}</dd>
                <dt className="mt-1 text-sm text-slate-400">{m.label}</dt>
              </div>
            ))}
          </dl>
        )}
      </PageHero>

      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1fr_300px]">
        <div className="space-y-12">
          {study.cover_image_url && (
            // eslint-disable-next-line @next/next/no-img-element -- CMS images come from arbitrary hosts
            <img src={study.cover_image_url} alt={study.title} className="w-full rounded-2xl border border-slate-200" />
          )}
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight">{s.title}</h2>
              <Markdown>{s.body}</Markdown>
            </section>
          ))}
          {screenshots.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight">Screenshots</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {screenshots.map((src, i) => (
                  <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="block">
                    {/* eslint-disable-next-line @next/next/no-img-element -- CMS images come from arbitrary hosts */}
                    <img
                      src={src}
                      alt={`${study.title} screenshot ${i + 1}`}
                      loading="lazy"
                      className="aspect-video w-full rounded-xl border border-slate-200 object-cover transition hover:shadow-md"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}
          {testimonial && (
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight">What the client says</h2>
              <TestimonialCard testimonial={testimonial} />
            </section>
          )}
        </div>
        <aside className="card h-fit space-y-4 p-6 text-sm lg:sticky lg:top-24">
          {study.client_name && (
            <p>
              <span className="block text-slate-500">Client</span>
              <span className="font-medium">{study.client_name}</span>
            </p>
          )}
          {service && (
            <p>
              <span className="block text-slate-500">Service</span>
              <Link href={`/services/${service.slug}`} className="font-medium hover:text-brand-600">
                {service.title}
              </Link>
            </p>
          )}
          {industry && (
            <p>
              <span className="block text-slate-500">Industry</span>
              <Link href={`/industries/${industry.slug}`} className="font-medium hover:text-brand-600">
                {industry.name}
              </Link>
            </p>
          )}
          {technologies.length > 0 && (
            <div>
              <span className="block text-slate-500">Technology</span>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {technologies.map((t) => (
                  <li key={t} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Link href="/quote" className="btn-primary w-full">
            Start a similar project
          </Link>
        </aside>
      </div>
      <CtaBanner />
    </>
  );
}

import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { Icon } from "@/components/icon";
import { JsonLd } from "@/components/json-ld";
import { Markdown } from "@/components/markdown";
import { FaqList } from "@/components/site/faq-list";
import { LeadForm } from "@/components/site/lead-form";
import {
  CtaBanner,
  DetailSkeleton,
  PageHero,
  SectionHeading,
  ServiceCard,
} from "@/components/site/ui";
import {
  getFaqs,
  getService,
  getServiceCategories,
  getServices,
  getSettings,
  getSlugs,
} from "@/lib/content";
import { siteUrl } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  return getSlugs("services");
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const service = await getService((await params).slug);
  if (!service) return { title: "Service not found" };
  return pageMetadata({
    title: service.seo_title || service.title,
    description: service.seo_description || service.short_description,
    path: `/services/${service.slug}`,
  });
}

export default function ServicePage(props: PageProps<"/services/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ServiceDetail params={props.params} />
    </Suspense>
  );
}

async function ServiceDetail({ params }: Pick<PageProps<"/services/[slug]">, "params">) {
  const service = await getService((await params).slug);
  if (!service) notFound();

  const [allServices, faqs, { company }, categories] = await Promise.all([
    getServices(),
    getFaqs(),
    getSettings(),
    getServiceCategories(),
  ]);
  const categoryLabel = categories.find((c) => c.key === service.category)?.label ?? "Services";
  const parent = allServices.find((s) => s.id === service.parent_id);
  const children = allServices.filter((s) => s.parent_id === service.id);
  const familyIds = new Set([service.id, ...children.map((c) => c.id)]);
  const related = allServices
    .filter((s) => s.category === service.category && s.id !== service.id && !familyIds.has(s.parent_id ?? "") && s.id !== parent?.id)
    .slice(0, 3);
  const serviceFaqs = faqs.filter((f) => f.service_id === service.id);

  const crumbs = [
    { href: "/services", label: "Services" },
    ...(parent ? [{ href: `/services/${parent.slug}`, label: parent.title }] : []),
    { href: `/services/${service.slug}`, label: service.title },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.title,
          description: service.short_description,
          serviceType: categoryLabel,
          url: `${siteUrl}/services/${service.slug}`,
          provider: { "@type": "Organization", name: company.name, url: siteUrl },
          ...(children.length > 0 && {
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: service.title,
              itemListElement: children.map((c) => ({
                "@type": "Offer",
                itemOffered: { "@type": "Service", name: c.title, url: `${siteUrl}/services/${c.slug}` },
              })),
            },
          }),
        }}
      />
      <PageHero
        eyebrow={parent ? parent.title : categoryLabel}
        title={service.title}
        description={service.short_description}
        crumbs={crumbs}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/quote?service=${service.slug}`} className="btn-primary">
            Get a quote
          </Link>
          <a href="#enquire" className="btn-ghost-light">
            Ask a question
          </a>
        </div>
      </PageHero>

      {children.length > 0 && (
        <section className="border-b border-slate-100 bg-slate-50/60 py-14">
          <div className="container-page">
            <SectionHeading eyebrow="Options" title={`${service.title} we offer`} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {children.map((c) => (
                <ServiceCard key={c.id} service={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-12">
          <Markdown>{service.body}</Markdown>
          {service.technologies.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold tracking-tight">Technologies & platforms</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {service.technologies.map((t) => (
                  <li key={t} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
                    {t}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {serviceFaqs.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-semibold tracking-tight">Frequently asked questions</h2>
              <FaqList faqs={serviceFaqs} />
            </section>
          )}
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {service.features.length > 0 && (
            <div className="card p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon name={service.icon} className="size-5" />
                </span>
                <h2 className="font-semibold">What&apos;s included</h2>
              </div>
              <ul className="space-y-2.5 text-sm text-slate-700">
                {service.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-600" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div id="enquire" className="scroll-mt-24">
            <h2 className="mb-3 font-semibold">Quick enquiry</h2>
            <LeadForm type="enquiry" serviceSlug={service.slug} compact />
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="container-page py-16">
          <SectionHeading title="Related services" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </section>
      )}

      <CtaBanner />
    </>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { CtaBanner, PageHero, ServiceCard } from "@/components/site/ui";
import { getServiceCategories, getServices } from "@/lib/content";
import { pageMetadata, withSeoOverrides } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverrides(
    pageMetadata({
  title: "Services",
  description:
    "Digital communication, SMS, software, web and mobile development, CMS, CRM, ERP, e-commerce, digital marketing, SEO, hosting and support.",
  path: "/services",
}),
  );
}

export default async function ServicesPage() {
  const [services, categories] = await Promise.all([getServices(), getServiceCategories()]);

  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Everything you need to communicate, sell and grow online"
        description="Pick a single service or combine them. Our teams work together so your messaging, software, store and marketing all point in the same direction."
        crumbs={[{ href: "/services", label: "Services" }]}
      >
        <nav aria-label="Service categories" className="mt-8 flex flex-wrap gap-2">
          {categories.map(({ key, label }) => (
            <a
              key={key}
              href={`#${key}`}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10"
            >
              {label}
            </a>
          ))}
        </nav>
      </PageHero>

      <div className="container-page space-y-20 py-20">
        {categories.map(({ key, label, blurb }) => {
          const items = services.filter((s) => s.category === key && !s.parent_id);
          if (items.length === 0) return null;
          return (
            <section key={key} id={key} className="scroll-mt-24">
              <div className="mb-8 max-w-2xl">
                <h2 className="text-2xl font-semibold tracking-tight">{label}</h2>
                <p className="mt-2 text-slate-600">{blurb}</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((service) => {
                  const children = services.filter((c) => c.parent_id === service.id);
                  return (
                    <div key={service.id} className="flex flex-col gap-2">
                      <ServiceCard service={service} />
                      {children.length > 0 && (
                        <ul className="flex flex-wrap gap-1.5 px-1" aria-label={`${service.title} options`}>
                          {children.map((c) => (
                            <li key={c.id}>
                              <Link
                                href={`/services/${c.slug}`}
                                className="inline-block rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:border-brand-300 hover:text-brand-700"
                              >
                                {c.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <CtaBanner title="Not sure which service you need?" />
    </>
  );
}

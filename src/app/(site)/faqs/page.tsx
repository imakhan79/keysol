import Link from "next/link";
import type { Metadata } from "next";
import { FaqJsonLd, FaqList } from "@/components/site/faq-list";
import { CtaBanner, EmptyState, PageHero } from "@/components/site/ui";
import { getFaqs } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Frequently Asked Questions",
  description: "Answers about our services, pricing, quotations, project process, technology and support.",
  path: "/faqs",
});

export default async function FaqsPage() {
  const faqs = await getFaqs();
  const categories = [...new Set(faqs.map((f) => f.category))];

  return (
    <>
      <PageHero
        eyebrow="FAQs"
        title="Frequently asked questions"
        description="Quick answers about our services, quotations, delivery process and support."
        crumbs={[{ href: "/faqs", label: "FAQs" }]}
      >
        {categories.length > 1 && (
          <nav aria-label="FAQ categories" className="mt-8 flex flex-wrap gap-2">
            {categories.map((c) => (
              <a
                key={c}
                href={`#${encodeURIComponent(c)}`}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10"
              >
                {c}
              </a>
            ))}
          </nav>
        )}
      </PageHero>
      <div className="container-page max-w-4xl space-y-12 py-16">
        {faqs.length === 0 ? (
          <EmptyState title="FAQs coming soon" description="Have a question? Get in touch and we'll answer it." />
        ) : (
          <>
            {/* One FAQPage block for the whole page, not one per category */}
            <FaqJsonLd faqs={faqs} />
            {categories.map((category) => (
              <section key={category} id={encodeURIComponent(category)} className="scroll-mt-24">
                <h2 className="mb-4 text-xl font-semibold tracking-tight">{category}</h2>
                <FaqList faqs={faqs.filter((f) => f.category === category)} structuredData={false} />
              </section>
            ))}
          </>
        )}
        <p className="text-center text-slate-600">
          Still have questions?{" "}
          <Link href="/contact" className="font-semibold text-brand-600">
            Contact our team
          </Link>
        </p>
      </div>
      <CtaBanner />
    </>
  );
}

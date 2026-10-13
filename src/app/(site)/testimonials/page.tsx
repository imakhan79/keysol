import type { Metadata } from "next";
import { CtaBanner, EmptyState, PageHero, TestimonialCard } from "@/components/site/ui";
import { getIndustries, getTestimonials } from "@/lib/content";
import { pageMetadata, withSeoOverrides } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverrides(
    pageMetadata({
  title: "Testimonials",
  description: "What clients say about working with us.",
  path: "/testimonials",
}),
  );
}

export default async function TestimonialsPage() {
  const [testimonials, industries] = await Promise.all([getTestimonials(), getIndustries()]);
  const industryName = (id: string | null) => industries.find((i) => i.id === id)?.name;
  return (
    <>
      <PageHero
        eyebrow="Testimonials"
        title="Trusted by the businesses we work with"
        description="Feedback from clients across industries on our services, delivery and support."
        crumbs={[{ href: "/testimonials", label: "Testimonials" }]}
      />
      <section className="container-page py-16">
        {testimonials.length === 0 ? (
          <EmptyState
            title="Testimonials coming soon"
            description="Ask us for client references relevant to your project."
          />
        ) : (
          <div className="columns-1 gap-5 space-y-5 md:columns-2 lg:columns-3">
            {testimonials.map((t) => (
              <div key={t.id} className="break-inside-avoid">
                <TestimonialCard testimonial={t} industry={industryName(t.industry_id)} />
              </div>
            ))}
          </div>
        )}
      </section>
      <CtaBanner />
    </>
  );
}

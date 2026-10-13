import { Suspense } from "react";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { ConsultationForm } from "@/components/site/lead-form";
import { PageHero } from "@/components/site/ui";
import { getServices, getSettings } from "@/lib/content";
import { pageMetadata, withSeoOverrides } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverrides(
    pageMetadata({
      title: "Book a consultation",
      description:
        "Book a free consultation with our specialists to discuss your software, e-commerce, marketing or hosting needs.",
      path: "/book-consultation",
    }),
  );
}

export default function BookConsultationPage(props: PageProps<"/book-consultation">) {
  return (
    <>
      <PageHero
        eyebrow="Book a consultation"
        title="Talk to a specialist"
        description="Pick a day and time that suits you. A specialist will confirm the slot and come prepared for your goals."
        crumbs={[{ href: "/book-consultation", label: "Book a consultation" }]}
      />
      <div className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_320px]">
        <Suspense fallback={<div className="card h-[560px] animate-pulse bg-slate-50" />}>
          <BookingForm searchParams={props.searchParams} />
        </Suspense>
        <aside className="h-fit space-y-6">
          <Suspense fallback={null}>
            <InstantBooking />
          </Suspense>
          <div className="card p-6">
            <h2 className="font-semibold">What to expect</h2>
            <ul className="mt-4 space-y-4 text-sm text-slate-600">
              {[
                "A free 30-minute session by video, phone or in person.",
                "We confirm your time slot by email within one business day.",
                "You leave with practical recommendations and clear next steps.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}

async function BookingForm({ searchParams }: Pick<PageProps<"/book-consultation">, "searchParams">) {
  const [{ service }, services] = await Promise.all([searchParams, getServices()]);
  const options = services.filter((s) => !s.parent_id).map((s) => ({ value: s.slug, label: s.title }));
  const preselected = typeof service === "string" && options.some((o) => o.value === service) ? service : undefined;
  return <ConsultationForm services={options} preselected={preselected} />;
}

/** Optional calendar integration (Calendly / Google appointment page) set in Admin → Settings. */
async function InstantBooking() {
  const { integrations } = await getSettings();
  if (!integrations.booking_url) return null;
  return (
    <div className="card border-brand-200 bg-brand-50 p-6">
      <h2 className="font-semibold">Prefer to pick a slot now?</h2>
      <p className="mt-1 text-sm text-slate-600">See live availability and book instantly in our calendar.</p>
      <a
        href={integrations.booking_url}
        target="_blank"
        rel="noopener noreferrer"
        data-cta="Instant booking"
        className="btn-primary mt-4"
      >
        Open booking calendar
      </a>
    </div>
  );
}

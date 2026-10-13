import { Suspense } from "react";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { LeadForm } from "@/components/site/lead-form";
import { PageHero } from "@/components/site/ui";
import { getIndustries, getServices, getSettings } from "@/lib/content";
import { pageMetadata, withSeoOverrides } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverrides(
    pageMetadata({
  title: "Request a quote",
  description: "Tell us about your project and receive a tailored proposal and estimate within one business day.",
  path: "/quote",
}),
  );
}

export default function QuotePage(props: PageProps<"/quote">) {
  return (
    <>
      <PageHero
        eyebrow="Request a quote"
        title="Tell us about your project"
        description="Share a few details and we'll prepare a tailored proposal with scope, timeline and pricing."
        crumbs={[{ href: "/quote", label: "Request a quote" }]}
      />
      <div className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_320px]">
        <Suspense fallback={<div className="card h-[640px] animate-pulse bg-slate-50" />}>
          <QuoteForm searchParams={props.searchParams} />
        </Suspense>
        <aside className="card h-fit p-6">
          <h2 className="font-semibold">What happens next</h2>
          <ol className="mt-4 space-y-4 text-sm text-slate-600">
            {[
              "We review your request and may ask a few clarifying questions.",
              "A specialist schedules a short discovery call.",
              "You receive a written proposal with scope, timeline and price.",
            ].map((step) => (
              <li key={step} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-600" />
                {step}
              </li>
            ))}
          </ol>
          <p className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-500">
            Your details are only used to respond to your request.
          </p>
        </aside>
      </div>
    </>
  );
}

async function QuoteForm({ searchParams }: Pick<PageProps<"/quote">, "searchParams">) {
  const [{ service }, services, industries, { quote_options }] = await Promise.all([
    searchParams,
    getServices(),
    getIndustries(),
    getSettings(),
  ]);
  const options = services.filter((s) => !s.parent_id).map((s) => ({ value: s.slug, label: s.title }));
  return (
    <LeadForm
      type="quote"
      services={options}
      budgets={quote_options.budgets}
      timelines={quote_options.timelines}
      organizationTypes={quote_options.organization_types ?? []}
      companySizes={quote_options.company_sizes ?? []}
      industries={[...industries.map((i) => i.name), "Other"]}
      preselected={preselectedSlug(service, services)}
    />
  );
}

/** A sub-service link (e.g. ?service=sms-api) preselects its parent checkbox. */
function preselectedSlug(param: string | string[] | undefined, services: { id: string; slug: string; parent_id: string | null }[]) {
  if (typeof param !== "string") return undefined;
  const match = services.find((s) => s.slug === param);
  if (!match) return undefined;
  return match.parent_id ? services.find((s) => s.id === match.parent_id)?.slug : match.slug;
}

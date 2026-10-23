import Link from "next/link";
import { Reveal } from "@/components/motion";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Icon } from "@/components/icon";
import { CmsImage } from "@/components/cms-image";
import { JsonLd } from "@/components/json-ld";
import { formatDate, siteUrl } from "@/lib/site";
import type { BlogPost, Industry, Service, Solution } from "@/lib/types";

export function PageHero({
  eyebrow,
  title,
  description,
  crumbs,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: { href: string; label: string }[];
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="absolute -top-40 left-1/2 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="container-page relative py-16 sm:py-20">
        {crumbs && <Breadcrumbs crumbs={crumbs} />}
        {eyebrow && <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-accent uppercase">{eyebrow}</p>}
        <h1 className="max-w-3xl animate-rise text-3xl font-bold tracking-tight text-balance sm:text-5xl">{title}</h1>
        {description && (
          <p className="mt-5 max-w-2xl animate-rise text-lg leading-relaxed text-slate-300 [animation-delay:120ms]">{description}</p>
        )}
        {children}
      </div>
    </section>
  );
}

function Breadcrumbs({ crumbs }: { crumbs: { href: string; label: string }[] }) {
  const trail = [{ href: "/", label: "Home" }, ...crumbs];
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: trail.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            item: `${siteUrl}${c.href === "/" ? "" : c.href}`,
          })),
        }}
      />
      <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-400">
        <li>
          <Link href="/" className="hover:text-white">
            Home
          </Link>
        </li>
        {crumbs.map((c) => (
          <li key={c.href} className="flex items-center gap-1">
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <Link href={c.href} className="hover:text-white">
              {c.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <Reveal className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
        {description && <p className="mt-3 text-slate-600">{description}</p>}
      </div>
      {action && (
        <Link href={action.href} className="group inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
          {action.label}
          <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
        </Link>
      )}
    </Reveal>
  );
}

export function CtaBanner({
  title = "Ready to start your project?",
  description = "Tell us what you need and we will get back to you within one business day with ideas and a clear estimate.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="container-page py-16 sm:py-24">
      <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-12 text-white sm:px-12 sm:py-16">
        <div className="bg-grid absolute inset-0 opacity-60" />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
            <p className="mt-3 text-slate-300">{description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/quote" className="btn-primary">
              Request a quote
            </Link>
            <Link href="/book-consultation" className="btn-ghost-light">
              Book a consultation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="card border-dashed px-6 py-14 text-center">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{description}</p>
      <Link href="/contact" className="btn-secondary mt-6">
        Contact us
      </Link>
    </div>
  );
}

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="card group flex h-full flex-col p-6 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-600/5"
    >
      <span className="mb-5 grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 transition group-hover:bg-brand-600 group-hover:text-white">
        <Icon name={service.icon} className="size-5" />
      </span>
      <h3 className="font-semibold text-slate-900">{service.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{service.short_description}</p>
      <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
        Learn more <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export function IndustryCard({ industry }: { industry: Industry }) {
  return (
    <Link
      href={`/industries/${industry.slug}`}
      className="card group flex items-start gap-4 p-5 transition hover:border-brand-200 hover:shadow-md"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700 transition group-hover:bg-brand-50 group-hover:text-brand-600">
        <Icon name={industry.icon} className="size-5" />
      </span>
      <span>
        <span className="block font-semibold text-slate-900">{industry.name}</span>
        <span className="mt-1 block text-sm text-slate-600">{industry.summary}</span>
      </span>
    </Link>
  );
}

function Cover({ src, alt, label }: { src: string | null; alt: string; label: string }) {
  return src ? (
    <CmsImage
      src={src}
      alt={alt}
      width={800}
      height={500}
      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
      className="aspect-[16/10] w-full object-cover"
    />
  ) : (
    <div className="grid aspect-[16/10] w-full place-items-center bg-gradient-to-br from-ink to-brand-900 text-sm font-medium text-white/70">
      {label}
    </div>
  );
}

export function PostCard({ post, category }: { post: BlogPost; category?: string }) {
  return (
    <Link href={`/blog/${post.slug}`} className="card group flex flex-col overflow-hidden transition hover:shadow-lg">
      <Cover src={post.cover_image_url} alt={post.title} label={category || post.tags[0] || "Insights"} />
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs text-slate-500">
          {category && <span className="font-medium text-brand-700">{category} · </span>}
          {formatDate(post.published_at)}
          {post.author_name && <> · {post.author_name}</>}
        </p>
        <h3 className="mt-2 font-semibold text-slate-900 group-hover:text-brand-700">{post.title}</h3>
        <p className="mt-2 flex-1 text-sm text-slate-600">{post.excerpt}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
          Read article <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export function DetailSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="bg-ink">
        <div className="container-page space-y-4 py-20">
          <div className="h-4 w-40 rounded bg-white/10" />
          <div className="h-10 w-2/3 rounded bg-white/10" />
          <div className="h-5 w-1/2 rounded bg-white/10" />
        </div>
      </div>
      <div className="container-page space-y-3 py-16">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-4 rounded bg-slate-100" style={{ width: `${90 - i * 8}%` }} />
        ))}
      </div>
    </div>
  );
}

export function SolutionCard({ solution }: { solution: Solution }) {
  return (
    <Link
      href={`/solutions/${solution.slug}`}
      className="card group flex h-full flex-col p-6 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-600/5"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-ink text-accent">
          <Icon name={solution.icon} className="size-5" />
        </span>
        <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">For {solution.title}</p>
      </div>
      <h3 className="mt-4 font-semibold text-slate-900 group-hover:text-brand-700">{solution.headline}</h3>
      <ul className="mt-3 flex-1 space-y-1.5 text-sm text-slate-600">
        {solution.needs.slice(0, 4).map((n) => (
          <li key={n} className="flex gap-2">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-brand-500" />
            {n}
          </li>
        ))}
      </ul>
      <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
        See how we help <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

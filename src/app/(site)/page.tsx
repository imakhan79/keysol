import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Icon } from "@/components/icon";
import { JsonLd } from "@/components/json-ld";
import { FaqList } from "@/components/site/faq-list";
import {
  CaseStudyCard,
  CtaBanner,
  IndustryCard,
  PostCard,
  ProjectCard,
  SectionHeading,
  ServiceCard,
  SolutionCard,
  TestimonialCard,
} from "@/components/site/ui";
import {
  getCaseStudies,
  getFaqs,
  getIndustries,
  getPosts,
  getProjects,
  getServices,
  getSettings,
  getSolutions,
  getTestimonials,
} from "@/lib/content";
import { categoryOrder, serviceCategories, siteUrl } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { company } = await getSettings();
  return { alternates: { canonical: "/" }, description: company.description };
}

const steps = [
  { title: "Discover", text: "We learn your goals, audience and constraints in a focused workshop." },
  { title: "Plan", text: "You get a clear scope, timeline and fixed or phased estimate." },
  { title: "Build", text: "Agile delivery with regular demos so there are no surprises." },
  { title: "Grow", text: "Launch, measure and keep improving with ongoing support." },
];

export default async function HomePage() {
  const [settings, services, solutions, industries, projects, caseStudies, testimonials, faqs, posts] =
    await Promise.all([
      getSettings(),
      getServices(),
      getSolutions(),
      getIndustries(),
      getProjects(),
      getCaseStudies(),
      getTestimonials({ featuredOnly: true }),
      getFaqs(),
      getPosts(),
    ]);
  const { company, home, social } = settings;
  const topLevel = services.filter((s) => !s.parent_id);
  const featured = topLevel.filter((s) => s.is_featured).slice(0, 6);
  const featuredSolutions = solutions.filter((s) => s.is_featured).slice(0, 4);
  const featuredProjects = projects.filter((p) => p.is_featured).slice(0, 3);
  const featuredStudies = caseStudies.filter((c) => c.is_featured).slice(0, 3);
  const homeFaqs = faqs.filter((f) => f.show_on_home).slice(0, 6);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: company.name,
          url: siteUrl,
          description: company.description,
          email: company.email || undefined,
          telephone: company.phone || undefined,
          sameAs: Object.values(social).filter(Boolean),
        }}
      />

      {/* Hero: what we do, who for, why us */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
        <div className="absolute -top-48 left-1/2 h-[28rem] w-[60rem] -translate-x-1/2 rounded-full bg-brand-600/35 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        <div className="container-page relative grid gap-12 py-20 sm:py-24 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            {home.audience_line && (
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                <span className="size-1.5 rounded-full bg-accent" />
                {home.audience_line}
              </p>
            )}
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">{home.hero_title}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">{home.hero_subtitle}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/quote" className="btn-primary px-6 py-3 text-base">
                {home.primary_cta || "Request a quote"} <ArrowRight className="size-4" />
              </Link>
              <Link href="/services" className="btn-ghost-light px-6 py-3 text-base">
                {home.secondary_cta || "Explore services"}
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {categoryOrder.map((key) => {
              const sample = topLevel.find((s) => s.category === key);
              return (
                <Link
                  key={key}
                  href={`/services#${key}`}
                  className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur transition hover:border-white/25 hover:bg-white/[0.08]"
                >
                  <Icon name={sample?.icon ?? ""} className="size-5 text-accent" />
                  <p className="mt-3 text-sm font-semibold">{serviceCategories[key].label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{serviceCategories[key].blurb}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Company introduction */}
      {home.intro_text && (
        <section className="container-page grid gap-10 py-20 lg:grid-cols-[1fr_1.3fr] lg:items-center">
          <div>
            <p className="eyebrow mb-2">About {company.name}</p>
            <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{home.intro_title}</h2>
          </div>
          <div>
            <p className="text-lg leading-relaxed text-slate-600">{home.intro_text}</p>
            <Link href="/about" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
              More about us <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Services overview */}
      <section className="border-t border-slate-100 bg-slate-50/60">
        <div className="container-page py-20 sm:py-24">
          <SectionHeading
            eyebrow="What we do"
            title="End-to-end technology services"
            description="One partner for communication, software, commerce, marketing and infrastructure."
            action={{ href: "/services", label: `View all ${services.length} services` }}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      {featuredSolutions.length > 0 && (
        <section className="container-page py-20 sm:py-24">
          <SectionHeading
            eyebrow="Solutions"
            title="Built around the people we work with"
            description="Whether you run the business, the IT estate, the marketing or a startup, we start from what you need."
            action={{ href: "/solutions", label: "All solutions" }}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredSolutions.map((s) => (
              <SolutionCard key={s.id} solution={s} />
            ))}
          </div>
        </section>
      )}

      {/* Industries */}
      {industries.length > 0 && (
        <section className="border-y border-slate-100 bg-slate-50/60">
          <div className="container-page py-20 sm:py-24">
            <SectionHeading eyebrow="Industries" title="Solutions shaped for your sector" action={{ href: "/industries", label: "All industries" }} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {industries.slice(0, 8).map((industry) => (
                <IndustryCard key={industry.id} industry={industry} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why choose us + statistics */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="bg-grid absolute inset-0 opacity-50" />
        <div className="container-page relative grid gap-12 py-20 sm:py-24 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-accent uppercase">Why choose us</p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">A partner that makes technology simple</h2>
            <p className="mt-4 text-slate-300">
              Every engagement follows the same transparent path, so you always know what happens next and what it costs.
            </p>
            <ol className="mt-8 grid grid-cols-2 gap-3">
              {steps.map((step, i) => (
                <li key={step.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <span className="text-xs font-semibold text-accent">0{i + 1}</span>
                  <p className="mt-1 font-semibold">{step.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="space-y-8">
            {home.why_us && home.why_us.length > 0 && (
              <ul className="grid gap-4 sm:grid-cols-2">
                {home.why_us.map((item) => (
                  <li key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <CheckCircle2 className="size-5 text-accent" />
                    <p className="mt-3 font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.text}</p>
                  </li>
                ))}
              </ul>
            )}
            {home.stats.length > 0 && (
              <dl className="grid grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4">
                {home.stats.map((stat) => (
                  <div key={stat.label}>
                    <dd className="text-3xl font-semibold">{stat.value}</dd>
                    <dt className="mt-1 text-sm text-slate-400">{stat.label}</dt>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      {featuredProjects.length > 0 && (
        <section className="container-page py-20 sm:py-24">
          <SectionHeading eyebrow="Portfolio" title="Recent projects" action={{ href: "/portfolio", label: "Full portfolio" }} />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* Case studies */}
      {featuredStudies.length > 0 && (
        <section className="bg-slate-50 py-20 sm:py-24">
          <div className="container-page">
            <SectionHeading eyebrow="Case studies" title="Results we are proud of" action={{ href: "/case-studies", label: "All case studies" }} />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredStudies.map((study) => (
                <CaseStudyCard key={study.id} study={study} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="container-page py-20 sm:py-24">
          <SectionHeading eyebrow="Testimonials" title="What our clients say" action={{ href: "/testimonials", label: "All testimonials" }} />
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {homeFaqs.length > 0 && (
        <section className="container-page grid gap-10 py-20 sm:py-24 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow mb-2">FAQ</p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Questions, answered</h2>
            <p className="mt-3 text-slate-600">Can&apos;t find what you need? We&apos;re happy to help.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/faqs" className="btn-secondary">
                All FAQs
              </Link>
              <Link href="/contact" className="btn-secondary">
                Ask a question
              </Link>
            </div>
          </div>
          <FaqList faqs={homeFaqs} />
        </section>
      )}

      {/* Insights */}
      {posts.length > 0 && (
        <section className="border-t border-slate-100 bg-slate-50/60">
          <div className="container-page py-20 sm:py-24">
            <SectionHeading eyebrow="Insights" title="Latest from the blog" action={{ href: "/blog", label: "All articles" }} />
            <div className="grid gap-6 md:grid-cols-3">
              {posts.slice(0, 3).map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBanner />
    </>
  );
}

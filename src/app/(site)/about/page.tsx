import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, Eye, Target } from "lucide-react";
import { Icon } from "@/components/icon";
import { Markdown } from "@/components/markdown";
import { cmsPageMetadata } from "@/components/site/cms-page";
import { CtaBanner, IndustryCard, PageHero, SectionHeading } from "@/components/site/ui";
import { getIndustries, getPage, getServiceCategories, getServices, getSettings, getTeam } from "@/lib/content";
import type { TeamMember } from "@/lib/types";

export function generateMetadata() {
  return cmsPageMetadata("about");
}

export default async function AboutPage() {
  const [page, { about, company }, services, industries, team, categories] = await Promise.all([
    getPage("about"),
    getSettings(),
    getServices(),
    getIndustries(),
    getTeam(),
    getServiceCategories(),
  ]);
  if (!page) notFound();
  const leadership = team.filter((m) => m.is_leadership);
  const staff = team.filter((m) => !m.is_leadership);
  const topLevel = services.filter((s) => !s.parent_id);

  return (
    <>
      <PageHero
        eyebrow="About us"
        title={page.title}
        description={page.seo_description ?? company.description}
        crumbs={[{ href: "/about", label: "About Us" }]}
      />

      {/* Company introduction */}
      <section className="container-page max-w-3xl py-16">
        <Markdown>{page.body}</Markdown>
      </section>

      {/* Mission & vision */}
      {(about.mission || about.vision) && (
        <section className="container-page grid gap-6 pb-16 md:grid-cols-2">
          {about.mission && (
            <div className="card p-8">
              <Target className="size-6 text-brand-600" />
              <h2 className="mt-4 text-lg font-semibold">Our mission</h2>
              <p className="mt-2 leading-relaxed text-slate-600">{about.mission}</p>
            </div>
          )}
          {about.vision && (
            <div className="card p-8">
              <Eye className="size-6 text-brand-600" />
              <h2 className="mt-4 text-lg font-semibold">Our vision</h2>
              <p className="mt-2 leading-relaxed text-slate-600">{about.vision}</p>
            </div>
          )}
        </section>
      )}

      {/* Values */}
      {about.values.length > 0 && (
        <section className="bg-ink py-20 text-white">
          <div className="container-page">
            <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-accent uppercase">Our values</p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">What guides our work</h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {about.values.map((v) => (
                <div key={v.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                  <h3 className="font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{v.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* History */}
      {about.history.length > 0 && (
        <section className="container-page py-20">
          <SectionHeading eyebrow="Our story" title="Milestones" />
          <ol className="relative space-y-8 border-l border-slate-200 pl-8">
            {about.history.map((h) => (
              <li key={`${h.year}-${h.title}`} className="relative">
                <span className="absolute top-1.5 -left-[37px] size-3 rounded-full border-2 border-white bg-brand-600 ring-4 ring-brand-100" />
                <p className="text-sm font-semibold text-brand-600">{h.year}</p>
                <h3 className="mt-1 font-semibold">{h.title}</h3>
                {h.text && <p className="mt-1 text-slate-600">{h.text}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Leadership */}
      {leadership.length > 0 && (
        <section className="border-t border-slate-100 bg-slate-50/60 py-20">
          <div className="container-page">
            <SectionHeading eyebrow="Leadership" title="The people leading the company" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {leadership.map((m) => (
                <PersonCard key={m.id} member={m} large />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team */}
      {staff.length > 0 && (
        <section className="container-page py-20">
          <SectionHeading eyebrow="Team" title="Meet the team" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {staff.map((m) => (
              <PersonCard key={m.id} member={m} />
            ))}
          </div>
        </section>
      )}

      {/* Capabilities */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Capabilities" title="Five practices, one team" action={{ href: "/services", label: "All services" }} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(({ key, label }) => {
              const items = topLevel.filter((s) => s.category === key);
              if (items.length === 0) return null;
              return (
                <Link key={key} href={`/services#${key}`} className="card p-6 transition hover:shadow-md first:lg:col-span-2">
                  <Icon name={items[0].icon} className="size-5 text-brand-600" />
                  <h3 className="mt-3 font-semibold">{label}</h3>
                  <p className="mt-1 text-sm text-slate-600">{items.map((s) => s.title).join(" · ")}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements */}
      {about.achievements.length > 0 && (
        <section className="container-page py-20">
          <SectionHeading eyebrow="Achievements" title="By the numbers" />
          <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {about.achievements.map((a) => (
              <div key={a.label} className="card p-6">
                <dd className="text-3xl font-semibold text-brand-700">{a.value}</dd>
                <dt className="mt-1 text-sm text-slate-600">{a.label}</dt>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Certifications */}
      {about.certifications.length > 0 && (
        <section className="container-page pb-20">
          <SectionHeading eyebrow="Certifications" title="Accreditations & partnerships" />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {about.certifications.map((c) => (
              <li key={c.name} className="card flex items-start gap-4 p-5">
                <Award className="size-6 shrink-0 text-brand-600" />
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-slate-500">{[c.issuer, c.year].filter(Boolean).join(" · ")}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Industries */}
      {industries.length > 0 && (
        <section className="container-page pb-20">
          <SectionHeading eyebrow="Who we serve" title="Industries we work with" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {industries.map((i) => (
              <IndustryCard key={i.id} industry={i} />
            ))}
          </div>
        </section>
      )}

      <CtaBanner title="Let's build something together" />
    </>
  );
}

function PersonCard({ member, large = false }: { member: TeamMember; large?: boolean }) {
  return (
    <div className="card overflow-hidden">
      {member.photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- CMS images come from arbitrary hosts
        <img src={member.photo_url} alt={member.name} className={`w-full object-cover ${large ? "aspect-[4/3]" : "aspect-square"}`} />
      ) : (
        <div className={`grid w-full place-items-center bg-gradient-to-br from-ink to-brand-900 text-3xl font-semibold text-white/80 ${large ? "aspect-[4/3]" : "aspect-square"}`}>
          {member.name
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")}
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold">{member.name}</p>
            <p className="text-sm text-slate-500">{member.job_title}</p>
          </div>
          {member.linkedin_url && (
            <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on LinkedIn`} className="rounded border border-slate-200 px-1.5 text-xs font-semibold text-slate-500 hover:border-brand-300 hover:text-brand-600">
              in
            </a>
          )}
        </div>
        {large && member.bio && <p className="mt-3 text-sm leading-relaxed text-slate-600">{member.bio}</p>}
      </div>
    </div>
  );
}

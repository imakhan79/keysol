"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { saveSettings, type FormState } from "../../actions";

export function SettingsForm({ settings }: { settings: Partial<SiteSettings> }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSettings, {});
  const c = settings.company;
  const s = settings.social ?? {};
  const h = settings.home;
  const q = settings.quote_options;
  const a = settings.about;

  return (
    <form action={action} className="max-w-4xl space-y-6">
      <Section title="Company">
        <Input name="company.name" label="Company name" value={c?.name} />
        <Input name="company.tagline" label="Tagline" value={c?.tagline} />
        <Input name="company.description" label="Description" value={c?.description} area full help="Used in the footer and as the default meta description." />
        <Input name="company.email" label="Email" value={c?.email} />
        <Input name="company.phone" label="Phone" value={c?.phone} />
        <Input name="company.address" label="Address" value={c?.address} />
        <Input name="company.hours" label="Business hours" value={c?.hours} />
        <Input name="company.whatsapp" label="WhatsApp number" value={c?.whatsapp} placeholder="International format, e.g. +971500000000" help="Shows a floating WhatsApp button on the site. Leave empty to hide it." />
      </Section>

      <Section title="Social profiles">
        {(["linkedin", "facebook", "instagram", "x", "youtube"] as const).map((k) => (
          <Input key={k} name={`social.${k}`} label={k === "x" ? "X (Twitter)" : k[0].toUpperCase() + k.slice(1)} value={s[k]} placeholder="https://" />
        ))}
      </Section>

      <Section title="Homepage">
        <Input name="home.audience_line" label="Audience line (above the hero title)" value={h?.audience_line} full help="Who you serve, e.g. For startups, SMEs, enterprises and public-sector organisations." />
        <Input name="home.hero_title" label="Hero title" value={h?.hero_title} full help="What the company does." />
        <Input name="home.hero_subtitle" label="Hero subtitle" value={h?.hero_subtitle} area full help="Your value proposition." />
        <Input name="home.primary_cta" label="Primary button" value={h?.primary_cta} />
        <Input name="home.secondary_cta" label="Secondary button" value={h?.secondary_cta} />
        <Input
          name="home.stats"
          label="Stats bar"
          value={h?.stats?.map((st) => `${st.value} | ${st.label}`).join("\n")}
          area
          full
          mono
          help="One per line as  Value | Label  — e.g.  24/7 | Support coverage. Only use figures you can stand behind."
        />
        <Input name="home.intro_title" label="Company introduction title" value={h?.intro_title} full />
        <Input name="home.intro_text" label="Company introduction" value={h?.intro_text} area full />
        <Input
          name="home.why_us"
          label="Why choose us"
          value={h?.why_us?.map((w) => `${w.title} | ${w.text}`).join("\n")}
          area
          full
          mono
          help="One per line as  Title | Description"
        />
      </Section>

      <Section title="About page">
        <Input name="about.mission" label="Mission" value={a?.mission} area />
        <Input name="about.vision" label="Vision" value={a?.vision} area />
        <Input
          name="about.values"
          label="Values"
          value={a?.values?.map((v) => `${v.title} | ${v.text}`).join("\n")}
          area
          full
          mono
          help="One per line as  Title | Description"
        />
        <Input
          name="about.history"
          label="History / milestones"
          value={a?.history?.map((m) => [m.year, m.title, m.text].join(" | ")).join("\n")}
          area
          full
          mono
          help="One per line as  Year | Milestone | Optional detail. The section is hidden until you add one."
        />
        <Input
          name="about.achievements"
          label="Achievements"
          value={a?.achievements?.map((m) => `${m.value} | ${m.label}`).join("\n")}
          area
          mono
          help="Value | Label, e.g. 120+ | Projects delivered. Only verifiable figures. Hidden when empty."
        />
        <Input
          name="about.certifications"
          label="Certifications & partnerships"
          value={a?.certifications?.map((m) => [m.name, m.issuer, m.year].join(" | ")).join("\n")}
          area
          mono
          help="Name | Issuer | Year. Hidden when empty."
        />
      </Section>

      <Section title="Quote form options">
        <Input name="quote.budgets" label="Budget ranges" value={q?.budgets?.join("\n")} area help="One per line." />
        <Input name="quote.timelines" label="Timelines" value={q?.timelines?.join("\n")} area help="One per line." />
        <Input name="quote.organization_types" label="Organisation types" value={q?.organization_types?.join("\n")} area help="One per line. Used to segment leads." />
        <Input name="quote.company_sizes" label="Company sizes" value={q?.company_sizes?.join("\n")} area help="One per line." />
      </Section>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <span role="status" className={`text-sm ${state.error ? "text-red-600" : "text-emerald-700"}`}>
          {state.error ?? (state.ok && !pending ? "Settings saved." : "")}
        </span>
        <button type="submit" disabled={pending} className="btn-primary">
          {pending && <Loader2 className="size-4 animate-spin" />} Save settings
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <h2 className="mb-5 font-semibold">{title}</h2>
      <div className="grid gap-5 lg:grid-cols-2">{children}</div>
    </section>
  );
}

function Input({
  name,
  label,
  value,
  area,
  full,
  mono,
  help,
  placeholder,
}: {
  name: string;
  label: string;
  value?: string;
  area?: boolean;
  full?: boolean;
  mono?: boolean;
  help?: string;
  placeholder?: string;
}) {
  const id = `s-${name}`;
  return (
    <div className={full ? "lg:col-span-2" : ""}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {area ? (
        <textarea id={id} name={name} rows={4} defaultValue={value ?? ""} className={`field ${mono ? "font-mono" : ""}`} />
      ) : (
        <input id={id} name={name} defaultValue={value ?? ""} placeholder={placeholder} className="field" />
      )}
      {help && <p className="mt-1.5 text-xs text-slate-500">{help}</p>}
    </div>
  );
}

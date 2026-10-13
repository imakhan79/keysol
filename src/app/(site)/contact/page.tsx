import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { CallbackForm, LeadForm } from "@/components/site/lead-form";
import { PageHero } from "@/components/site/ui";
import { getSettings } from "@/lib/content";
import { pageMetadata, withSeoOverrides } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverrides(
    pageMetadata({
  title: "Contact us",
  description: "Get in touch about digital communication, software, e-commerce, marketing or hosting. We reply within one business day.",
  path: "/contact",
}),
  );
}

export default async function ContactPage() {
  const { company, integrations } = await getSettings();
  const mapQuery = integrations.map_query || company.address;
  const details = [
    company.email && { icon: Mail, label: "Email", value: company.email, href: `mailto:${company.email}` },
    company.phone && {
      icon: Phone,
      label: "Phone",
      value: company.phone,
      href: `tel:${company.phone.replace(/[^\d+]/g, "")}`,
    },
    company.whatsapp?.replace(/\D/g, "") && {
      icon: MessageCircle,
      label: "WhatsApp",
      value: company.whatsapp,
      href: `https://wa.me/${company.whatsapp.replace(/\D/g, "")}`,
    },
    company.address && { icon: MapPin, label: "Office", value: company.address },
    company.hours && { icon: Clock, label: "Hours", value: company.hours },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href?: string }[];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk about your goals"
        description="Questions, ideas or a project in mind? Send us a message and the right specialist will get back to you."
        crumbs={[{ href: "/contact", label: "Contact" }]}
      />
      <div className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <LeadForm type="contact" />
          {integrations.show_map && mapQuery && (
            <iframe
              title={`Map showing ${company.name}`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-80 w-full rounded-2xl border border-slate-200"
            />
          )}
        </div>
        <aside className="space-y-6">
          <div className="card divide-y divide-slate-100">
            {details.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex gap-4 p-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon className="size-5" />
                </span>
                <div className="text-sm">
                  <p className="text-slate-500">{label}</p>
                  {href ? (
                    <a href={href} className="font-medium text-slate-900 hover:text-brand-600">
                      {value}
                    </a>
                  ) : (
                    <p className="font-medium text-slate-900">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div id="callback" className="card scroll-mt-24 p-6">
            <h2 className="font-semibold">Prefer a call?</h2>
            <p className="mt-1 mb-4 text-sm text-slate-600">Leave your number and we&apos;ll call you back during business hours.</p>
            <CallbackForm />
          </div>
          <div className="card p-6">
            <h2 className="flex items-center gap-2 font-semibold">
              <CalendarCheck className="size-5 text-brand-600" /> Book a consultation
            </h2>
            <p className="mt-1 text-sm text-slate-600">Choose a day and time for a free session with a specialist.</p>
            <Link href="/book-consultation" className="btn-secondary mt-4">
              Pick a time
            </Link>
          </div>
          <div className="card bg-ink p-6 text-white">
            <h2 className="font-semibold">Need a detailed estimate?</h2>
            <p className="mt-2 text-sm text-slate-300">
              Use our quote form to share services, budget and timeline so we can prepare a tailored proposal.
            </p>
            <Link href="/quote" className="btn mt-4 bg-white text-ink hover:bg-slate-100">
              Request a quote
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}

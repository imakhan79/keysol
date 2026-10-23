import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { getServices, getSettings, getSolutions } from "@/lib/content";
import { Logo } from "./header";
import { NewsletterForm } from "./lead-form";

const socialLabels = { linkedin: "LinkedIn", facebook: "Facebook", instagram: "Instagram", x: "X", youtube: "YouTube" };

export async function SiteFooter() {
  const [{ company, social }, services, solutions] = await Promise.all([getSettings(), getServices(), getSolutions()]);
  const socials = Object.entries(social).filter(([, url]) => url) as [keyof typeof socialLabels, string][];
  const topLevel = services.filter((s) => !s.parent_id);

  return (
    <footer className="bg-ink text-slate-300">
      <div className="container-page border-b border-white/10 py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Get practical insights in your inbox</h2>
            <p className="mt-1 text-sm text-slate-400">Occasional articles on messaging, software, e-commerce and marketing. Unsubscribe anytime.</p>
          </div>
          <div className="w-full max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-1">
          <Logo name={company.name} light />
          <p className="text-sm leading-relaxed text-slate-400">{company.description}</p>
          {socials.length > 0 && (
            <ul className="flex flex-wrap gap-3 text-sm">
              {socials.map(([key, url]) => (
                <li key={key}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    {socialLabels[key] ?? key}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <FooterColumn title="Services">
          {topLevel.slice(0, 8).map((s) => (
            <FooterLink key={s.id} href={`/services/${s.slug}`}>
              {s.title}
            </FooterLink>
          ))}
          <FooterLink href="/services">All services →</FooterLink>
        </FooterColumn>

        <FooterColumn title="Solutions">
          {solutions.map((s) => (
            <FooterLink key={s.id} href={`/solutions/${s.slug}`}>
              For {s.title}
            </FooterLink>
          ))}
          <FooterLink href="/industries">Industries</FooterLink>
        </FooterColumn>

        <FooterColumn title="Company">
          <FooterLink href="/about">About Us</FooterLink>
          <FooterLink href="/blog">Blog</FooterLink>
          <FooterLink href="/faqs">FAQs</FooterLink>
        </FooterColumn>

        <FooterColumn title="Get in touch">
          {company.email && (
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-slate-500" />
              <a href={`mailto:${company.email}`} className="break-all hover:text-white">
                {company.email}
              </a>
            </li>
          )}
          {company.phone && (
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-slate-500" />
              <a href={`tel:${company.phone.replace(/[^\d+]/g, "")}`} className="hover:text-white">
                {company.phone}
              </a>
            </li>
          )}
          {company.address && (
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-slate-500" />
              <span>{company.address}</span>
            </li>
          )}
          <li className="flex flex-col gap-2 pt-2">
            <Link href="/quote" className="btn-primary">
              Request a quote
            </Link>
            <Link href="/book-consultation" className="btn-ghost-light">
              Book a consultation
            </Link>
            <Link href="/contact#callback" className="btn-ghost-light">
              Request a callback
            </Link>
          </li>
        </FooterColumn>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CopyrightYear /> {company.name}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-300">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-300">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

async function CopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold text-white">{title}</h2>
      <ul className="space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="hover:text-white">
        {children}
      </Link>
    </li>
  );
}

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { BrandLogo } from "@/components/brand";
import { Icon } from "@/components/icon";
import { getServiceCategories, getServices, getSettings, getSolutions } from "@/lib/content";
import { companyNav, workNav, type NavLink } from "@/lib/site";
import { MobileNav, type NavGroup } from "./mobile-nav";

export async function SiteHeader() {
  const [{ company }, services, solutions, categories] = await Promise.all([
    getSettings(),
    getServices(),
    getSolutions(),
    getServiceCategories(),
  ]);
  const topLevel = services.filter((s) => !s.parent_id);
  const serviceColumns = categories
    .map(({ key, label }) => ({ key, label, items: topLevel.filter((s) => s.category === key) }))
    .filter((c) => c.items.length > 0);
  const solutionLinks: NavLink[] = solutions.map((s) => ({ href: `/solutions/${s.slug}`, label: `For ${s.title}` }));

  const mobileGroups: NavGroup[] = [
    { label: "Services", items: [{ href: "/services", label: "All services" }, ...topLevel.map((s) => ({ href: `/services/${s.slug}`, label: s.title }))] },
    { label: "Solutions", items: [{ href: "/solutions", label: "All solutions" }, ...solutionLinks] },
    { label: "Industries", href: "/industries" },
    { label: "Our work", items: workNav },
    { label: "Company", items: companyNav },
    { label: "Contact Us", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Logo name={company.name} />
        <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
          <Dropdown label="Services" href="/services" wide>
            <div className="grid grid-cols-3 gap-x-8 gap-y-6">
              {serviceColumns.map((col) => (
                <div key={col.key} className={col.items.length > 7 ? "col-span-2" : undefined}>
                  <Link href={`/services#${col.key}`} className="text-xs font-semibold tracking-wider text-slate-400 uppercase hover:text-brand-600">
                    {col.label}
                  </Link>
                  <ul className={col.items.length > 7 ? "mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5" : "mt-2 space-y-0.5"}>
                    {col.items.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={`/services/${s.slug}`}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-700"
                        >
                          <Icon name={s.icon} className="size-4 text-brand-500" />
                          {s.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
              <Link href="/services" className="font-semibold text-brand-600">
                View all services →
              </Link>
              <Link href="/quote" className="text-slate-600 hover:text-brand-600">
                Not sure? Request a quote
              </Link>
            </div>
          </Dropdown>
          <Dropdown label="Solutions" href="/solutions">
            <MenuList items={[...solutionLinks, { href: "/solutions", label: "All solutions →" }]} />
          </Dropdown>
          <TopLink href="/industries">Industries</TopLink>
          <Dropdown label="Our Work" href="/portfolio">
            <MenuList items={workNav} />
          </Dropdown>
          <Dropdown label="Company" href="/about">
            <MenuList items={companyNav} />
          </Dropdown>
          <TopLink href="/contact">Contact</TopLink>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/quote" className="btn-primary hidden sm:inline-flex">
            Request a quote
          </Link>
          <MobileNav groups={mobileGroups} />
        </div>
      </div>
    </header>
  );
}

function TopLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
      {children}
    </Link>
  );
}

// CSS-only dropdown: opens on hover and on keyboard focus (focus-within), no JS needed.
function Dropdown({
  label,
  href,
  wide = false,
  children,
}: {
  label: string;
  href: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative">
      <Link
        href={href}
        aria-haspopup="true"
        className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition group-focus-within:text-slate-900 group-hover:bg-slate-100 group-hover:text-slate-900"
      >
        {label}
        <ChevronDown className="size-3.5 transition group-hover:rotate-180" aria-hidden="true" />
      </Link>
      <div
        className={`invisible absolute top-full pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 ${
          wide ? "left-1/2 w-[46rem] -translate-x-1/3" : "left-0 w-72"
        }`}
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/10">{children}</div>
      </div>
    </div>
  );
}

function MenuList({ items }: { items: NavLink[] }) {
  return (
    <ul className="space-y-0.5">
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className="block rounded-lg px-3 py-2 hover:bg-slate-50">
            <span className="block text-sm font-medium text-slate-800">{item.label}</span>
            {item.description && <span className="block text-xs text-slate-500">{item.description}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Logo({ name, light = false }: { name: string; light?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center" aria-label={`${name} home`}>
      <BrandLogo name={name} light={light} className="text-[1.15rem] sm:text-xl" />
    </Link>
  );
}

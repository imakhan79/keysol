import type { ServiceCategory } from "./types";

// Explicit setting first, then Vercel's production domain (set automatically on Vercel), then local dev.
const vercelProductionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (vercelProductionHost ? `https://${vercelProductionHost}` : "http://localhost:3000")
).replace(/\/$/, "");

export const serviceCategories: Record<ServiceCategory, { label: string; blurb: string }> = {
  development: {
    label: "Software Solutions",
    blurb: "Custom software, web, mobile and enterprise apps, APIs, CRM, ERP, HRMS, CMS, inventory and automation.",
  },
  communication: {
    label: "Digital Communication",
    blurb: "SMS, messaging and omnichannel customer communication.",
  },
  ecommerce: {
    label: "E-commerce",
    blurb: "Online stores, payments and marketplace integrations.",
  },
  marketing: {
    label: "Digital Marketing",
    blurb: "SEO, social, content and paid campaigns that generate leads.",
  },
  infrastructure: {
    label: "Hosting & Support",
    blurb: "Hosting, domains, SSL, backups, monitoring and support.",
  },
};

export const categoryOrder = Object.keys(serviceCategories) as ServiceCategory[];

export type NavLink = { href: string; label: string; description?: string };

/** Static dropdowns. Services and Solutions menus are built from the CMS. */
export const workNav: NavLink[] = [
  { href: "/portfolio", label: "Portfolio", description: "Projects we've delivered" },
  { href: "/case-studies", label: "Case Studies", description: "Challenges, solutions and results" },
  { href: "/testimonials", label: "Testimonials", description: "What clients say" },
];

export const companyNav: NavLink[] = [
  { href: "/about", label: "About Us", description: "Mission, team and capabilities" },
  { href: "/faqs", label: "FAQs", description: "Answers to common questions" },
  { href: "/support", label: "Support", description: "Support channels and service levels" },
  { href: "/blog", label: "Blog", description: "Insights and guides" },
];

export function formatDate(value: string | null | undefined) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}

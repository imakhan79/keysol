import type { ServiceCategoryRow } from "./types";

// Explicit setting first, then Vercel's production domain (set automatically on Vercel), then local dev.
const vercelProductionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (vercelProductionHost ? `https://${vercelProductionHost}` : "http://localhost:3000")
).replace(/\/$/, "");

/** Fallback when the service_categories table is unavailable; the database is the source of truth. */
export const defaultServiceCategories: ServiceCategoryRow[] = [
  {
    key: "development",
    label: "Software Solutions",
    blurb: "Custom software, web, mobile and enterprise apps, APIs, CRM, ERP, HRMS, CMS, inventory and automation.",
    sort_order: 10,
  },
  { key: "communication", label: "Digital Communication", blurb: "SMS, messaging and omnichannel customer communication.", sort_order: 20 },
  { key: "ecommerce", label: "E-commerce", blurb: "Online stores, payments and marketplace integrations.", sort_order: 30 },
  { key: "marketing", label: "Digital Marketing", blurb: "SEO, social, content and paid campaigns that generate leads.", sort_order: 40 },
  { key: "infrastructure", label: "Hosting & Support", blurb: "Hosting, domains, SSL, backups, monitoring and support.", sort_order: 50 },
];

export type NavLink = { href: string; label: string; description?: string };

/** Static dropdowns. Services and Solutions menus are built from the CMS. */
export const companyNav: NavLink[] = [
  { href: "/about", label: "About Us", description: "Mission, team and capabilities" },
  { href: "/faqs", label: "FAQs", description: "Answers to common questions" },
  { href: "/blog", label: "Blog", description: "Insights and guides" },
];

export function formatDate(value: string | null | undefined) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}

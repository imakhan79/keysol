import type { MetadataRoute } from "next";
import { getCaseStudies, getIndustries, getPosts, getProjects, getServices, getSolutions } from "@/lib/content";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, industries, projects, studies, posts, solutions] = await Promise.all([
    getServices(),
    getIndustries(),
    getProjects(),
    getCaseStudies(),
    getPosts(),
    getSolutions(),
  ]);

  const staticPages = [
    "",
    "/services",
    "/solutions",
    "/industries",
    "/portfolio",
    "/case-studies",
    "/testimonials",
    "/blog",
    "/about",
    "/faqs",
    "/support",
    "/contact",
    "/quote",
    "/book-consultation",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : path === "/services" || path === "/quote" ? 0.9 : 0.6,
  }));

  const entries = (prefix: string, rows: { slug: string; updated_at: string }[], priority: number) =>
    rows.map((row) => ({
      url: `${siteUrl}${prefix}/${row.slug}`,
      lastModified: row.updated_at,
      changeFrequency: "monthly" as const,
      priority,
    }));

  return [
    ...staticPages,
    ...entries("/services", services, 0.8),
    ...entries("/solutions", solutions, 0.7),
    ...entries("/industries", industries, 0.7),
    ...entries("/portfolio", projects, 0.6),
    ...entries("/case-studies", studies, 0.7),
    ...entries("/blog", posts, 0.6),
  ];
}

import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "./supabase/public";
import type {
  BlogPost,
  CaseStudy,
  Faq,
  Industry,
  Page,
  PortfolioProject,
  Service,
  SiteSettings,
  Solution,
  TeamMember,
  Testimonial,
} from "./types";

// Public, cached reads. Every getter is tagged with its table name; admin saves call
// updateTag(table) so edits appear on the site immediately.

export const contentTags = [
  "services",
  "industries",
  "portfolio_projects",
  "case_studies",
  "testimonials",
  "blog_posts",
  "pages",
  "solutions",
  "faqs",
  "team_members",
  "site_settings",
] as const;
export type ContentTag = (typeof contentTags)[number];

function tag(...tags: ContentTag[]) {
  cacheTag(...tags);
  cacheLife("hours");
}

function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return data as T;
}

const defaultSettings: SiteSettings = {
  company: {
    name: "Digitora Next",
    tagline: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    hours: "",
  },
  social: {},
  home: { hero_title: "", hero_subtitle: "", primary_cta: "Request a quote", secondary_cta: "Explore services", stats: [] },
  quote_options: { budgets: [], timelines: [], organization_types: [], company_sizes: [] },
  about: { mission: "", vision: "", values: [], history: [], achievements: [], certifications: [] },
};

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  tag("site_settings");
  const rows = unwrap(await createPublicClient().from("site_settings").select("key, value"));
  const settings = structuredClone(defaultSettings) as Record<string, unknown>;
  for (const row of rows) {
    const base = settings[row.key];
    settings[row.key] = base && typeof base === "object" ? { ...base, ...row.value } : row.value;
  }
  return settings as SiteSettings;
}

// "business" was merged into "development" (Software Solutions); map rows not yet migrated.
function normalizeService(service: Service): Service {
  return (service.category as string) === "business" ? { ...service, category: "development" } : service;
}

export async function getServices(): Promise<Service[]> {
  "use cache";
  tag("services");
  return unwrap(
    await createPublicClient().from("services").select("*").eq("is_published", true).order("sort_order"),
  ).map(normalizeService);
}

export async function getService(slug: string): Promise<Service | null> {
  "use cache";
  tag("services");
  const service = unwrap(
    await createPublicClient().from("services").select("*").eq("is_published", true).eq("slug", slug).maybeSingle(),
  );
  return service && normalizeService(service);
}

export async function getIndustries(): Promise<Industry[]> {
  "use cache";
  tag("industries");
  return unwrap(
    await createPublicClient().from("industries").select("*").eq("is_published", true).order("sort_order"),
  );
}

export async function getIndustry(slug: string): Promise<Industry | null> {
  "use cache";
  tag("industries");
  return unwrap(
    await createPublicClient().from("industries").select("*").eq("is_published", true).eq("slug", slug).maybeSingle(),
  );
}

export async function getProjects(filter: { serviceId?: string; industryId?: string } = {}): Promise<PortfolioProject[]> {
  "use cache";
  tag("portfolio_projects");
  let query = createPublicClient().from("portfolio_projects").select("*").eq("is_published", true);
  if (filter.serviceId) query = query.eq("service_id", filter.serviceId);
  if (filter.industryId) query = query.eq("industry_id", filter.industryId);
  return unwrap(await query.order("sort_order"));
}

export async function getProject(slug: string): Promise<PortfolioProject | null> {
  "use cache";
  tag("portfolio_projects");
  return unwrap(
    await createPublicClient()
      .from("portfolio_projects")
      .select("*")
      .eq("is_published", true)
      .eq("slug", slug)
      .maybeSingle(),
  );
}

export async function getCaseStudies(filter: { serviceId?: string; industryId?: string } = {}): Promise<CaseStudy[]> {
  "use cache";
  tag("case_studies");
  let query = createPublicClient().from("case_studies").select("*").eq("is_published", true);
  if (filter.serviceId) query = query.eq("service_id", filter.serviceId);
  if (filter.industryId) query = query.eq("industry_id", filter.industryId);
  return unwrap(await query.order("published_at", { ascending: false, nullsFirst: false }));
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  "use cache";
  tag("case_studies");
  return unwrap(
    await createPublicClient().from("case_studies").select("*").eq("is_published", true).eq("slug", slug).maybeSingle(),
  );
}

export async function getTestimonials(options: { featuredOnly?: boolean } = {}): Promise<Testimonial[]> {
  "use cache";
  tag("testimonials");
  let query = createPublicClient().from("testimonials").select("*").eq("is_published", true);
  if (options.featuredOnly) query = query.eq("is_featured", true);
  return unwrap(await query.order("sort_order"));
}

export async function getPosts(): Promise<BlogPost[]> {
  "use cache";
  tag("blog_posts");
  return unwrap(
    await createPublicClient()
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false, nullsFirst: false }),
  );
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  "use cache";
  tag("blog_posts");
  return unwrap(
    await createPublicClient().from("blog_posts").select("*").eq("is_published", true).eq("slug", slug).maybeSingle(),
  );
}

export async function getPage(slug: string): Promise<Page | null> {
  "use cache";
  tag("pages");
  return unwrap(
    await createPublicClient().from("pages").select("*").eq("is_published", true).eq("slug", slug).maybeSingle(),
  );
}

export async function getSolutions(): Promise<Solution[]> {
  "use cache";
  tag("solutions");
  return unwrap(
    await createPublicClient().from("solutions").select("*").eq("is_published", true).order("sort_order"),
  );
}

export async function getSolution(slug: string): Promise<Solution | null> {
  "use cache";
  tag("solutions");
  return unwrap(
    await createPublicClient().from("solutions").select("*").eq("is_published", true).eq("slug", slug).maybeSingle(),
  );
}

export async function getFaqs(): Promise<Faq[]> {
  "use cache";
  tag("faqs");
  return unwrap(await createPublicClient().from("faqs").select("*").eq("is_published", true).order("sort_order"));
}

export async function getTeam(): Promise<TeamMember[]> {
  "use cache";
  tag("team_members");
  return unwrap(
    await createPublicClient().from("team_members").select("*").eq("is_published", true).order("sort_order"),
  );
}

/** Slugs for generateStaticParams. Cache Components requires at least one entry. */
export async function getSlugs(
  table: "services" | "industries" | "portfolio_projects" | "case_studies" | "blog_posts" | "solutions",
): Promise<{ slug: string }[]> {
  "use cache";
  tag(table);
  const rows: { slug: string }[] = unwrap(
    await createPublicClient().from(table).select("slug").eq("is_published", true),
  );
  return rows.length > 0 ? rows : [{ slug: "__placeholder__" }];
}

import { serviceCategories } from "./site";
import type { ContentTag } from "./content";
import type { Permission } from "./roles";

// Declarative definitions that drive the generic admin list + edit screens.

export type FieldKind =
  | "text"
  | "textarea"
  | "markdown"
  | "slug"
  | "url"
  | "image"
  | "select"
  | "boolean"
  | "number"
  | "tags"
  | "date"
  | "datetime"
  | "metrics"
  | "ref"
  /** Several image URLs, stored as an array. */
  | "images"
  /** Multiple services, stored as an ordered array of slugs. */
  | "serviceSlugs";

export type FieldDef = {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  help?: string;
  options?: { value: string; label: string }[];
  ref?: "services" | "industries" | "testimonials";
  /** Layout hint: half-width on large screens. */
  half?: boolean;
};

export type ContentType = {
  key: string;
  table: Exclude<ContentTag, "site_settings">;
  label: string;
  singular: string;
  titleField: string;
  permission: Extract<Permission, "marketingContent" | "siteContent">;
  orderBy: { column: string; ascending: boolean };
  columns: { name: string; label: string }[];
  fields: FieldDef[];
  publicPath?: (row: Record<string, unknown>) => string;
};

const seoFields: FieldDef[] = [
  { name: "seo_title", label: "SEO title", kind: "text", help: "Defaults to the title. Aim for under 60 characters." },
  {
    name: "seo_description",
    label: "SEO description",
    kind: "textarea",
    help: "Shown in search results. Aim for 120–160 characters.",
  },
];

const slugField: FieldDef = {
  name: "slug",
  label: "URL slug",
  kind: "slug",
  help: "Lowercase words separated by hyphens. Leave empty to generate from the title.",
  half: true,
};

export const contentTypes: Record<string, ContentType> = {
  services: {
    key: "services",
    table: "services",
    label: "Services",
    singular: "Service",
    titleField: "title",
    permission: "marketingContent",
    orderBy: { column: "sort_order", ascending: true },
    columns: [
      { name: "category", label: "Category" },
      { name: "sort_order", label: "Order" },
    ],
    publicPath: (r) => `/services/${r.slug}`,
    fields: [
      { name: "title", label: "Title", kind: "text", required: true, half: true },
      slugField,
      {
        name: "category",
        label: "Category",
        kind: "select",
        required: true,
        half: true,
        options: Object.entries(serviceCategories).map(([value, c]) => ({ value, label: c.label })),
      },
      { name: "icon", label: "Icon", kind: "text", half: true, help: "e.g. message, code, globe, cart, server" },
      {
        name: "parent_id",
        label: "Parent service",
        kind: "ref",
        ref: "services",
        help: "Optional. Sub-services are listed on the parent service page.",
      },
      { name: "short_description", label: "Short description", kind: "textarea", help: "Shown on cards and in search results." },
      { name: "features", label: "Key features", kind: "tags", help: "One per line." },
      {
        name: "technologies",
        label: "Technologies & platforms",
        kind: "tags",
        help: "One per line. Shown to technical buyers on the service page.",
      },
      { name: "body", label: "Page content", kind: "markdown" },
      { name: "sort_order", label: "Sort order", kind: "number", half: true },
      { name: "is_featured", label: "Feature on homepage", kind: "boolean", half: true },
      { name: "is_published", label: "Published", kind: "boolean" },
      ...seoFields,
    ],
  },
  industries: {
    key: "industries",
    table: "industries",
    label: "Industries",
    singular: "Industry",
    titleField: "name",
    permission: "marketingContent",
    orderBy: { column: "sort_order", ascending: true },
    columns: [{ name: "sort_order", label: "Order" }],
    publicPath: (r) => `/industries/${r.slug}`,
    fields: [
      { name: "name", label: "Name", kind: "text", required: true, half: true },
      slugField,
      { name: "icon", label: "Icon", kind: "text", half: true, help: "e.g. cart, heart, book, bank, truck" },
      { name: "sort_order", label: "Sort order", kind: "number", half: true },
      { name: "summary", label: "Summary", kind: "textarea" },
      { name: "body", label: "Page content", kind: "markdown" },
      { name: "is_published", label: "Published", kind: "boolean" },
      ...seoFields,
    ],
  },
  portfolio: {
    key: "portfolio",
    table: "portfolio_projects",
    label: "Portfolio",
    singular: "Project",
    titleField: "title",
    permission: "marketingContent",
    orderBy: { column: "sort_order", ascending: true },
    columns: [
      { name: "client_name", label: "Client" },
      { name: "sort_order", label: "Order" },
    ],
    publicPath: (r) => `/portfolio/${r.slug}`,
    fields: [
      { name: "title", label: "Title", kind: "text", required: true, half: true },
      slugField,
      { name: "client_name", label: "Client", kind: "text", half: true },
      { name: "completed_on", label: "Completed on", kind: "date", half: true },
      { name: "service_id", label: "Service", kind: "ref", ref: "services", half: true },
      { name: "industry_id", label: "Industry", kind: "ref", ref: "industries", half: true },
      { name: "summary", label: "Summary", kind: "textarea" },
      { name: "cover_image_url", label: "Cover image", kind: "image" },
      { name: "project_url", label: "Live project URL", kind: "url" },
      { name: "technologies", label: "Technologies", kind: "tags", help: "One per line." },
      { name: "body", label: "Project write-up", kind: "markdown" },
      { name: "sort_order", label: "Sort order", kind: "number", half: true },
      { name: "is_featured", label: "Feature on homepage", kind: "boolean", half: true },
      { name: "is_published", label: "Published", kind: "boolean" },
      ...seoFields,
    ],
  },
  "case-studies": {
    key: "case-studies",
    table: "case_studies",
    label: "Case studies",
    singular: "Case study",
    titleField: "title",
    permission: "marketingContent",
    orderBy: { column: "published_at", ascending: false },
    columns: [
      { name: "client_name", label: "Client" },
      { name: "published_at", label: "Date" },
    ],
    publicPath: (r) => `/case-studies/${r.slug}`,
    fields: [
      { name: "title", label: "Title", kind: "text", required: true, half: true },
      slugField,
      { name: "client_name", label: "Client", kind: "text", half: true },
      { name: "published_at", label: "Publish date", kind: "datetime", half: true },
      { name: "service_id", label: "Service", kind: "ref", ref: "services", half: true },
      { name: "industry_id", label: "Industry", kind: "ref", ref: "industries", half: true },
      { name: "summary", label: "Summary", kind: "textarea" },
      { name: "cover_image_url", label: "Cover image", kind: "image" },
      {
        name: "metrics",
        label: "Key metrics",
        kind: "metrics",
        help: "One per line as  Label | Value  — e.g.  Online revenue | +180%",
      },
      { name: "technologies", label: "Technologies", kind: "tags", help: "One per line." },
      { name: "challenge", label: "The challenge", kind: "markdown" },
      { name: "solution", label: "Our solution", kind: "markdown" },
      { name: "implementation", label: "Implementation", kind: "markdown", help: "How the project was delivered: phases, timeline, team." },
      { name: "results", label: "The results", kind: "markdown" },
      { name: "screenshots", label: "Screenshots", kind: "images", help: "One image URL per line, or upload." },
      {
        name: "testimonial_id",
        label: "Client testimonial",
        kind: "ref",
        ref: "testimonials",
        help: "Optional. Shown on the case study page.",
      },
      { name: "is_featured", label: "Feature on homepage", kind: "boolean", half: true },
      { name: "is_published", label: "Published", kind: "boolean", half: true },
      ...seoFields,
    ],
  },
  testimonials: {
    key: "testimonials",
    table: "testimonials",
    label: "Testimonials",
    singular: "Testimonial",
    titleField: "author_name",
    permission: "marketingContent",
    orderBy: { column: "sort_order", ascending: true },
    columns: [
      { name: "company", label: "Company" },
      { name: "rating", label: "Rating" },
    ],
    fields: [
      { name: "author_name", label: "Name", kind: "text", required: true, half: true },
      { name: "author_role", label: "Job title", kind: "text", half: true },
      { name: "company", label: "Company", kind: "text", half: true },
      {
        name: "rating",
        label: "Rating",
        kind: "select",
        half: true,
        options: ["5", "4", "3", "2", "1"].map((v) => ({ value: v, label: `${v} stars` })),
      },
      { name: "quote", label: "Quote", kind: "textarea", required: true },
      { name: "avatar_url", label: "Photo", kind: "image" },
      { name: "service_id", label: "Related service", kind: "ref", ref: "services", half: true },
      { name: "industry_id", label: "Industry", kind: "ref", ref: "industries", half: true },
      { name: "sort_order", label: "Sort order", kind: "number", half: true },
      { name: "is_featured", label: "Feature on homepage", kind: "boolean", half: true },
      {
        name: "is_published",
        label: "Published",
        kind: "boolean",
        help: "Only publish quotes the client has approved.",
      },
    ],
  },
  blog: {
    key: "blog",
    table: "blog_posts",
    label: "Blog posts",
    singular: "Post",
    titleField: "title",
    permission: "marketingContent",
    orderBy: { column: "published_at", ascending: false },
    columns: [
      { name: "category", label: "Category" },
      { name: "author_name", label: "Author" },
      { name: "published_at", label: "Date" },
    ],
    publicPath: (r) => `/blog/${r.slug}`,
    fields: [
      { name: "title", label: "Title", kind: "text", required: true, half: true },
      slugField,
      { name: "author_name", label: "Author", kind: "text", half: true },
      { name: "published_at", label: "Publish date", kind: "datetime", half: true },
      {
        name: "category",
        label: "Category",
        kind: "text",
        half: true,
        help: "e.g. Software Solutions, Digital Marketing. Readers can filter by category.",
      },
      { name: "excerpt", label: "Excerpt", kind: "textarea" },
      { name: "cover_image_url", label: "Cover image", kind: "image" },
      { name: "tags", label: "Tags", kind: "tags", help: "One per line." },
      { name: "body", label: "Article", kind: "markdown" },
      { name: "is_published", label: "Published", kind: "boolean" },
      ...seoFields,
    ],
  },
  pages: {
    key: "pages",
    table: "pages",
    label: "Pages",
    singular: "Page",
    titleField: "title",
    permission: "siteContent",
    orderBy: { column: "title", ascending: true },
    columns: [{ name: "slug", label: "Path" }],
    publicPath: (r) => `/${r.slug}`,
    fields: [
      { name: "title", label: "Title", kind: "text", required: true, half: true },
      {
        ...slugField,
        help: "about, privacy and terms are linked from the site. Other slugs need a route added in code.",
      },
      { name: "body", label: "Content", kind: "markdown" },
      { name: "is_published", label: "Published", kind: "boolean" },
      ...seoFields,
    ],
  },
  solutions: {
    key: "solutions",
    table: "solutions",
    label: "Solutions",
    singular: "Solution",
    titleField: "title",
    permission: "marketingContent",
    orderBy: { column: "sort_order", ascending: true },
    columns: [
      { name: "kind", label: "Type" },
      { name: "sort_order", label: "Order" },
    ],
    publicPath: (r) => `/solutions/${r.slug}`,
    fields: [
      { name: "title", label: "Audience", kind: "text", required: true, half: true, help: "e.g. IT Managers" },
      slugField,
      {
        name: "kind",
        label: "Type",
        kind: "select",
        required: true,
        half: true,
        options: [
          { value: "persona", label: "Persona (role)" },
          { value: "segment", label: "Segment (organisation type)" },
        ],
      },
      { name: "icon", label: "Icon", kind: "text", half: true, help: "e.g. briefcase, server, megaphone, rocket" },
      { name: "headline", label: "Headline", kind: "text" },
      { name: "summary", label: "Summary", kind: "textarea" },
      { name: "needs", label: "What they need", kind: "tags", help: "One per line." },
      { name: "service_slugs", label: "Recommended services", kind: "serviceSlugs" },
      { name: "body", label: "Page content", kind: "markdown" },
      { name: "sort_order", label: "Sort order", kind: "number", half: true },
      { name: "is_featured", label: "Show on homepage", kind: "boolean", half: true },
      { name: "is_published", label: "Published", kind: "boolean" },
      ...seoFields,
    ],
  },
  faqs: {
    key: "faqs",
    table: "faqs",
    label: "FAQs",
    singular: "FAQ",
    titleField: "question",
    permission: "marketingContent",
    orderBy: { column: "sort_order", ascending: true },
    columns: [
      { name: "category", label: "Category" },
      { name: "sort_order", label: "Order" },
    ],
    fields: [
      { name: "question", label: "Question", kind: "text", required: true },
      { name: "answer", label: "Answer", kind: "markdown" },
      { name: "category", label: "Category", kind: "text", required: true, half: true, help: "Groups questions on the FAQ page." },
      { name: "service_id", label: "Show on service page", kind: "ref", ref: "services", half: true },
      { name: "sort_order", label: "Sort order", kind: "number", half: true },
      { name: "show_on_home", label: "Show on homepage", kind: "boolean", half: true },
      { name: "is_published", label: "Published", kind: "boolean" },
    ],
  },
  team: {
    key: "team",
    table: "team_members",
    label: "Team",
    singular: "Team member",
    titleField: "name",
    permission: "siteContent",
    orderBy: { column: "sort_order", ascending: true },
    columns: [
      { name: "job_title", label: "Role" },
      { name: "sort_order", label: "Order" },
    ],
    fields: [
      { name: "name", label: "Name", kind: "text", required: true, half: true },
      { name: "job_title", label: "Job title", kind: "text", half: true },
      { name: "bio", label: "Short bio", kind: "textarea" },
      { name: "photo_url", label: "Photo", kind: "image" },
      { name: "linkedin_url", label: "LinkedIn URL", kind: "url" },
      { name: "sort_order", label: "Sort order", kind: "number", half: true },
      { name: "is_leadership", label: "Leadership team", kind: "boolean", half: true },
      { name: "is_published", label: "Published", kind: "boolean" },
    ],
  },
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

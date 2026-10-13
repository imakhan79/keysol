export type ServiceCategory =
  | "communication"
  | "development"
  | "ecommerce"
  | "marketing"
  | "infrastructure";

type Seo = { seo_title: string | null; seo_description: string | null };
type Timestamps = { created_at: string; updated_at: string };

export type Service = Seo &
  Timestamps & {
    id: string;
    slug: string;
    title: string;
    category: ServiceCategory;
    short_description: string;
    body: string;
    icon: string;
    features: string[];
    technologies: string[];
    parent_id: string | null;
    sort_order: number;
    is_featured: boolean;
    is_published: boolean;
  };

export type Industry = Seo &
  Timestamps & {
    id: string;
    slug: string;
    name: string;
    summary: string;
    body: string;
    icon: string;
    sort_order: number;
    is_published: boolean;
  };

export type PortfolioProject = Seo &
  Timestamps & {
    id: string;
    slug: string;
    title: string;
    client_name: string;
    summary: string;
    body: string;
    cover_image_url: string | null;
    project_url: string | null;
    technologies: string[];
    service_id: string | null;
    industry_id: string | null;
    completed_on: string | null;
    sort_order: number;
    is_featured: boolean;
    is_published: boolean;
  };

export type Metric = { label: string; value: string };

export type CaseStudy = Seo &
  Timestamps & {
    id: string;
    slug: string;
    title: string;
    client_name: string;
    summary: string;
    challenge: string;
    solution: string;
    results: string;
    metrics: Metric[];
    cover_image_url: string | null;
    service_id: string | null;
    industry_id: string | null;
    is_featured: boolean;
    is_published: boolean;
    published_at: string | null;
  };

export type Testimonial = Timestamps & {
  id: string;
  author_name: string;
  author_role: string;
  company: string;
  quote: string;
  rating: number | null;
  avatar_url: string | null;
  service_id: string | null;
  sort_order: number;
  is_featured: boolean;
  is_published: boolean;
};

export type BlogPost = Seo &
  Timestamps & {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    body: string;
    cover_image_url: string | null;
    author_name: string;
    tags: string[];
    is_published: boolean;
    published_at: string | null;
  };

export type Page = Seo &
  Timestamps & {
    id: string;
    slug: string;
    title: string;
    body: string;
    is_published: boolean;
  };

export type LeadType = "contact" | "quote" | "callback" | "newsletter" | "enquiry";
export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost" | "spam";

export type Lead = {
  id: string;
  type: LeadType;
  status: LeadStatus;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  services: string[];
  budget_range: string | null;
  timeline: string | null;
  organization_type: string | null;
  company_size: string | null;
  source_page: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  assigned_to: string | null;
  estimated_value: number | null;
  created_at: string;
  updated_at: string;
};

export type LeadNote = {
  id: string;
  lead_id: string;
  author_id: string | null;
  author_email: string | null;
  body: string;
  created_at: string;
};

export type CompanySettings = {
  name: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  hours: string;
  whatsapp?: string;
};

export type SocialSettings = Partial<Record<"linkedin" | "facebook" | "instagram" | "x" | "youtube", string>>;

export type HomeSettings = {
  hero_title: string;
  hero_subtitle: string;
  primary_cta: string;
  secondary_cta: string;
  stats: Metric[];
  audience_line?: string;
  intro_title?: string;
  intro_text?: string;
  why_us?: { title: string; text: string }[];
};

export type QuoteOptions = {
  budgets: string[];
  timelines: string[];
  organization_types?: string[];
  company_sizes?: string[];
};

export type AboutSettings = {
  mission: string;
  vision: string;
  values: { title: string; text: string }[];
  history: { year: string; title: string; text: string }[];
  achievements: Metric[];
  certifications: { name: string; issuer: string; year: string }[];
};

export type SiteSettings = {
  company: CompanySettings;
  social: SocialSettings;
  home: HomeSettings;
  quote_options: QuoteOptions;
  about: AboutSettings;
};

export type Solution = Seo &
  Timestamps & {
    id: string;
    slug: string;
    title: string;
    kind: "persona" | "segment";
    headline: string;
    summary: string;
    needs: string[];
    body: string;
    icon: string;
    service_slugs: string[];
    sort_order: number;
    is_featured: boolean;
    is_published: boolean;
  };

export type Faq = Timestamps & {
  id: string;
  question: string;
  answer: string;
  category: string;
  service_id: string | null;
  show_on_home: boolean;
  sort_order: number;
  is_published: boolean;
};

export type TeamMember = Timestamps & {
  id: string;
  name: string;
  job_title: string;
  bio: string;
  photo_url: string | null;
  linkedin_url: string | null;
  is_leadership: boolean;
  sort_order: number;
  is_published: boolean;
};

-- Target audiences and personas: "Solutions" pages, technology stacks on services,
-- audience segmentation on leads, and new services the personas need.

-- ---------------------------------------------------------------------------
-- Solutions (one page per persona / audience segment)
-- ---------------------------------------------------------------------------

create table public.solutions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 160),
  kind text not null default 'persona' check (kind in ('persona', 'segment')),
  headline text not null default '',
  summary text not null default '',
  needs text[] not null default '{}',
  body text not null default '',
  icon text not null default '',
  -- Recommended services, by slug, in display order
  service_slugs text[] not null default '{}',
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index solutions_published_idx on public.solutions (is_published, sort_order);

create trigger set_updated_at before update on public.solutions
  for each row execute function private.set_updated_at();

grant select on public.solutions to anon, authenticated;
grant insert, update, delete on public.solutions to authenticated;

alter table public.solutions enable row level security;

create policy "Published rows are public" on public.solutions
  for select to anon, authenticated
  using (is_published or (select private.has_role(array['admin', 'editor'])));

create policy "Editors can insert" on public.solutions
  for insert to authenticated
  with check ((select private.has_role(array['admin', 'editor'])));

create policy "Editors can update" on public.solutions
  for update to authenticated
  using ((select private.has_role(array['admin', 'editor'])))
  with check ((select private.has_role(array['admin', 'editor'])));

create policy "Editors can delete" on public.solutions
  for delete to authenticated
  using ((select private.has_role(array['admin', 'editor'])));

-- ---------------------------------------------------------------------------
-- Technology stack per service (for IT managers)
-- ---------------------------------------------------------------------------

alter table public.services add column technologies text[] not null default '{}';

-- ---------------------------------------------------------------------------
-- Lead segmentation
-- ---------------------------------------------------------------------------

alter table public.leads
  add column organization_type text check (char_length(organization_type) <= 80),
  add column company_size text check (char_length(company_size) <= 40);

create index leads_organization_type_idx on public.leads (organization_type);

-- ---------------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------------

insert into public.services
  (slug, title, category, icon, sort_order, is_featured, is_published, short_description, features, technologies, body)
values
  ('mvp-development', 'MVP Development for Startups', 'development', 'rocket', 35, false, true,
   'Launch a market-ready minimum viable product quickly, validate demand and iterate with real users.',
   array['Product discovery & scoping', 'Clickable prototypes', 'Web or mobile MVP build', 'Analytics from day one', 'Scale-up roadmap'],
   array['Next.js', 'React Native', 'Node.js', 'PostgreSQL', 'Supabase', 'Stripe'],
   $md$Turn an idea into a working product without overbuilding. We help founders focus on the features that prove the business, then ship them fast.

## How we work with founders
1. **Discovery sprint** – define the problem, users and the smallest product that tests your riskiest assumption
2. **Prototype** – clickable designs to validate with users and investors
3. **Build** – a production-quality MVP on a stack that can grow with you
4. **Measure & iterate** – analytics, feedback loops and a prioritised roadmap

## Good to know
- Fixed-scope phases so you always know the cost
- You own the code and infrastructure accounts
- Optional e-commerce, payments and SMS notifications built in$md$),

  ('technology-consulting', 'Technology Consulting', 'business', 'compass', 85, false, true,
   'Independent advice on architecture, platforms, vendors and digital roadmaps before you invest.',
   array['Digital strategy & roadmaps', 'Architecture reviews', 'Platform and vendor selection', 'Security & performance audits', 'Fractional CTO support'],
   array['Cloud architecture', 'Security audits', 'System integration'],
   $md$Make technology decisions with confidence. We review where you are, where you want to be, and the most practical path between the two.

## Typical engagements
- Choosing between custom software and off-the-shelf platforms
- Planning a CRM, ERP or e-commerce implementation
- Reviewing an existing system's security, performance and scalability
- Ongoing fractional CTO guidance for startups and SMEs$md$),

  ('marketing-analytics', 'Marketing Analytics & Reporting', 'marketing', 'chart', 125, false, true,
   'Track every campaign from click to customer with dashboards your team will actually use.',
   array['Analytics & tag setup (GA4)', 'Conversion & lead tracking', 'Campaign attribution', 'Custom dashboards', 'Monthly insight reports'],
   array['Google Analytics 4', 'Google Tag Manager', 'Looker Studio', 'CRM integrations'],
   $md$Know which campaigns drive revenue. We set up measurement across your website, ads, SMS and social channels and turn it into clear reporting.

## What you get
- Correctly configured analytics and conversion events
- UTM conventions so every campaign is attributable
- Dashboards combining web, ads, SMS and CRM data
- A monthly review with recommendations$md$);

update public.services set technologies = t.tech
from (values
  ('bulk-sms', array['REST & SMPP APIs', 'Webhooks', 'Delivery reports']),
  ('digital-communication', array['WhatsApp Business API', 'Email (SMTP/API)', 'IVR', 'Webhooks']),
  ('software-development', array['TypeScript', 'Node.js', '.NET', 'Python', 'PostgreSQL', 'REST & GraphQL APIs', 'Docker']),
  ('web-development', array['Next.js', 'React', 'WordPress', 'Tailwind CSS', 'Vercel / cloud hosting']),
  ('mobile-app-development', array['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase']),
  ('cms-development', array['WordPress', 'Headless CMS', 'Strapi', 'Sanity']),
  ('crm-solutions', array['Custom CRM', 'HubSpot', 'Zoho', 'Salesforce integrations']),
  ('erp-solutions', array['Odoo', 'ERPNext', 'Custom integrations', 'REST APIs']),
  ('ecommerce-development', array['Shopify', 'WooCommerce', 'Headless commerce', 'Stripe & local gateways']),
  ('seo', array['Google Search Console', 'Schema.org', 'Core Web Vitals']),
  ('web-hosting', array['Linux servers', 'AWS / Azure / GCP', 'Cloudflare', 'SSL / TLS', 'Automated backups']),
  ('maintenance', array['Uptime monitoring', 'Automated updates', 'Backups']),
  ('technical-support', array['Ticketing / helpdesk', 'Remote support', 'SLA reporting'])
) as t(slug, tech)
where services.slug = t.slug;

insert into public.solutions
  (slug, title, kind, icon, sort_order, is_featured, is_published, headline, summary, needs, service_slugs, body)
values
  ('business-owners', 'Business Owners', 'persona', 'briefcase', 10, true, true,
   'One reliable technology partner for your whole business',
   'Clear services, proven work and transparent quotes, so you can grow without managing a dozen vendors.',
   array['A dependable partner who takes ownership', 'Clear services and transparent pricing', 'Evidence of real results', 'Fast, written quotations'],
   array['web-development', 'crm-solutions', 'ecommerce-development', 'digital-marketing', 'bulk-sms', 'technical-support'],
   $md$Running a business leaves little time to coordinate developers, marketers and hosting providers. We bring those capabilities under one roof with a single point of contact.

## How we make it simple
- **One accountable team** for your website, systems, marketing and support
- **Fixed or phased quotes** with clear scope before any work starts
- **Plain-language reporting** on what was delivered and the results$md$),

  ('it-managers', 'IT Managers', 'persona', 'server', 20, true, true,
   'Technical depth, documented delivery and dependable support',
   'Modern stacks, secure integrations and clear service levels that fit your architecture and governance.',
   array['Technical capability and stack fit', 'Secure, documented integrations', 'Case studies with technical detail', 'Defined support and SLAs'],
   array['software-development', 'erp-solutions', 'crm-solutions', 'web-hosting', 'maintenance', 'technical-support'],
   $md$We work alongside internal IT teams, from extending existing systems to taking full ownership of a platform.

## What to expect
- **Architecture first:** solution design, data flows and security reviewed with you before build
- **Documentation and handover:** code in your repositories, runbooks and admin training
- **Integration experience:** REST/GraphQL APIs, SSO, payment gateways, SMS gateways, CRM and ERP
- **Support you can plan around:** monitoring, patching and agreed response times. See our [support information](/support).$md$),

  ('marketing-managers', 'Marketing Managers', 'persona', 'megaphone', 30, true, true,
   'Campaigns, channels and analytics working together',
   'SMS, SEO, social media and paid campaigns with tracking that shows exactly what drives leads and sales.',
   array['Reliable bulk SMS and messaging', 'SEO and social media growth', 'Campaign execution across channels', 'Analytics and attribution you trust'],
   array['bulk-sms', 'seo', 'social-media-marketing', 'digital-marketing', 'marketing-analytics', 'digital-communication'],
   $md$Your channels should reinforce each other. We plan and run multi-channel campaigns and connect them to measurement so you can prove ROI.

## How we support marketing teams
- **Messaging:** SMS and WhatsApp campaigns with delivery and click reporting
- **Visibility:** technical and content SEO plus consistent social presence
- **Performance:** paid search and social, landing pages and conversion tracking
- **Insight:** dashboards that combine web, ads, SMS and CRM data$md$),

  ('startup-founders', 'Startup Founders', 'persona', 'rocket', 40, true, true,
   'From idea to MVP to growth, without wasting runway',
   'Product scoping, web and mobile MVPs, e-commerce and practical technology advice for early-stage teams.',
   array['A lean MVP shipped quickly', 'Web and mobile development', 'E-commerce and payments', 'Technical guidance and consulting'],
   array['mvp-development', 'web-development', 'mobile-app-development', 'ecommerce-development', 'technology-consulting', 'web-hosting'],
   $md$Early-stage companies need to learn fast and spend carefully. We help you build only what proves the business, on a foundation that scales when it works.

## Built for founders
- **Discovery sprints** to scope the smallest valuable product
- **Phased pricing** aligned with your milestones and funding
- **Investor-ready** prototypes and production MVPs
- **Fractional CTO** advice as your team grows$md$),

  ('smes', 'Small & Medium Businesses', 'segment', 'building', 50, false, true,
   'Enterprise-grade technology at SME scale',
   'Websites, CRM, e-commerce, SMS and support packaged for growing businesses with lean teams.',
   array['Affordable, phased delivery', 'Systems that save staff time', 'Marketing that generates leads', 'Responsive support'],
   array['web-development', 'crm-solutions', 'ecommerce-development', 'bulk-sms', 'seo', 'maintenance'],
   $md$SMEs need technology that pays for itself. We prioritise quick wins, automate repetitive work and give you one team to call.$md$),

  ('enterprises', 'Enterprises', 'segment', 'layers', 60, false, true,
   'Scalable platforms and integrations for complex organisations',
   'Custom software, ERP and CRM integration, high-volume messaging and managed infrastructure with governance built in.',
   array['Integration with existing systems', 'Security and compliance', 'High-volume, reliable messaging', 'Structured project governance'],
   array['software-development', 'erp-solutions', 'crm-solutions', 'digital-communication', 'web-hosting', 'technical-support'],
   $md$We deliver within enterprise governance: defined scopes, change control, security reviews, documentation and reporting to stakeholders.$md$),

  ('procurement-teams', 'Procurement Teams', 'segment', 'clipboard', 70, false, true,
   'A straightforward vendor to evaluate and onboard',
   'Clear scopes, itemised proposals and the documentation procurement teams need to compare and approve suppliers.',
   array['Itemised, comparable proposals', 'Company and compliance documents', 'Clear terms and deliverables', 'A single accountable contact'],
   array['software-development', 'web-development', 'bulk-sms', 'web-hosting', 'technical-support', 'technology-consulting'],
   $md$We make supplier evaluation easy. Request a quote with your requirements or RFP and we will respond with an itemised proposal, timeline and terms.

## Available on request
- Company profile and capability statement
- Proposal with itemised pricing and deliverables
- Service level and support terms
- References from comparable projects

*Edit this page in Admin → Solutions to list your registrations, certifications and payment terms.*$md$);

insert into public.pages (slug, title, is_published, seo_description, body) values
  ('support', 'Support & Service Levels', true,
   'How to get technical support, support channels, hours and response times.',
   $md$*Starting template: confirm the hours, channels and response times below match what you actually offer before relying on this page.*

## How to reach support
- **Email:** use the address on our [contact page](/contact)
- **Phone:** during business hours
- **Ticket portal:** available to clients on maintenance and support plans

## Priority levels
| Priority | Example | Target first response |
| --- | --- | --- |
| Critical | Website or system down, SMS delivery stopped | Update with your plan |
| High | Major feature not working | Update with your plan |
| Normal | Minor issue or question | Update with your plan |
| Request | Content change or enhancement | Update with your plan |

## What's covered
Security updates, monitoring, backups, bug fixes and agreed content changes, depending on your plan. See [Maintenance](/services/maintenance) and [Technical Support](/services/technical-support).$md$);

update public.site_settings
set value = value || '{
  "organization_types": ["Startup", "Small / medium business", "Enterprise", "E-commerce business", "Retail business", "Educational institution", "Healthcare organization", "Financial organization", "Government / public sector", "NGO / non-profit", "Other"],
  "company_sizes": ["1 – 10", "11 – 50", "51 – 200", "201 – 1,000", "1,000+"]
}'::jsonb
where key = 'quote_options';

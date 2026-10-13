-- Requirements sections 19–23: industries, case study detail, testimonial industry,
-- blog categories, consultation bookings and quote industry.

-- ---------------------------------------------------------------------------
-- 19. Industries
-- ---------------------------------------------------------------------------

insert into public.industries (slug, name, icon, sort_order, is_published, summary, body) values
  ('manufacturing', 'Manufacturing', 'factory', 85, true,
   'ERP, inventory and production systems that connect the factory floor to the back office.',
   $md$Manufacturers use our ERP, inventory and business automation solutions to plan production, track stock and orders in real time, and give distributors and customers self-service portals.

## How we help
- [ERP](/services/erp-solutions) and [inventory systems](/services/inventory-systems) for procurement, production and warehousing
- [Business process automation](/services/business-automation) for approvals, quality checks and reporting
- Dealer and distributor portals, order tracking and [SMS notifications](/services/transactional-sms)
- B2B [e-commerce](/services/ecommerce-development) and catalogue websites$md$),
  ('corporate', 'Corporate', 'briefcase', 90, true,
   'Enterprise applications, HR systems, intranets and secure hosting for corporate organisations.',
   $md$Corporate teams rely on us for enterprise applications, HR and CRM platforms, internal communication and secure, monitored infrastructure.

## How we help
- [Enterprise applications](/services/enterprise-applications) and [API integration](/services/api-development) across departments
- [HRMS](/services/hrms) and [CRM](/services/crm-solutions) platforms with role-based access
- Corporate websites, intranets and [internal messaging](/services/bulk-sms)
- [Managed hosting](/services/web-hosting), security monitoring and [technical support](/services/technical-support) with SLAs$md$)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- 20. Case studies: technology, implementation, screenshots and testimonial
-- ---------------------------------------------------------------------------

alter table public.case_studies
  add column technologies text[] not null default '{}',
  add column implementation text not null default '',
  add column screenshots text[] not null default '{}' check (cardinality(screenshots) <= 20),
  add column testimonial_id uuid references public.testimonials (id) on delete set null;

create index case_studies_testimonial_idx on public.case_studies (testimonial_id);

-- ---------------------------------------------------------------------------
-- 21. Testimonials: industry
-- ---------------------------------------------------------------------------

alter table public.testimonials
  add column industry_id uuid references public.industries (id) on delete set null;

create index testimonials_industry_idx on public.testimonials (industry_id);

-- ---------------------------------------------------------------------------
-- 22. Blog: categories
-- ---------------------------------------------------------------------------

alter table public.blog_posts
  add column category text not null default '' check (char_length(category) <= 80);

create index blog_posts_category_idx on public.blog_posts (category) where is_published;

update public.blog_posts set category = 'Digital Communication' where slug = 'bulk-sms-best-practices' and category = '';
update public.blog_posts set category = 'Digital Marketing' where slug = 'website-checklist-lead-generation' and category = '';
update public.blog_posts set category = 'Software Solutions' where slug = 'choosing-crm-small-business' and category = '';

-- ---------------------------------------------------------------------------
-- 23. Leads: consultation bookings and industry on quotes
-- ---------------------------------------------------------------------------

alter table public.leads drop constraint leads_type_check;
alter table public.leads add constraint leads_type_check
  check (type in ('contact', 'quote', 'callback', 'newsletter', 'enquiry', 'consultation'));

alter table public.leads
  add column industry text check (char_length(industry) <= 120),
  add column preferred_date date,
  add column preferred_time text check (char_length(preferred_time) <= 40),
  add column meeting_type text check (char_length(meeting_type) <= 40);

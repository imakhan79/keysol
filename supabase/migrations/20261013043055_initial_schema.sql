-- KeySol corporate website: content (CMS), leads (CRM), analytics and settings.
--
-- Access model
--   anon / authenticated visitors : read published content, insert leads and page views
--   staff (app_metadata.role)     : 'admin'  -> everything
--                                   'editor' -> content, settings, media
--                                   'sales'  -> leads and lead notes
-- Roles live in app_metadata (not user_metadata), which users cannot edit themselves.

create schema if not exists private;
grant usage on schema private to anon, authenticated;

create or replace function private.has_role(roles text[])
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = any (roles), false);
$$;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

grant execute on function private.has_role(text[]) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------------

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 160),
  category text not null check (category in (
    'communication', 'development', 'business', 'ecommerce', 'marketing', 'infrastructure'
  )),
  short_description text not null default '',
  body text not null default '',
  icon text not null default '',
  features text[] not null default '{}',
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.industries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 160),
  summary text not null default '',
  body text not null default '',
  icon text not null default '',
  sort_order integer not null default 0,
  is_published boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 160),
  client_name text not null default '',
  summary text not null default '',
  body text not null default '',
  cover_image_url text,
  project_url text,
  technologies text[] not null default '{}',
  service_id uuid references public.services (id) on delete set null,
  industry_id uuid references public.industries (id) on delete set null,
  completed_on date,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.case_studies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 200),
  client_name text not null default '',
  summary text not null default '',
  challenge text not null default '',
  solution text not null default '',
  results text not null default '',
  -- [{ "label": "Lead growth", "value": "+240%" }, ...]
  metrics jsonb not null default '[]' check (jsonb_typeof(metrics) = 'array'),
  cover_image_url text,
  service_id uuid references public.services (id) on delete set null,
  industry_id uuid references public.industries (id) on delete set null,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  published_at timestamptz,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null check (char_length(author_name) between 1 and 120),
  author_role text not null default '',
  company text not null default '',
  quote text not null check (char_length(quote) between 1 and 2000),
  rating smallint check (rating between 1 and 5),
  avatar_url text,
  service_id uuid references public.services (id) on delete set null,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 200),
  excerpt text not null default '',
  body text not null default '',
  cover_image_url text,
  author_name text not null default '',
  tags text[] not null default '{}',
  is_published boolean not null default false,
  published_at timestamptz,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Editable standalone pages (About, Privacy, Terms, ...)
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 200),
  body text not null default '',
  is_published boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Company details, contact info, social links, homepage copy, integration IDs
create table public.site_settings (
  key text primary key check (key ~ '^[a-z0-9_]+$'),
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Leads (lightweight CRM)
-- ---------------------------------------------------------------------------

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('contact', 'quote')),
  status text not null default 'new' check (status in (
    'new', 'contacted', 'qualified', 'proposal', 'won', 'lost', 'spam'
  )),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (char_length(phone) <= 40),
  company text check (char_length(company) <= 160),
  message text not null default '' check (char_length(message) <= 5000),
  services text[] not null default '{}' check (cardinality(services) <= 20),
  budget_range text check (char_length(budget_range) <= 60),
  timeline text check (char_length(timeline) <= 60),
  source_page text check (char_length(source_page) <= 300),
  utm_source text check (char_length(utm_source) <= 120),
  utm_medium text check (char_length(utm_medium) <= 120),
  utm_campaign text check (char_length(utm_campaign) <= 120),
  referrer text check (char_length(referrer) <= 500),
  assigned_to uuid references auth.users (id) on delete set null,
  estimated_value numeric(12, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  author_id uuid default auth.uid() references auth.users (id) on delete set null,
  author_email text,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- First-party analytics (no cookies, no IP stored)
-- ---------------------------------------------------------------------------

create table public.page_views (
  id bigint generated always as identity primary key,
  path text not null check (char_length(path) <= 300),
  referrer text check (char_length(referrer) <= 500),
  utm_source text check (char_length(utm_source) <= 120),
  utm_medium text check (char_length(utm_medium) <= 120),
  utm_campaign text check (char_length(utm_campaign) <= 120),
  device text check (device in ('mobile', 'tablet', 'desktop')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index services_published_idx on public.services (is_published, sort_order);
create index industries_published_idx on public.industries (is_published, sort_order);
create index portfolio_projects_published_idx on public.portfolio_projects (is_published, sort_order);
create index portfolio_projects_service_idx on public.portfolio_projects (service_id);
create index portfolio_projects_industry_idx on public.portfolio_projects (industry_id);
create index case_studies_published_idx on public.case_studies (is_published, published_at desc);
create index case_studies_service_idx on public.case_studies (service_id);
create index case_studies_industry_idx on public.case_studies (industry_id);
create index testimonials_published_idx on public.testimonials (is_published, sort_order);
create index testimonials_service_idx on public.testimonials (service_id);
create index blog_posts_published_idx on public.blog_posts (is_published, published_at desc);
create index leads_status_created_idx on public.leads (status, created_at desc);
create index leads_created_idx on public.leads (created_at desc);
create index leads_assigned_idx on public.leads (assigned_to);
create index lead_notes_lead_idx on public.lead_notes (lead_id, created_at);
create index lead_notes_author_idx on public.lead_notes (author_id);
create index page_views_created_idx on public.page_views (created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'services', 'industries', 'portfolio_projects', 'case_studies', 'testimonials',
    'blog_posts', 'pages', 'site_settings', 'leads'
  ]
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function private.set_updated_at()', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Grants (explicit, so access does not depend on Data API auto-expose settings)
-- ---------------------------------------------------------------------------

revoke all on all tables in schema public from anon, authenticated;

grant select on
  public.services, public.industries, public.portfolio_projects, public.case_studies,
  public.testimonials, public.blog_posts, public.pages, public.site_settings
to anon, authenticated;

grant insert, update, delete on
  public.services, public.industries, public.portfolio_projects, public.case_studies,
  public.testimonials, public.blog_posts, public.pages, public.site_settings
to authenticated;

grant insert on public.leads, public.page_views to anon, authenticated;
grant select, update, delete on public.leads to authenticated;
grant select, insert, delete on public.lead_notes to authenticated;
grant select on public.page_views to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.services enable row level security;
alter table public.industries enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.case_studies enable row level security;
alter table public.testimonials enable row level security;
alter table public.blog_posts enable row level security;
alter table public.pages enable row level security;
alter table public.site_settings enable row level security;
alter table public.leads enable row level security;
alter table public.lead_notes enable row level security;
alter table public.page_views enable row level security;

-- Content: public reads published rows, editors/admins manage everything.
do $$
declare
  t text;
begin
  foreach t in array array[
    'services', 'industries', 'portfolio_projects', 'case_studies', 'testimonials',
    'blog_posts', 'pages'
  ]
  loop
    execute format($f$
      create policy "Published rows are public" on public.%1$I
        for select to anon, authenticated
        using (is_published or (select private.has_role(array['admin', 'editor'])));

      create policy "Editors can insert" on public.%1$I
        for insert to authenticated
        with check ((select private.has_role(array['admin', 'editor'])));

      create policy "Editors can update" on public.%1$I
        for update to authenticated
        using ((select private.has_role(array['admin', 'editor'])))
        with check ((select private.has_role(array['admin', 'editor'])));

      create policy "Editors can delete" on public.%1$I
        for delete to authenticated
        using ((select private.has_role(array['admin', 'editor'])));
    $f$, t);
  end loop;
end;
$$;

-- Site settings: readable by everyone except keys prefixed private_.
create policy "Public settings are readable" on public.site_settings
  for select to anon, authenticated
  using (key not like 'private\_%' or (select private.has_role(array['admin', 'editor'])));

create policy "Editors can insert settings" on public.site_settings
  for insert to authenticated
  with check ((select private.has_role(array['admin', 'editor'])));

create policy "Editors can update settings" on public.site_settings
  for update to authenticated
  using ((select private.has_role(array['admin', 'editor'])))
  with check ((select private.has_role(array['admin', 'editor'])));

create policy "Admins can delete settings" on public.site_settings
  for delete to authenticated
  using ((select private.has_role(array['admin'])));

-- Leads: anyone can submit a fresh, unassigned lead; only staff can see or work them.
create policy "Visitors can submit leads" on public.leads
  for insert to anon, authenticated
  with check (status = 'new' and assigned_to is null and estimated_value is null);

create policy "Sales can view leads" on public.leads
  for select to authenticated
  using ((select private.has_role(array['admin', 'sales'])));

create policy "Sales can update leads" on public.leads
  for update to authenticated
  using ((select private.has_role(array['admin', 'sales'])))
  with check ((select private.has_role(array['admin', 'sales'])));

create policy "Admins can delete leads" on public.leads
  for delete to authenticated
  using ((select private.has_role(array['admin'])));

create policy "Sales can view notes" on public.lead_notes
  for select to authenticated
  using ((select private.has_role(array['admin', 'sales'])));

create policy "Sales can add own notes" on public.lead_notes
  for insert to authenticated
  with check (
    (select private.has_role(array['admin', 'sales']))
    and author_id = (select auth.uid())
  );

create policy "Authors and admins can delete notes" on public.lead_notes
  for delete to authenticated
  using (
    (select private.has_role(array['admin']))
    or ((select private.has_role(array['sales'])) and author_id = (select auth.uid()))
  );

-- Page views: write-only for visitors, readable by staff.
create policy "Visitors can record page views" on public.page_views
  for insert to anon, authenticated
  with check (path like '/%' and path not like '/admin%');

create policy "Staff can read page views" on public.page_views
  for select to authenticated
  using ((select private.has_role(array['admin', 'editor', 'sales'])));

-- ---------------------------------------------------------------------------
-- Media storage (public read, editors write)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif']
)
on conflict (id) do nothing;

create policy "Editors can upload media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (select private.has_role(array['admin', 'editor'])));

create policy "Editors can read media objects" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and (select private.has_role(array['admin', 'editor'])));

create policy "Editors can update media" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (select private.has_role(array['admin', 'editor'])))
  with check (bucket_id = 'media' and (select private.has_role(array['admin', 'editor'])));

create policy "Editors can delete media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (select private.has_role(array['admin', 'editor'])));

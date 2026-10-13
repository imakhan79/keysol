-- Requirement 35: dedicated ServiceCategories, BlogCategories, Media and SEOSettings tables.

-- ---------------------------------------------------------------------------
-- Service categories (were a fixed list in code)
-- ---------------------------------------------------------------------------

create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  label text not null check (char_length(label) between 1 and 120),
  blurb text not null default '' check (char_length(blurb) <= 300),
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.service_categories (key, label, blurb, sort_order) values
  ('development', 'Software Solutions',
   'Custom software, web, mobile and enterprise apps, APIs, CRM, ERP, HRMS, CMS, inventory and automation.', 10),
  ('communication', 'Digital Communication', 'SMS, messaging and omnichannel customer communication.', 20),
  ('ecommerce', 'E-commerce', 'Online stores, payments and marketplace integrations.', 30),
  ('marketing', 'Digital Marketing', 'SEO, social, content and paid campaigns that generate leads.', 40),
  ('infrastructure', 'Hosting & Support', 'Hosting, domains, SSL, backups, monitoring and support.', 50)
on conflict (key) do nothing;

-- Services reference a category row instead of a hard-coded list.
alter table public.services drop constraint services_category_check;
alter table public.services
  add constraint services_category_fkey foreign key (category)
  references public.service_categories (key) on update cascade on delete restrict;

-- ---------------------------------------------------------------------------
-- Blog categories (were free text on each post)
-- ---------------------------------------------------------------------------

create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null unique check (char_length(name) between 1 and 80),
  description text not null default '' check (char_length(description) <= 500),
  sort_order integer not null default 0,
  is_published boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.blog_categories (slug, name, sort_order)
select trim(both '-' from regexp_replace(lower(category), '[^a-z0-9]+', '-', 'g')), category,
       (row_number() over (order by category))::integer * 10
from (select distinct category from public.blog_posts where category <> '') c
on conflict do nothing;

alter table public.blog_posts
  add column category_id uuid references public.blog_categories (id) on delete set null;
create index blog_posts_category_id_idx on public.blog_posts (category_id);

update public.blog_posts p set category_id = c.id
from public.blog_categories c
where c.name = p.category;

drop index if exists public.blog_posts_category_idx;
alter table public.blog_posts drop column category;

-- ---------------------------------------------------------------------------
-- Media library: one row per file uploaded through the admin
-- ---------------------------------------------------------------------------

create table public.media (
  id uuid primary key default gen_random_uuid(),
  url text not null unique check (char_length(url) <= 1000),
  storage_path text check (char_length(storage_path) <= 500),
  file_name text not null default '' check (char_length(file_name) <= 255),
  mime_type text check (char_length(mime_type) <= 100),
  size_bytes integer check (size_bytes >= 0),
  alt_text text not null default '' check (char_length(alt_text) <= 300),
  uploaded_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index media_created_idx on public.media (created_at desc);

-- ---------------------------------------------------------------------------
-- SEO settings: per-page overrides for fixed pages (home, about, contact, …)
-- ---------------------------------------------------------------------------

create table public.seo_settings (
  id uuid primary key default gen_random_uuid(),
  path text not null unique check (path ~ '^/[a-z0-9/-]*$' and char_length(path) <= 200),
  meta_title text check (char_length(meta_title) <= 120),
  meta_description text check (char_length(meta_description) <= 320),
  og_image_url text check (char_length(og_image_url) <= 1000),
  noindex boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Triggers, grants and row level security
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array['service_categories', 'blog_categories', 'media', 'seo_settings']
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function private.set_updated_at()', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end;
$$;

grant select on public.service_categories, public.blog_categories, public.seo_settings to anon;

create policy "Published categories are public" on public.service_categories
  for select to anon, authenticated
  using (is_published or (select private.has_role(array['super_admin', 'admin', 'content_manager', 'marketing_manager'])));
create policy "Published blog categories are public" on public.blog_categories
  for select to anon, authenticated
  using (is_published or (select private.has_role(array['super_admin', 'admin', 'content_manager', 'marketing_manager'])));
create policy "SEO settings are public" on public.seo_settings
  for select to anon, authenticated
  using (true);
create policy "Staff can view media" on public.media
  for select to authenticated
  using ((select private.has_role(array['super_admin', 'admin', 'content_manager', 'marketing_manager'])));

do $$
declare
  t text;
begin
  foreach t in array array['service_categories', 'blog_categories', 'media', 'seo_settings']
  loop
    execute format($f$
      create policy "Editors can insert" on public.%1$I
        for insert to authenticated
        with check ((select private.has_role(array['super_admin', 'admin', 'content_manager', 'marketing_manager'])));
      create policy "Editors can update" on public.%1$I
        for update to authenticated
        using ((select private.has_role(array['super_admin', 'admin', 'content_manager', 'marketing_manager'])))
        with check ((select private.has_role(array['super_admin', 'admin', 'content_manager', 'marketing_manager'])));
      create policy "Editors can delete" on public.%1$I
        for delete to authenticated
        using ((select private.has_role(array['super_admin', 'admin', 'content_manager', 'marketing_manager'])));
    $f$, t);
  end loop;
end;
$$;

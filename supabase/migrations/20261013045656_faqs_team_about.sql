-- FAQs, leadership/team, and structured About + homepage content.

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(question) between 1 and 300),
  answer text not null default '' check (char_length(answer) <= 5000),
  category text not null default 'General' check (char_length(category) between 1 and 60),
  service_id uuid references public.services (id) on delete set null,
  show_on_home boolean not null default false,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  job_title text not null default '' check (char_length(job_title) <= 120),
  bio text not null default '' check (char_length(bio) <= 2000),
  photo_url text,
  linkedin_url text,
  is_leadership boolean not null default false,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index faqs_published_idx on public.faqs (is_published, sort_order);
create index faqs_service_idx on public.faqs (service_id);
create index team_members_published_idx on public.team_members (is_published, sort_order);

create trigger set_updated_at before update on public.faqs
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.team_members
  for each row execute function private.set_updated_at();

grant select on public.faqs, public.team_members to anon, authenticated;
grant insert, update, delete on public.faqs, public.team_members to authenticated;

alter table public.faqs enable row level security;
alter table public.team_members enable row level security;

do $$
declare
  t text;
  roles text;
begin
  foreach t in array array['faqs', 'team_members']
  loop
    roles := case when t = 'faqs'
      then $r$array['super_admin', 'admin', 'content_manager', 'marketing_manager']$r$
      else $r$array['super_admin', 'admin', 'content_manager']$r$
    end;
    execute format($f$
      create policy "Published rows are public" on public.%1$I
        for select to anon, authenticated
        using (is_published or (select private.has_role(%2$s)));
      create policy "Editors can insert" on public.%1$I
        for insert to authenticated
        with check ((select private.has_role(%2$s)));
      create policy "Editors can update" on public.%1$I
        for update to authenticated
        using ((select private.has_role(%2$s)))
        with check ((select private.has_role(%2$s)));
      create policy "Editors can delete" on public.%1$I
        for delete to authenticated
        using ((select private.has_role(%2$s)));
    $f$, t, roles);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Seed: FAQs (process questions only; no claims to verify)
-- ---------------------------------------------------------------------------

insert into public.faqs (category, question, answer, show_on_home, sort_order, is_published) values
  ('General', 'What services does KeySol provide?',
   'We provide digital communication and SMS solutions, custom software, web and mobile development, CMS, CRM and ERP implementation, e-commerce, digital marketing, SEO, social media, hosting, maintenance and technical support. See the [services page](/services) for details.',
   true, 10, true),
  ('General', 'Who do you work with?',
   'Startups, small and medium businesses, enterprises, e-commerce and retail businesses, educational institutions, healthcare and financial organisations, government bodies, and marketing and IT departments.',
   true, 20, true),
  ('Pricing & quotes', 'How much does a project cost?',
   'Every project is scoped individually. Share your requirements through the [quote form](/quote) and we will send an itemised proposal with scope, timeline and pricing.',
   true, 30, true),
  ('Pricing & quotes', 'How quickly will I receive a quotation?',
   'We aim to respond to every quote request within one business day, either with a proposal or with a few clarifying questions.',
   false, 40, true),
  ('Process', 'How does a typical project run?',
   'Discovery to agree goals and scope, a written proposal, design and build in short iterations with regular demos, then launch, training and ongoing support.',
   true, 50, true),
  ('Process', 'Will we own the code and accounts?',
   'Yes. Unless agreed otherwise, the code, domains and platform accounts created for your project belong to you.',
   false, 60, true),
  ('Support', 'Do you provide support after launch?',
   'Yes. We offer maintenance and technical support plans covering updates, monitoring, backups and fixes. See [Support & Service Levels](/support).',
   true, 70, true),
  ('Technical', 'Can you integrate with our existing systems?',
   'Usually, yes. We regularly connect websites and applications to CRMs, ERPs, payment gateways, SMS gateways and internal systems through APIs.',
   false, 80, true);

-- ---------------------------------------------------------------------------
-- Seed: About and homepage structure (facts left empty for the company to add)
-- ---------------------------------------------------------------------------

insert into public.site_settings (key, value) values
  ('about', '{
    "mission": "To make modern technology accessible and effective for organisations of every size, helping them communicate, sell and operate better.",
    "vision": "To be the most trusted single technology partner for growing businesses and institutions in our region.",
    "values": [
      { "title": "Partnership", "text": "We take ownership of outcomes and work as an extension of your team." },
      { "title": "Transparency", "text": "Clear scopes, honest timelines and pricing with no surprises." },
      { "title": "Quality", "text": "Secure, maintainable solutions built to last." },
      { "title": "Responsiveness", "text": "Fast answers and dependable support after launch." }
    ],
    "history": [],
    "achievements": [],
    "certifications": []
  }')
on conflict (key) do nothing;

update public.site_settings
set value = value || '{
  "audience_line": "For startups, SMEs, enterprises and public-sector organisations",
  "intro_title": "Your single partner for digital growth",
  "intro_text": "KeySol brings digital communication, software engineering, e-commerce, marketing and managed infrastructure together under one roof. Instead of coordinating several vendors, you work with one accountable team that understands your goals end to end.",
  "why_us": [
    { "title": "One accountable team", "text": "Communication, software, commerce, marketing and hosting from a single partner." },
    { "title": "Transparent proposals", "text": "Itemised scopes, timelines and pricing before work begins." },
    { "title": "Built to integrate", "text": "Solutions that connect to your CRM, ERP, payment and messaging systems." },
    { "title": "Support after launch", "text": "Maintenance, monitoring and help when you need it." }
  ]
}'::jsonb
where key = 'home';

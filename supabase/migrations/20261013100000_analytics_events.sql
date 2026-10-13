-- Analytics & reporting (requirement 33): unique visitors, click events (CTA, WhatsApp, phone,
-- email) and dashboard figures for lead sources, service views and conversion rate.

-- Cookieless visitor counting: a daily-rotating salted hash computed server-side (no IP stored).
alter table public.page_views add column visitor_hash text check (char_length(visitor_hash) <= 64);
create index page_views_visitor_idx on public.page_views (created_at, visitor_hash);

create table public.analytics_events (
  id bigint generated always as identity primary key,
  name text not null check (name in ('cta_click', 'whatsapp_click', 'phone_click', 'email_click')),
  label text check (char_length(label) <= 120),
  path text not null check (char_length(path) <= 300),
  visitor_hash text check (char_length(visitor_hash) <= 64),
  created_at timestamptz not null default now()
);
create index analytics_events_created_idx on public.analytics_events (created_at desc);

alter table public.analytics_events enable row level security;
grant insert on public.analytics_events to anon, authenticated;
grant select on public.analytics_events to authenticated;

create policy "Visitors can record events" on public.analytics_events
  for insert to anon, authenticated
  with check (path like '/%' and path not like '/admin%');

create policy "Staff can read events" on public.analytics_events
  for select to authenticated
  using ((select private.has_role(array[
    'super_admin', 'admin', 'sales_manager', 'sales_rep', 'marketing_manager', 'content_manager', 'support_staff'
  ])));

create or replace function public.dashboard_summary(days integer default 30)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with since as (
    select now() - make_interval(days => least(greatest(days, 1), 365)) as ts
  ),
  views as (
    select pv.* from public.page_views pv, since where pv.created_at >= since.ts
  ),
  recent_leads as (
    select l.* from public.leads l, since where l.created_at >= since.ts
  ),
  events as (
    select e.* from public.analytics_events e, since where e.created_at >= since.ts
  )
  select jsonb_build_object(
    'days', least(greatest(days, 1), 365),
    'page_views', (select count(*) from views),
    'visitors', (select count(distinct visitor_hash) from views where visitor_hash is not null),
    'events', coalesce((
      select jsonb_object_agg(name, n) from (select name, count(*) as n from events group by name) e
    ), '{}'::jsonb),
    'top_ctas', coalesce((
      select jsonb_agg(jsonb_build_object('label', label, 'clicks', n) order by n desc)
      from (
        select coalesce(nullif(label, ''), 'Unlabelled') as label, count(*) as n
        from events where name = 'cta_click' group by 1 order by n desc limit 8
      ) c
    ), '[]'::jsonb),
    'leads_by_type', coalesce((
      select jsonb_object_agg(type, n) from (select type, count(*) as n from recent_leads group by type) t
    ), '{}'::jsonb),
    'lead_sources', coalesce((
      select jsonb_agg(jsonb_build_object('source', source, 'leads', n) order by n desc)
      from (
        select coalesce(nullif(utm_source, ''), nullif(split_part(split_part(referrer, '://', 2), '/', 1), ''), 'direct') as source,
               count(*) as n
        from recent_leads where type <> 'newsletter' group by 1 order by n desc limit 8
      ) s
    ), '[]'::jsonb),
    'service_views', coalesce((
      select jsonb_agg(jsonb_build_object('path', path, 'views', n) order by n desc)
      from (
        select path, count(*) as n from views where path like '/services/%' group by path order by n desc limit 8
      ) sv
    ), '[]'::jsonb),
    'leads', (select count(*) from recent_leads),
    'quotes', (select count(*) from recent_leads where type = 'quote'),
    'open_leads', (
      select count(*) from public.leads
      where status in ('new', 'contacted', 'qualified', 'consultation', 'proposal', 'negotiation')
    ),
    'leads_by_status', coalesce((
      select jsonb_object_agg(status, n)
      from (select status, count(*) as n from public.leads group by status) s
    ), '{}'::jsonb),
    'views_by_day', coalesce((
      select jsonb_agg(jsonb_build_object('day', day, 'views', n) order by day)
      from (
        select date_trunc('day', created_at)::date as day, count(*) as n
        from views group by 1
      ) d
    ), '[]'::jsonb),
    'leads_by_day', coalesce((
      select jsonb_agg(jsonb_build_object('day', day, 'leads', n) order by day)
      from (
        select date_trunc('day', created_at)::date as day, count(*) as n
        from recent_leads group by 1
      ) d
    ), '[]'::jsonb),
    'top_pages', coalesce((
      select jsonb_agg(jsonb_build_object('path', path, 'views', n) order by n desc)
      from (
        select path, count(*) as n from views group by path order by n desc limit 10
      ) p
    ), '[]'::jsonb),
    'top_sources', coalesce((
      select jsonb_agg(jsonb_build_object('source', source, 'views', n) order by n desc)
      from (
        select coalesce(nullif(utm_source, ''), nullif(split_part(split_part(referrer, '://', 2), '/', 1), ''), 'direct') as source,
               count(*) as n
        from views group by 1 order by n desc limit 8
      ) s
    ), '[]'::jsonb),
    'devices', coalesce((
      select jsonb_object_agg(coalesce(device, 'unknown'), n)
      from (select device, count(*) as n from views group by device) d
    ), '{}'::jsonb)
  );
$$;

revoke execute on function public.dashboard_summary(integer) from public, anon;
grant execute on function public.dashboard_summary(integer) to authenticated;

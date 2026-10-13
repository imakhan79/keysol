-- Sales pipeline stages from the user journey (requirements 27/28):
-- new → contacted → qualified → consultation → proposal → negotiation → won → onboarding (or lost / spam).

alter table public.leads drop constraint leads_status_check;
alter table public.leads add constraint leads_status_check check (status in (
  'new', 'contacted', 'qualified', 'consultation', 'proposal', 'negotiation', 'won', 'onboarding', 'lost', 'spam'
));

-- Open pipeline now includes the consultation and negotiation stages.
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
  )
  select jsonb_build_object(
    'days', least(greatest(days, 1), 365),
    'page_views', (select count(*) from views),
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

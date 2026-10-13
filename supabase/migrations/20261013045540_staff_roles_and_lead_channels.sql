-- Staff roles from the requirements, plus more lead-capture channels.
--
--   Role (app_metadata.role)   Access
--   super_admin                everything, including managing admins
--   admin                      everything except managing super admins
--   sales_manager              all leads, assign to reps, export
--   sales_rep                  leads assigned to them + unassigned leads (can claim)
--   marketing_manager          marketing content, analytics, read-only leads
--   content_manager            all content, pages, media, site settings
--   support_staff              contact enquiries and callback requests
--   customer / (none)          no staff access; visitors need no account
--
-- Roles live in app_metadata, which users cannot edit. A role change reaches the
-- user's JWT on their next token refresh or sign-in.

-- Existing accounts on the old role names
update auth.users
set raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role',
  case raw_app_meta_data ->> 'role' when 'editor' then 'content_manager' when 'sales' then 'sales_rep' end)
where raw_app_meta_data ->> 'role' in ('editor', 'sales');

create or replace function private.staff_role()
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select auth.jwt() -> 'app_metadata' ->> 'role';
$$;

grant execute on function private.staff_role() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Content policies
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
  marketing_tables text[] := array[
    'services', 'industries', 'portfolio_projects', 'case_studies', 'testimonials', 'blog_posts', 'solutions'
  ];
  roles text;
begin
  foreach t in array marketing_tables || array['pages']
  loop
    roles := case when t = 'pages'
      then $r$array['super_admin', 'admin', 'content_manager']$r$
      else $r$array['super_admin', 'admin', 'content_manager', 'marketing_manager']$r$
    end;
    execute format('drop policy if exists "Published rows are public" on public.%I', t);
    execute format('drop policy if exists "Editors can insert" on public.%I', t);
    execute format('drop policy if exists "Editors can update" on public.%I', t);
    execute format('drop policy if exists "Editors can delete" on public.%I', t);
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

drop policy "Public settings are readable" on public.site_settings;
drop policy "Editors can insert settings" on public.site_settings;
drop policy "Editors can update settings" on public.site_settings;
drop policy "Admins can delete settings" on public.site_settings;

create policy "Public settings are readable" on public.site_settings
  for select to anon, authenticated
  using (
    key not like 'private\_%'
    or (select private.has_role(array['super_admin', 'admin', 'content_manager']))
  );

create policy "Content managers can insert settings" on public.site_settings
  for insert to authenticated
  with check ((select private.has_role(array['super_admin', 'admin', 'content_manager'])));

create policy "Content managers can update settings" on public.site_settings
  for update to authenticated
  using ((select private.has_role(array['super_admin', 'admin', 'content_manager'])))
  with check ((select private.has_role(array['super_admin', 'admin', 'content_manager'])));

create policy "Admins can delete settings" on public.site_settings
  for delete to authenticated
  using ((select private.has_role(array['super_admin', 'admin'])));

-- Media
drop policy "Editors can upload media" on storage.objects;
drop policy "Editors can read media objects" on storage.objects;
drop policy "Editors can update media" on storage.objects;
drop policy "Editors can delete media" on storage.objects;

create policy "Content staff can upload media" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'media'
    and (select private.has_role(array['super_admin', 'admin', 'content_manager', 'marketing_manager']))
  );

create policy "Content staff can read media objects" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'media'
    and (select private.has_role(array['super_admin', 'admin', 'content_manager', 'marketing_manager']))
  );

create policy "Content staff can update media" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'media'
    and (select private.has_role(array['super_admin', 'admin', 'content_manager', 'marketing_manager']))
  )
  with check (
    bucket_id = 'media'
    and (select private.has_role(array['super_admin', 'admin', 'content_manager', 'marketing_manager']))
  );

create policy "Content staff can delete media" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'media'
    and (select private.has_role(array['super_admin', 'admin', 'content_manager', 'marketing_manager']))
  );

-- ---------------------------------------------------------------------------
-- Leads: new channels
-- ---------------------------------------------------------------------------

alter table public.leads drop constraint leads_type_check;
alter table public.leads add constraint leads_type_check
  check (type in ('contact', 'quote', 'callback', 'newsletter', 'enquiry'));

-- Newsletter sign-ups have no name
alter table public.leads drop constraint leads_name_check;
alter table public.leads add constraint leads_name_check check (char_length(name) <= 120);

-- ---------------------------------------------------------------------------
-- Leads: role-based access
-- ---------------------------------------------------------------------------

drop policy "Sales can view leads" on public.leads;
drop policy "Sales can update leads" on public.leads;
drop policy "Admins can delete leads" on public.leads;

create policy "Staff can view leads by role" on public.leads
  for select to authenticated
  using (
    (select private.has_role(array['super_admin', 'admin', 'sales_manager', 'marketing_manager']))
    or (
      (select private.has_role(array['sales_rep']))
      and (assigned_to = (select auth.uid()) or assigned_to is null)
    )
    or ((select private.has_role(array['support_staff'])) and type in ('contact', 'callback'))
  );

create policy "Managers can update any lead" on public.leads
  for update to authenticated
  using ((select private.has_role(array['super_admin', 'admin', 'sales_manager'])))
  with check ((select private.has_role(array['super_admin', 'admin', 'sales_manager'])));

-- Reps work their own leads and can claim unassigned ones, but cannot hand leads to others.
create policy "Reps can update own or unassigned leads" on public.leads
  for update to authenticated
  using (
    (select private.has_role(array['sales_rep']))
    and (assigned_to = (select auth.uid()) or assigned_to is null)
  )
  with check (
    (select private.has_role(array['sales_rep']))
    and (assigned_to = (select auth.uid()) or assigned_to is null)
  );

create policy "Support can update enquiries" on public.leads
  for update to authenticated
  using ((select private.has_role(array['support_staff'])) and type in ('contact', 'callback'))
  with check ((select private.has_role(array['support_staff'])) and type in ('contact', 'callback'));

create policy "Admins can delete leads" on public.leads
  for delete to authenticated
  using ((select private.has_role(array['super_admin', 'admin'])));

-- Notes follow lead visibility (the subquery is filtered by the leads policies above).
drop policy "Sales can view notes" on public.lead_notes;
drop policy "Sales can add own notes" on public.lead_notes;
drop policy "Authors and admins can delete notes" on public.lead_notes;

create policy "Staff can view notes on visible leads" on public.lead_notes
  for select to authenticated
  using (exists (select 1 from public.leads l where l.id = lead_id));

create policy "Lead workers can add own notes" on public.lead_notes
  for insert to authenticated
  with check (
    (select private.has_role(array['super_admin', 'admin', 'sales_manager', 'sales_rep', 'support_staff']))
    and author_id = (select auth.uid())
    and exists (select 1 from public.leads l where l.id = lead_id)
  );

create policy "Authors and admins can delete notes" on public.lead_notes
  for delete to authenticated
  using (
    (select private.has_role(array['super_admin', 'admin']))
    or author_id = (select auth.uid())
  );

drop policy "Staff can read page views" on public.page_views;
create policy "Staff can read page views" on public.page_views
  for select to authenticated
  using ((select private.has_role(array[
    'super_admin', 'admin', 'sales_manager', 'sales_rep', 'marketing_manager', 'content_manager', 'support_staff'
  ])));

-- ---------------------------------------------------------------------------
-- Team management
-- ---------------------------------------------------------------------------
-- SECURITY DEFINER is required to read and update auth.users. Each function checks
-- the caller's role first, is revoked from anon, and has a fixed search_path.

create or replace function public.list_staff()
returns table (id uuid, email text, role text, last_sign_in_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.has_role(array['super_admin', 'admin', 'sales_manager']) then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  return query
    select u.id, u.email::text, u.raw_app_meta_data ->> 'role', u.last_sign_in_at
    from auth.users u
    where u.raw_app_meta_data ->> 'role' in (
      'super_admin', 'admin', 'sales_manager', 'sales_rep', 'marketing_manager', 'content_manager', 'support_staff'
    )
    order by u.email;
end;
$$;

create or replace function public.set_user_role(target_email text, new_role text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller text := private.staff_role();
  target auth.users%rowtype;
  old_role text;
begin
  if caller is null or caller not in ('super_admin', 'admin') then
    raise exception 'Only administrators can change roles' using errcode = '42501';
  end if;
  if new_role is not null and new_role not in (
    'super_admin', 'admin', 'sales_manager', 'sales_rep', 'marketing_manager', 'content_manager', 'support_staff', 'customer'
  ) then
    raise exception 'Unknown role %', new_role using errcode = '22023';
  end if;

  select * into target from auth.users where lower(email) = lower(trim(target_email));
  if not found then
    raise exception 'No user with that email. Create the account in Supabase Auth first.' using errcode = 'P0002';
  end if;
  if target.id = auth.uid() then
    raise exception 'You cannot change your own role' using errcode = '42501';
  end if;

  old_role := target.raw_app_meta_data ->> 'role';
  if caller <> 'super_admin' and (old_role in ('super_admin', 'admin') or new_role in ('super_admin', 'admin')) then
    raise exception 'Only a super admin can grant or change administrator roles' using errcode = '42501';
  end if;

  update auth.users
  set raw_app_meta_data = case
    when new_role is null then coalesce(raw_app_meta_data, '{}'::jsonb) - 'role'
    else coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', new_role)
  end
  where id = target.id;

  -- Removing staff access frees their leads for reassignment.
  if new_role is null or new_role = 'customer' then
    update public.leads set assigned_to = null where assigned_to = target.id;
  end if;

  return target.email;
end;
$$;

revoke execute on function public.list_staff() from public, anon;
revoke execute on function public.set_user_role(text, text) from public, anon;
grant execute on function public.list_staff() to authenticated;
grant execute on function public.set_user_role(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Contact channels for floating call / WhatsApp buttons
-- ---------------------------------------------------------------------------

update public.site_settings
set value = value || '{"whatsapp": ""}'::jsonb
where key = 'company';

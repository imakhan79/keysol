-- Merge "Business Technology" into "Software Solutions" (requirements section 15).

update public.services set category = 'development' where category = 'business';

alter table public.services drop constraint services_category_check;
alter table public.services add constraint services_category_check check (category in (
  'communication', 'development', 'ecommerce', 'marketing', 'infrastructure'
));

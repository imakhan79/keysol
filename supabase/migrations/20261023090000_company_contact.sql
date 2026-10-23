-- Real contact mobile number, email and office address in place of the placeholders.

update public.site_settings
set value = value || '{
  "phone": "+92 309 9087210",
  "email": "sales@capitalinktech.com",
  "address": "Office # 314, Arooj Arcade, Sector F-10 Markaz, Islamabad"
}'::jsonb
where key = 'company';

update public.pages
set body = replace(body, 'hello@capitalink.example', 'sales@capitalinktech.com')
where body like '%hello@capitalink.example%';

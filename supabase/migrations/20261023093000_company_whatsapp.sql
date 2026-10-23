-- WhatsApp chat uses the same number as the contact mobile.

update public.site_settings
set value = value || '{"whatsapp": "+92 309 9087210"}'::jsonb
where key = 'company';

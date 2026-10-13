-- Copy updates for the homepage and About page structure from the requirements.
-- Only touches rows that still contain the original seed text, so edits made in
-- the admin panel are never overwritten.

update public.site_settings
set value = value || '{
  "hero_title": "Digital communication, software and marketing that grow your business",
  "hero_subtitle": "SMS solutions, custom software, web and mobile apps, e-commerce, SEO and managed hosting from one accountable partner, so you launch faster, reach more customers and spend less time managing vendors."
}'::jsonb
where key = 'home'
  and value ->> 'hero_title' = 'Digital solutions that turn visitors into customers';

update public.pages
set title = 'About KeySol',
    body = $md$KeySol is a technology and digital-services company helping organisations communicate, sell and operate better.

We bring together digital communication and SMS, software engineering, e-commerce, digital marketing and managed infrastructure, so our clients work with one accountable partner instead of many vendors.

We work with startups, small and medium businesses, enterprises, educational institutions, healthcare and financial organisations, retailers and public-sector bodies, and with the marketing, IT and procurement teams inside them.

*Edit this introduction in Admin → Pages. Mission, vision, values, milestones, achievements and certifications are in Admin → Settings; leadership and team profiles are in Admin → Team profiles.*$md$
where slug = 'about'
  and body like 'KeySol is a technology and digital-services company helping organisations communicate, sell and operate better.%## What we do%';

update public.blog_posts
set title = '7 SMS marketing best practices for higher engagement',
    tags = array['SMS', 'Marketing']
where slug = 'bulk-sms-best-practices'
  and title = '7 bulk SMS best practices for higher engagement';

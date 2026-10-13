-- Starter content for the KeySol website. Everything here is editable from /admin.
-- Portfolio projects, case studies and testimonials are UNPUBLISHED samples: replace them
-- with real client work before publishing.

insert into public.site_settings (key, value) values
  ('company', '{
    "name": "KeySol",
    "tagline": "Technology that moves your business forward",
    "description": "KeySol delivers digital communication, software development, e-commerce, digital marketing, hosting and business technology solutions for growing organisations.",
    "email": "hello@keysol.example",
    "phone": "+00 000 000 0000",
    "address": "Update your address in Admin → Settings",
    "hours": "Mon–Fri, 9:00–18:00"
  }'),
  ('social', '{
    "linkedin": "",
    "facebook": "",
    "instagram": "",
    "x": "",
    "youtube": ""
  }'),
  ('home', '{
    "hero_title": "Digital solutions that turn visitors into customers",
    "hero_subtitle": "From bulk SMS and custom software to e-commerce, SEO and managed hosting, KeySol is the single technology partner for your growth.",
    "primary_cta": "Request a quote",
    "secondary_cta": "Explore services",
    "stats": [
      { "label": "Service lines", "value": "15+" },
      { "label": "Support coverage", "value": "24/7" },
      { "label": "Industries served", "value": "8" },
      { "label": "Response time", "value": "< 1 day" }
    ]
  }'),
  ('quote_options', '{
    "budgets": ["Under $1,000", "$1,000 – $5,000", "$5,000 – $15,000", "$15,000 – $50,000", "$50,000+", "Not sure yet"],
    "timelines": ["ASAP", "Within 1 month", "1 – 3 months", "3 – 6 months", "Flexible"]
  }');

insert into public.services
  (slug, title, category, icon, sort_order, is_featured, is_published, short_description, features, body)
values
  ('bulk-sms', 'Bulk SMS & Messaging', 'communication', 'message', 10, true, true,
   'Reach customers instantly with reliable bulk SMS, OTP and two-way messaging at scale.',
   array['Bulk & scheduled campaigns', 'OTP and transactional SMS', 'Two-way messaging', 'Delivery reports & analytics', 'API and web portal access'],
   $md$Reach every customer in seconds. Our messaging platform handles everything from marketing campaigns to time-critical one-time passwords, with delivery reporting you can trust.

## What we deliver
- **Campaign SMS** with contact lists, personalisation and scheduling
- **Transactional & OTP** messages through a developer-friendly API
- **Two-way SMS** for surveys, confirmations and customer service
- **Sender ID** registration and compliance guidance

## Why it matters
SMS has the highest open rate of any channel. Paired with clear reporting, it becomes one of the most measurable ways to drive action.$md$),

  ('digital-communication', 'Digital Communication Solutions', 'communication', 'broadcast', 20, false, true,
   'Unified email, WhatsApp, voice and SMS communication so your customers hear from you on the right channel.',
   array['Omnichannel messaging', 'Email marketing infrastructure', 'WhatsApp Business integration', 'IVR & voice broadcast', 'Customer journey automation'],
   $md$Modern customers move between channels. We connect SMS, email, WhatsApp and voice into one coordinated communication stack.

## Capabilities
- Email delivery infrastructure and templates
- WhatsApp Business API integration
- Voice broadcast and IVR
- Contact centre and helpdesk integrations$md$),

  ('software-development', 'Custom Software Development', 'development', 'code', 30, true, true,
   'Tailor-made software built around your workflows, from internal tools to customer-facing platforms.',
   array['Discovery & solution design', 'Agile delivery', 'API & system integration', 'Cloud-native architecture', 'Quality assurance'],
   $md$Off-the-shelf software rarely fits perfectly. We design and build applications around the way your business actually works.

## Our process
1. **Discovery** – workshops to map requirements and priorities
2. **Design** – UX prototypes and technical architecture
3. **Build** – agile sprints with regular demos
4. **Launch & support** – deployment, training and ongoing improvement$md$),

  ('web-development', 'Website Development', 'development', 'globe', 40, true, true,
   'Fast, secure and search-friendly websites that represent your brand and generate leads.',
   array['Responsive design', 'Performance optimisation', 'SEO-ready structure', 'Accessibility', 'Analytics & lead tracking'],
   $md$Your website is often your first impression. We build fast, accessible, conversion-focused sites that look great on every device.

## Included as standard
- Mobile-first responsive design
- Core Web Vitals performance tuning
- Technical SEO foundations
- Contact and quote forms connected to your CRM$md$),

  ('mobile-app-development', 'Mobile App Development', 'development', 'smartphone', 50, false, true,
   'Native and cross-platform iOS and Android apps with intuitive design and robust back ends.',
   array['iOS & Android', 'Cross-platform (React Native / Flutter)', 'Push notifications', 'App store publishing', 'Maintenance & updates'],
   $md$Put your services in your customers' pockets. We build mobile apps that are easy to use and simple to maintain.

## From idea to app store
- Product strategy and UX design
- Cross-platform or native development
- Secure APIs and admin dashboards
- Store submission and post-launch support$md$),

  ('cms-development', 'CMS Development', 'development', 'layout', 60, false, true,
   'Content management systems that let your team publish and update content without a developer.',
   array['WordPress & headless CMS', 'Custom content models', 'Editorial workflows', 'Multi-language content', 'Training'],
   $md$Give your marketing team control. We implement and customise content management systems so updating your site is quick and safe.$md$),

  ('crm-solutions', 'CRM Solutions', 'business', 'users', 70, true, true,
   'Capture, track and convert leads with a CRM configured for your sales process.',
   array['Lead & pipeline management', 'Sales automation', 'Customer 360 view', 'Reporting dashboards', 'Integration with web forms & SMS'],
   $md$Stop losing leads in inboxes and spreadsheets. We implement CRM systems that give your team one place to manage every customer relationship.

## Typical outcomes
- Every enquiry captured and assigned automatically
- Clear pipeline stages and forecasting
- Follow-up reminders and automated messaging$md$),

  ('erp-solutions', 'ERP Solutions', 'business', 'layers', 80, false, true,
   'Connect finance, inventory, HR and operations with ERP implementation and integration.',
   array['Requirements analysis', 'Module configuration', 'Data migration', 'Third-party integration', 'User training'],
   $md$We help organisations select, configure and integrate ERP modules so data flows between departments instead of being re-keyed.$md$),

  ('ecommerce-development', 'E-commerce Development', 'ecommerce', 'cart', 90, true, true,
   'Online stores that convert, with secure payments, inventory sync and smooth checkout.',
   array['Storefront design', 'Payment gateway integration', 'Inventory & order management', 'Marketplace integrations', 'Conversion optimisation'],
   $md$Sell online with confidence. We build and optimise e-commerce stores, from catalogue to checkout to fulfilment.

## Features
- Secure local and international payment gateways
- Inventory, shipping and tax configuration
- Abandoned cart recovery via email and SMS
- Analytics and conversion tracking$md$),

  ('digital-marketing', 'Digital Marketing', 'marketing', 'megaphone', 100, true, true,
   'Data-driven campaigns across search, social and display that turn budget into measurable growth.',
   array['Paid search & social ads', 'Campaign strategy', 'Landing pages', 'Conversion tracking', 'Monthly reporting'],
   $md$We plan, launch and optimise campaigns with one goal: measurable business results. Every campaign is tracked from click to lead.$md$),

  ('seo', 'Search Engine Optimisation (SEO)', 'marketing', 'search', 110, false, true,
   'Rank higher, attract qualified organic traffic and build lasting search visibility.',
   array['Technical SEO audits', 'Keyword research', 'On-page optimisation', 'Local SEO', 'Content strategy'],
   $md$Organic search compounds over time. Our SEO programmes combine technical fixes, content and authority building.

## Our approach
1. Technical audit and quick wins
2. Keyword and competitor research
3. Content and on-page optimisation
4. Monthly reporting on rankings, traffic and leads$md$),

  ('social-media-marketing', 'Social Media Marketing', 'marketing', 'share', 120, false, true,
   'Build an engaged audience with strategy, content creation and community management.',
   array['Social strategy', 'Content calendars', 'Creative production', 'Community management', 'Paid social'],
   $md$We help brands show up consistently on the platforms their customers use, with content that sparks conversation and drives enquiries.$md$),

  ('web-hosting', 'Web Hosting & Cloud', 'infrastructure', 'server', 130, true, true,
   'Fast, secure and monitored hosting for websites, applications and email.',
   array['Managed cloud hosting', 'SSL certificates', 'Daily backups', 'Uptime monitoring', 'Business email'],
   $md$Reliable infrastructure without the headache. We host and monitor your sites and applications so they stay fast and online.$md$),

  ('maintenance', 'Website & Application Maintenance', 'infrastructure', 'wrench', 140, false, true,
   'Keep your systems secure, updated and performing with proactive maintenance plans.',
   array['Security updates', 'Performance monitoring', 'Content updates', 'Bug fixes', 'Monthly health reports'],
   $md$Software needs care after launch. Our maintenance plans keep platforms patched, backed up and running smoothly.$md$),

  ('technical-support', 'Technical Support', 'infrastructure', 'lifebuoy', 150, false, true,
   'Responsive helpdesk and on-call support with clear service levels.',
   array['Helpdesk & ticketing', 'Remote support', 'Defined SLAs', 'Escalation management', 'User training'],
   $md$When something goes wrong, you need answers fast. Our support team works to agreed response times and keeps you informed until the issue is resolved.$md$);

insert into public.industries (slug, name, icon, sort_order, is_published, summary, body) values
  ('retail-ecommerce', 'Retail & E-commerce', 'cart', 10, true,
   'Online stores, omnichannel marketing and customer messaging for retailers.',
   $md$We help retailers sell across channels with e-commerce platforms, SMS promotions, loyalty communication and marketing that drives repeat purchases.$md$),
  ('healthcare', 'Healthcare', 'heart', 20, true,
   'Appointment reminders, patient portals and secure systems for healthcare providers.',
   $md$Clinics and healthcare providers use our SMS reminders, booking systems and secure web platforms to reduce no-shows and improve patient experience.$md$),
  ('education', 'Education', 'book', 30, true,
   'Learning platforms, parent communication and admissions marketing for schools and institutes.',
   $md$From admissions campaigns to parent SMS alerts and learning management systems, we help educators communicate and operate efficiently.$md$),
  ('finance', 'Banking & Finance', 'bank', 40, true,
   'Secure OTP delivery, customer onboarding and compliant digital platforms.',
   $md$Financial institutions rely on our OTP and transactional messaging, secure applications and CRM implementations.$md$),
  ('real-estate', 'Real Estate', 'building', 50, true,
   'Lead generation websites, CRM and campaigns for developers and agencies.',
   $md$We build property listing websites, run lead generation campaigns and set up CRMs so agents follow up on every enquiry.$md$),
  ('hospitality', 'Hospitality & Travel', 'plane', 60, true,
   'Booking engines, guest messaging and digital marketing for hotels and travel brands.',
   $md$Hotels, restaurants and travel companies use our booking integrations, guest messaging and social campaigns to fill capacity.$md$),
  ('logistics', 'Logistics & Transport', 'truck', 70, true,
   'Tracking notifications, fleet systems and ERP integration for logistics firms.',
   $md$Automated delivery notifications, operations dashboards and ERP integrations keep logistics businesses and their customers informed.$md$),
  ('government-ngo', 'Government & NGOs', 'landmark', 80, true,
   'Mass communication, citizen portals and accessible websites for public organisations.',
   $md$Public bodies and NGOs use our mass messaging, accessible websites and data platforms to reach and serve communities.$md$);

insert into public.portfolio_projects
  (slug, title, client_name, summary, body, technologies, service_id, industry_id, sort_order, is_featured, is_published)
values
  ('sample-retail-storefront', '[SAMPLE] Multi-brand online storefront', 'Sample retail client',
   'Replace with a real project: a headless e-commerce storefront with payment gateway and SMS order updates.',
   $md$**This is placeholder content.** Describe the client's goal, what you built, and the outcome.$md$,
   array['Next.js', 'Stripe', 'SMS API'],
   (select id from public.services where slug = 'ecommerce-development'),
   (select id from public.industries where slug = 'retail-ecommerce'), 10, true, false),
  ('sample-clinic-booking', '[SAMPLE] Clinic booking & reminder system', 'Sample healthcare client',
   'Replace with a real project: online booking with automated SMS appointment reminders.',
   $md$**This is placeholder content.** Describe the client's goal, what you built, and the outcome.$md$,
   array['React', 'PostgreSQL', 'SMS API'],
   (select id from public.services where slug = 'software-development'),
   (select id from public.industries where slug = 'healthcare'), 20, true, false),
  ('sample-property-portal', '[SAMPLE] Property listings portal with CRM', 'Sample real estate client',
   'Replace with a real project: listings website with lead capture routed into a CRM pipeline.',
   $md$**This is placeholder content.** Describe the client's goal, what you built, and the outcome.$md$,
   array['CMS', 'CRM', 'SEO'],
   (select id from public.services where slug = 'crm-solutions'),
   (select id from public.industries where slug = 'real-estate'), 30, true, false);

insert into public.case_studies
  (slug, title, client_name, summary, challenge, solution, results, metrics, service_id, industry_id, is_featured, is_published, published_at)
values
  ('sample-ecommerce-growth', '[SAMPLE] Growing online revenue for a retailer', 'Sample retail client',
   'Replace with a real case study and real, verifiable metrics.',
   'Describe the business problem the client faced.',
   'Describe the solution you designed and delivered.',
   'Describe the measurable outcome.',
   '[{"label": "Metric 1", "value": "—"}, {"label": "Metric 2", "value": "—"}, {"label": "Metric 3", "value": "—"}]',
   (select id from public.services where slug = 'ecommerce-development'),
   (select id from public.industries where slug = 'retail-ecommerce'), true, false, now()),
  ('sample-sms-reminders', '[SAMPLE] Reducing missed appointments with SMS', 'Sample healthcare client',
   'Replace with a real case study and real, verifiable metrics.',
   'Describe the business problem the client faced.',
   'Describe the solution you designed and delivered.',
   'Describe the measurable outcome.',
   '[{"label": "Metric 1", "value": "—"}, {"label": "Metric 2", "value": "—"}]',
   (select id from public.services where slug = 'bulk-sms'),
   (select id from public.industries where slug = 'healthcare'), true, false, now());

insert into public.testimonials (author_name, author_role, company, quote, rating, sort_order, is_featured, is_published) values
  ('[SAMPLE] Client name', 'Job title', 'Company', 'Replace with a real quote from a client who has agreed to be featured.', 5, 10, true, false),
  ('[SAMPLE] Client name', 'Job title', 'Company', 'Replace with a real quote from a client who has agreed to be featured.', 5, 20, true, false),
  ('[SAMPLE] Client name', 'Job title', 'Company', 'Replace with a real quote from a client who has agreed to be featured.', 5, 30, true, false);

insert into public.blog_posts (slug, title, excerpt, author_name, tags, is_published, published_at, body) values
  ('bulk-sms-best-practices', '7 bulk SMS best practices for higher engagement',
   'Timing, personalisation and compliance tips to make every message count.',
   'KeySol Team', array['SMS', 'Marketing'], true, now() - interval '14 days',
   $md$SMS is direct and personal, which is exactly why it needs care. Here are seven practices we recommend.

## 1. Get clear consent
Only message people who have opted in, and make opting out easy.

## 2. Identify yourself
Use a recognisable sender ID and name your brand in the message.

## 3. Keep it short
Lead with the value. One message, one action.

## 4. Personalise
Use the customer's name and relevant details where possible.

## 5. Time it well
Respect local hours and send when customers are likely to act.

## 6. Include a clear call to action
A short link, a reply keyword or a phone number.

## 7. Measure and iterate
Track delivery, clicks and conversions, then refine.$md$),

  ('website-checklist-lead-generation', 'The lead-generation website checklist',
   'Twelve things every business website needs to turn visitors into enquiries.',
   'KeySol Team', array['Web', 'Lead generation'], true, now() - interval '7 days',
   $md$A good-looking website is not enough. It needs to guide visitors toward contacting you.

## Foundations
- Fast load times on mobile
- Clear value proposition above the fold
- Obvious contact and quote buttons on every page

## Trust
- Real case studies and testimonials
- Clear service descriptions
- Visible contact details

## Measurement
- Analytics on every page
- Form submissions tracked as conversions
- Leads routed into a CRM, not an inbox$md$),

  ('choosing-crm-small-business', 'How to choose a CRM for a growing business',
   'What to look for, what to avoid, and how to roll it out without disrupting sales.',
   'KeySol Team', array['CRM', 'Business'], true, now() - interval '2 days',
   $md$A CRM is only valuable if your team uses it. Start with your sales process, not the feature list.

## Questions to ask
1. How do leads reach us today, and where do they get lost?
2. What stages does a deal move through?
3. Which tools (website, SMS, email, accounting) must it connect to?

## Rollout tips
- Start simple and add automation later
- Import clean data only
- Train the team and review the pipeline weekly$md$);

insert into public.pages (slug, title, is_published, seo_description, body) values
  ('about', 'About KeySol', true,
   'KeySol is a technology company providing digital communication, software development, e-commerce, digital marketing and hosting solutions.',
   $md$KeySol is a technology and digital-services company helping organisations communicate, sell and operate better.

## What we do
We bring together digital communication, software engineering, e-commerce, marketing and managed infrastructure, so our clients work with one accountable partner instead of many vendors.

## How we work
- **Partnership** – we take time to understand your business goals
- **Transparency** – clear scopes, timelines and reporting
- **Quality** – secure, maintainable solutions built to last
- **Support** – we stay with you after launch

## Our mission
To make modern technology accessible and effective for businesses of every size.

*Edit this page in Admin → Pages to add your story, team and milestones.*$md$),
  ('privacy', 'Privacy Policy', true, 'How KeySol collects, uses and protects your information.',
   $md$*This is a starting template. Have it reviewed by a legal professional before launch.*

## Information we collect
When you submit a contact or quote form we collect the details you provide, such as your name, email, phone number, company and message.

We also record anonymous page-view statistics (page path, referrer, campaign parameters and device type). We do not store IP addresses or use tracking cookies for these statistics.

## How we use it
To respond to your enquiry, provide quotations and improve our website and services.

## Your rights
You can ask us to access, correct or delete your personal information by contacting us.$md$),
  ('terms', 'Terms of Use', true, 'Terms governing use of the KeySol website.',
   $md$*This is a starting template. Have it reviewed by a legal professional before launch.*

By using this website you agree to use it lawfully and not to misuse forms or attempt to disrupt the service. Content is provided for general information and may change without notice.$md$);

# Capitalink Technologies website

Corporate website and lead-generation platform for Capitalink Technologies: digital communication & SMS, software / web / mobile
development, CMS, CRM, ERP, e-commerce, digital marketing, SEO, social media, hosting, maintenance and support.

**Stack:** Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · Motion · Supabase (Postgres, Auth,
Storage) · Vercel

**Live:** https://digitoranext.vercel.app

## Documentation

| Document | For |
| --- | --- |
| [Admin user guide](docs/admin-guide.md) | Staff managing leads, content, SEO and settings |
| [Deployment & operations](docs/deployment.md) | Environment variables, releases, migrations, go-live checklist, monitoring |
| [Technical architecture](docs/architecture.md) | Code layout, data model, security, lead flow, caching, analytics, integrations |
| [Test report](docs/testing.md) | Lighthouse scores, acceptance criteria, security checks |

## What's included

| Area | Details |
| --- | --- |
| Public site | Home, About Us, Services (27 service and sub-service pages), Solutions (by role and organisation), Industries, Portfolio, Case Studies, Testimonials, Blog (search, categories, tags, related articles, sharing), FAQs, Support, Contact Us, Request a Quote, Book a Consultation, Privacy, Terms |
| Lead generation | Quote requests, contact form, service-page enquiries, consultation bookings, callback requests, newsletter sign-up, floating WhatsApp/call/email buttons. All capture UTM, referrer and landing page; spam traps and per-IP throttle |
| CRM | `/admin/leads`: pipeline (new → contacted → qualified → consultation → proposal → negotiation → won → onboarding), assignment, estimated value, activity notes, search, filters, CSV export |
| CMS | `/admin/content/*`: every content type including service and blog categories and per-page SEO settings, with markdown preview, image uploads and a media library with alt text |
| Admin | Dashboard (visitors, conversion rate, CTA/WhatsApp/phone/email clicks, lead sources, form submissions, service views, pipeline), site settings, role-based access |
| SEO | Metadata, canonical URLs, Open Graph, JSON-LD (Organization/ProfessionalService, Service, BlogPosting, FAQPage, BreadcrumbList), `sitemap.xml`, `robots.txt`, optimised images, admin-editable overrides |
| Analytics | Built-in cookieless visitors, page views and click events (no IPs stored) plus optional Google Analytics 4 |
| Security | Row Level Security on every table, roles in `app_metadata`, server-side re-authorisation in every admin action, security headers |
| Integrations | WhatsApp, Google Analytics 4, Search Console/Bing verification, Google Maps, calendar booking link, lead webhook (Slack, Teams, Zapier, Make, n8n) |

## Setup

```bash
npm install
cp .env.example .env      # fill in the values (see comments in the file)
npm run db:migrate        # applies supabase/migrations to DATABASE_URL
npm run dev               # http://localhost:3000
```

### Staff accounts and roles

1. Create the account in the Supabase dashboard: **Authentication → Users → Add user**.
2. Make the first person a Super Admin from the command line:

   ```bash
   npm run admin:grant -- person@company.com super_admin
   ```

3. After that, administrators assign roles in **Admin → Staff & roles**. Changes apply at the person's next sign-in.

| Role | Access |
| --- | --- |
| Super Admin | Everything, including granting Administrator and Super Admin |
| Administrator | Everything except managing administrators |
| Sales Manager | All leads, assign leads to the team, export |
| Sales Representative | Leads assigned to them plus unassigned leads they can claim |
| Marketing Manager | Marketing content (services, solutions, portfolio, case studies, testimonials, blog, FAQs), media, analytics, read-only leads |
| Content Manager | All content, pages, team profiles, media, site settings |
| Support Staff | Contact enquiries and callback requests |
| Customer / Visitor | Public site and forms only |

The same rules are enforced by Row Level Security in the database, not just hidden in the UI.

**Recommended:** turn off public sign-ups in Supabase (**Authentication → Sign In / Providers → Allow new users to sign up**).

## Before launch

- Replace the **[SAMPLE]** portfolio projects, case studies and testimonials (seeded as unpublished drafts) with real,
  client-approved content, then publish them.
- Update company details, contact info, social links and homepage stats in **Admin → Settings**.
- Have the Privacy Policy and Terms reviewed by a legal professional.
- Set `NEXT_PUBLIC_SITE_URL` to the production domain, `ANALYTICS_SALT` to a random secret, and `LEAD_WEBHOOK_URL` for
  lead notifications. Add the GA4 ID and Search Console token in **Admin → Settings → Integrations & SEO**.
- Put a WAF / edge rate limit in front of the site. The built-in form throttle is per server instance only.

See the full [go-live checklist](docs/deployment.md#custom-domain--go-live-checklist).

## Handover status

Built and deployed. Open items:

1. **Six database migrations are not yet applied to production** (`20261013063000` to `20261013110000`). Run
   `npm run db:migrate`. Until then the site uses fallbacks, and these stay inactive: Marketing/Hosting service
   content, Manufacturing and Corporate industries, new case study and testimonial fields, blog categories,
   consultation leads as their own type, the consultation/negotiation/onboarding stages, unique visitors and click
   analytics, editable service categories, media alt text and SEO settings.
2. **Lead notifications**: set `LEAD_WEBHOOK_URL`, or add an email provider.
3. **Client content**: logo, company details, real portfolio, case studies and testimonials, legal review.
4. **Not built (need a provider)**: email sending, SMS gateway, payment gateway. Phase 2 (advanced CRM, customer
   portal, marketing automation) and Phase 3 (AI features) are future work.

## Project layout

```
src/app/(site)/       public pages
src/app/admin/        admin panel (login, dashboard, leads, content, media, settings) and server actions
src/app/api/track/    first-party analytics endpoint (page views, click events)
src/lib/content.ts    cached public data access (tagged; admin saves refresh it instantly)
src/lib/auth.ts       staff session + role checks
src/lib/cms.ts        content-type definitions driving the admin editor
supabase/migrations/  schema, RLS policies, seed content, dashboard function
scripts/              migration runner and role management
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` / `typecheck` | Quality checks |
| `npm run db:migrate` | Apply pending migrations (`-- --list` to show status) |
| `npm run admin:grant -- <email> <role>` | Assign a staff role |

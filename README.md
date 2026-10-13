# KeySol website

Corporate website and lead-generation platform for KeySol: digital communication & SMS, software / web / mobile
development, CMS, CRM, ERP, e-commerce, digital marketing, SEO, social media, hosting, maintenance and support.

**Stack:** Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · Supabase (Postgres, Auth, Storage)

## What's included

| Area | Details |
| --- | --- |
| Public site | Home, About Us, Services (27 service and sub-service pages), Solutions (by role and organisation), Industries, Portfolio, Case Studies, Testimonials, Blog, FAQs, Support, Contact Us, Request a Quote, Privacy, Terms |
| Lead generation | Quote requests, contact form, service-page enquiries, callback requests, newsletter sign-up, floating WhatsApp/call buttons. All capture UTM, referrer and landing page, organisation type and size; spam traps and per-IP throttle |
| CRM | `/admin/leads`: pipeline statuses, assignment to sales reps, estimated value, activity notes, search and filters by status/type, CSV export |
| CMS | `/admin/content/*`: create, edit, publish and delete every content type, with markdown preview and image uploads |
| Admin | Dashboard (traffic, leads, conversion, pipeline, top pages and sources), site settings, media library, role-based access |
| SEO | Per-page metadata and canonical URLs, Open Graph image, JSON-LD (Organization, Service, BlogPosting), `sitemap.xml`, `robots.txt` |
| Analytics | Built-in cookieless page views (no IPs stored) plus optional Google Analytics 4 with a `generate_lead` conversion event |
| Security | Row Level Security on every table, roles in `app_metadata`, server-side re-authorisation in every admin action, security headers |
| Integrations | Lead webhook (Slack, Teams, Zapier, Make, n8n), GA4, Supabase Storage |

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
- Set `NEXT_PUBLIC_SITE_URL` to the production domain, and optionally `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `LEAD_WEBHOOK_URL`.
- Put a WAF / edge rate limit in front of the site. The built-in form throttle is per server instance only.

## Project layout

```
src/app/(site)/       public pages
src/app/admin/        admin panel (login, dashboard, leads, content, media, settings) and server actions
src/app/api/track/    first-party page-view endpoint
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

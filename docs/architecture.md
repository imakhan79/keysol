# Technical architecture

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, Cache Components / partial prerendering), React 19, TypeScript |
| Styling & motion | Tailwind CSS 4 with design tokens in `src/app/globals.css`; Motion (Framer Motion) for scroll entrances |
| Data, auth, files | Supabase: Postgres with Row Level Security, Auth (staff only), Storage bucket `media` |
| Hosting | Vercel, region `sin1` |
| Validation | Zod on every form and API input |

## Code layout

```
src/app/(site)/               public pages (home, about, services, industries, solutions, portfolio,
                              case studies, testimonials, blog, FAQs, support, contact, quote, book-consultation)
src/app/admin/                admin panel: login, dashboard, leads, generic content editor, media, settings, staff
src/app/admin/actions.ts      server actions for all admin writes (each re-checks the staff role)
src/app/actions/leads.ts      public form submissions (validation, spam checks, insert, webhook)
src/app/api/track/            first-party analytics endpoint (page views and click events)
src/app/sitemap.ts, robots.ts SEO files
src/components/site/          public UI (header, footer, cards, forms, contact dock)
src/components/motion.tsx     scroll entrance animations
src/components/analytics.tsx  page-view and click tracking, optional GA4
src/lib/content.ts            cached public data access, tagged per table
src/lib/cms.ts                declarative content-type definitions that drive the admin editor
src/lib/seo.ts                metadata helper and admin SEO overrides
src/lib/roles.ts              staff roles and permission matrix (mirrors the RLS policies)
supabase/migrations/          schema, RLS, seed content, dashboard function
scripts/                      migration runner, role grant script
```

## Data model

| Table | Purpose |
| --- | --- |
| `services`, `service_categories` | Services and sub-services (`parent_id`), grouped by category key |
| `industries`, `solutions` | Industry pages; audience pages (personas and organisation segments) |
| `portfolio_projects`, `case_studies`, `testimonials` | Proof content; case studies link a testimonial, service and industry |
| `blog_posts`, `blog_categories` | Articles with tags, author, category, cover image and SEO fields |
| `pages`, `faqs`, `team_members` | About/Privacy/Terms, FAQs, team profiles |
| `site_settings` | Key/value JSON: `company`, `social`, `home`, `about`, `quote_options`, `integrations` |
| `seo_settings` | Per-path SEO overrides for fixed pages (title, description, image, noindex) |
| `media` | Library record for every admin upload (URL, size, alt text) |
| `leads`, `lead_notes` | CRM: every form submission, pipeline status, assignment, value, activity notes |
| `page_views`, `analytics_events` | First-party analytics: views (with daily visitor hash) and click events |

Every content table has `is_published`; only published rows are visible to the public. Users and roles live in
Supabase Auth (`auth.users`, role in `app_metadata.role`).

## Security model

- **Row Level Security on every table.** Visitors can read published content and insert leads, page views and events.
  They can't read leads or analytics, or change content. Verified by tests at handover.
- **Staff roles** (`super_admin`, `admin`, `sales_manager`, `sales_rep`, `marketing_manager`, `content_manager`,
  `support_staff`) are enforced twice: in RLS policies and in `requireStaff()` inside every admin page and action.
- Lead inserts from the public can't set status, assignment or value (RLS `with check`).
- Spam protection on forms: honeypot field, minimum fill time, per-IP throttle.
- Security headers (HSTS, `X-Frame-Options: DENY`, `nosniff`, referrer and permissions policies) in `next.config.ts`.
- Only the public anon key reaches the browser; the database connection string is used by local scripts only.

## Lead flow

Visitor → form (contact, quote, service enquiry, consultation, callback, newsletter) → `submitLead` validates and checks
for spam → row in `leads` with UTM, referrer, landing page → optional webhook notification → appears in
**Admin → Leads** → staff move it through the pipeline:

`new → contacted → qualified → consultation → proposal → negotiation → won → onboarding` (or `lost` / `spam`).

### Lead notifications

`LEAD_WEBHOOK_URL` receives `{ text, lead }` for every lead except newsletter sign-ups: `text` renders in Slack or Teams,
and `lead` is the full record for Zapier, Make or n8n (which can also send email). Direct email (for example via Resend)
is not built yet; it would be added in `notifyWebhook` in `src/app/actions/leads.ts`.

## Caching & rendering

Pages are statically pre-rendered with dynamic holes streamed in (partial prerendering). Data getters in
`src/lib/content.ts` use `"use cache"` with `cacheTag(<table>)`; admin saves call `updateTag(<table>)`. Pages that read
search parameters (blog search, quote preselection) render that part on request inside `<Suspense>`.

## Analytics

`src/components/analytics.tsx` sends a beacon for each page view and for clicks on calls to action (links to quote,
consultation or contact), WhatsApp, phone and email links. `/api/track` drops bots and admin paths, then records the
event. Unique visitors use a SHA-256 hash of IP + user agent + a daily-rotating salt: countable per day, not trackable
across days, no IP stored. The dashboard aggregates in the database (`dashboard_summary()`). GA4 receives the same
events when a measurement ID is configured.

## SEO

- Metadata, canonical URLs and Open Graph per page (`pageMetadata`). CMS items have their own SEO fields, and fixed
  pages can be overridden in **Admin → SEO settings**.
- Structured data: Organization + ProfessionalService (local business), Service, BlogPosting, FAQPage and BreadcrumbList.
- `sitemap.xml` from published content (noindex pages excluded) and `robots.txt` (admin disallowed).
- Admin-uploaded images are served through the Next.js image optimiser (`src/components/cms-image.tsx`).

## Integrations

| Integration | Status | Where |
| --- | --- | --- |
| WhatsApp | Click-to-chat button and contact link | Admin → Settings → Company → WhatsApp number |
| Google Analytics 4 | Page views and conversion events | Admin → Settings → Integrations & SEO |
| Google Search Console / Bing | Verification meta tags, sitemap | Admin → Settings → Integrations & SEO |
| Google Maps | Embedded map on contact page | Admin → Settings → Integrations & SEO |
| Calendar | Booking-page link on Book a consultation; "Add to Google Calendar" on consultation leads | Settings / lead page |
| CRM | Built in; external CRMs via the lead webhook | `LEAD_WEBHOOK_URL` |
| Email, SMS gateway, payments | Not built; need a provider and credentials | |

## Accessibility & performance

Lighthouse (mobile) at handover: Performance 94–97, Accessibility 96–100, Best Practices 100, SEO 100. Reduced-motion
preferences are respected, there is a skip link, form fields are labelled, and teal text shades meet WCAG AA on white.

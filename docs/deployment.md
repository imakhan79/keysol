# Deployment & operations

How the site is hosted, configured, released and maintained.

## Environments

| | Where | Notes |
| --- | --- | --- |
| Production site | Vercel project `digitoranext`, region `sin1` (Singapore) | https://digitoranext.vercel.app until a custom domain is added |
| Database, auth, file storage | Supabase project `zdmcemdsngcnnrgnwjnv` | Postgres with Row Level Security; `media` storage bucket |
| Source | GitHub `imakhan79/keysol`, branch `main` | |
| Local | `npm run dev` → http://localhost:3000 | Uses the same Supabase project unless `.env` points elsewhere |

## Environment variables

Set in **Vercel → Project → Settings → Environment Variables** (Production) and in a local `.env` (copy `.env.example`).

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key. Never use the `service_role` key here |
| `NEXT_PUBLIC_SITE_URL` | Yes (production) | Canonical domain, e.g. `https://www.digitoranext.com`. Used for canonical URLs, sitemap, Open Graph and structured data |
| `DATABASE_URL` | Local only | Postgres connection string for `npm run db:migrate` and `npm run admin:grant`. Not needed on Vercel |
| `LEAD_WEBHOOK_URL` | Optional | Receives a JSON post for every new lead (Slack, Teams, Zapier, Make, n8n) |
| `ANALYTICS_SALT` | Recommended | Random secret used to hash visitors for unique-visitor counts. Falls back to the anon key |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional | GA4 ID. Can instead be set in **Admin → Settings → Integrations & SEO** |

`NEXT_PUBLIC_*` values are baked into the build: redeploy after changing them.

## Releasing a change

1. Make the change on `main` (or merge a branch) and push to GitHub.
2. Apply any new database migrations **before** the code that needs them goes live (next section).
3. Deploy: `vercel deploy --prod` from the project folder (the folder is linked to the `digitoranext` project).
4. Smoke-test: home, a service page, `/blog`, `/quote` (submit a test request), `/admin/login`.

### Rolling back

In **Vercel → Deployments**, open the last good deployment and choose **Promote to Production**. Database migrations
are not rolled back automatically; write a new migration that reverses the change if needed.

## Database migrations

Schema changes live in `supabase/migrations/` as timestamped SQL files and are applied in order. The history is kept in
`supabase_migrations.schema_migrations`, shared with the Supabase CLI.

**Check what is pending**

```bash
npm run db:migrate -- --list
```

**Apply pending migrations** (each file runs in its own transaction and is recorded on success):

```bash
npm run db:migrate
```

This uses `DATABASE_URL` from `.env`. Alternatives:

- Supabase CLI: `npx supabase db push --db-url "<connection string>"`.
- Supabase dashboard **SQL Editor**: paste the migration file(s) and run, then record each version in
  `supabase_migrations.schema_migrations` so the tools above don't re-run them.

After applying migrations, redeploy (or save any item in the admin) so cached pages pick up the new data.

> **Status at handover:** six migrations from `20261013063000` to `20261013110000` were written but not yet applied
> to production. The site runs without them using built-in fallbacks; run `npm run db:migrate` to activate the
> features listed in the [handover notes](../README.md#handover-status).

### Writing a migration

- New file: `supabase/migrations/<YYYYMMDDHHMMSS>_<what_it_does>.sql`.
- Enable Row Level Security on every new table and add explicit grants and policies. Follow the role arrays used in
  existing migrations.
- Keep code tolerant of the column or table not existing yet if code may deploy first, or apply the migration first.

## Caching

Public pages are pre-rendered and cached. Content reads in `src/lib/content.ts` are tagged by table name, and every admin
save calls `updateTag(<table>)`, so edits made in the admin appear immediately. Changes made directly in the database
(SQL Editor, scripts) bypass this: redeploy or re-save an item to refresh.

## Staff accounts

1. **Supabase → Authentication → Users → Add user** (email and password).
2. First Super Admin: `npm run admin:grant -- person@company.com super_admin`.
3. Afterwards, assign roles in **Admin → Staff & roles**. Changes apply at the person's next sign-in.
4. Keep public sign-ups disabled: **Authentication → Sign In / Providers → Allow new users to sign up** = off.

## Custom domain & go-live checklist

- [ ] Add the domain in **Vercel → Project → Settings → Domains** and set the DNS records it shows.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the domain and redeploy.
- [ ] Add the domain to **Supabase → Authentication → URL Configuration** (Site URL / redirect URLs).
- [ ] Apply all pending migrations (`npm run db:migrate -- --list` shows none pending).
- [ ] **Admin → Settings**: real company name, email, phone, WhatsApp, address, hours, social links, homepage stats.
- [ ] Replace or unpublish the `[SAMPLE]` portfolio projects, case studies and testimonials.
- [ ] Logo: replace the placeholder "D" mark in `src/components/site/header.tsx` (`Logo`) and `src/app/opengraph-image.tsx`.
- [ ] Legal review of Privacy Policy and Terms (**Admin → Content → Pages**).
- [ ] **Google Search Console**: add the property, paste the HTML-tag token in **Admin → Settings → Integrations & SEO**,
      verify, then submit `https://<domain>/sitemap.xml`.
- [ ] **Google Analytics 4**: create a web stream and paste the `G-…` ID in the same settings section.
- [ ] Lead notifications: set `LEAD_WEBHOOK_URL` (or add an email provider; see [architecture](architecture.md#lead-notifications)).
- [ ] Set `ANALYTICS_SALT` to a long random string.
- [ ] Rotate the Supabase database password if it has been shared, and update `DATABASE_URL` wherever it is used.
- [ ] Put a WAF or edge rate limit in front of the site (the built-in form throttle is per server instance).

## Monitoring

- **Admin → Dashboard**: visitors, page views, leads, conversion rate, clicks, lead sources and pipeline.
- **Vercel → Observability / Logs**: server errors, including failed lead inserts (`lead insert failed`).
- **Supabase → Logs**: database and API errors.
- Search Console coverage and Core Web Vitals once the domain is verified.

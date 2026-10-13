# Test report

Tests run against production (https://digitoranext.vercel.app) on 13 October 2026, before the pending database
migrations were applied.

## Lighthouse (mobile profile)

| Page | Performance | Accessibility | Best Practices | SEO |
| --- | --- | --- | --- | --- |
| `/` | 95 | 96 | 100 | 100 |
| `/services/crm-solutions` | 95 | 96 | 100 | 100 |
| `/blog` | 94 | 100 | 100 | 100 |
| `/quote` | 97 | 96 | 100 | 100 |

Target was 90+ in every category. Contrast issues found during the run (footer bottom bar, blog sidebar headings) and
a heading-order issue on `/blog` were fixed, and `/blog` was re-tested at 100 for accessibility.

## Acceptance criteria

| Criterion | Result | Evidence |
| --- | --- | --- |
| All major pages functional | Pass | 16 main pages return 200 with no JavaScript errors (headless Chrome) |
| Works on desktop and mobile | Pass | No horizontal overflow at 390px or 1440px on all 16 pages |
| Service pages accessible | Pass | All 27 service URLs in the sitemap return 200 |
| Forms work; quote requests create leads | Pass | Quote submitted through the live form; success message returned after the insert |
| Admin receives notifications | **Open** | Needs `LEAD_WEBHOOK_URL` or an email provider |
| Content is manageable | Pass | Generic CMS editor for every content type |
| Blog and case studies work | Pass | Listing, search, filters, detail pages, related articles |
| SEO metadata manageable | Partial | Per-item SEO fields work; fixed-page overrides need the pending migrations |
| Security testing | Pass | See below |
| Performance testing | Pass | Lighthouse above |
| No broken links | Pass | 61 sitemap pages, 98 internal links, 61 external links: 0 broken, 0 redirects |

## Security checks

| Check | Result |
| --- | --- |
| HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options`, Referrer-Policy, Permissions-Policy | Present |
| `/admin`, `/admin/leads`, `/admin/settings` without a session | 307 redirect to `/admin/login` |
| Anonymous read of `leads`, `lead_notes`, `page_views` via the Supabase API | Denied (42501) |
| Anonymous update of `services` | Denied |
| Anonymous lead insert with `status = 'won'` | Rejected by row-level security |

## Not covered

- Browsers other than Chrome (check Safari, Firefox and Edge manually).
- Lighthouse desktop profile (mobile is the stricter of the two).
- Admin flows after the pending migrations (pipeline stages, categories, SEO settings, media alt text, click analytics).
- User acceptance testing by the client.

## Re-running

- Lighthouse: `npx lighthouse https://<domain>/ --only-categories=performance,accessibility,best-practices,seo`
- Quality checks: `npm run lint && npm run typecheck && npm run build`

# Admin user guide

For staff who manage leads and website content. Sign in at **`/admin/login`** with the email and password an
administrator created for you. What you see depends on your role (see [Roles](#roles)).

## Dashboard

**Admin → Dashboard** summarises the last 30 days:

- **Visitors, leads, conversion rate, open pipeline.** Conversion rate = enquiries (excluding newsletter sign-ups) ÷
  unique visitors.
- **Clicks**: call-to-action buttons (quote, consultation, contact), WhatsApp, phone and email links.
- **Traffic and leads chart**, **pipeline** by status, **top pages**, **traffic sources**, **devices**.
- **Lead sources**, **form submissions by type**, **service page views** and **top CTAs**.
- **Recent leads** with a link to each.

## Leads (CRM)

**Admin → Leads** lists every enquiry from the website: quote requests, contact forms, service enquiries, consultation
bookings, callback requests and newsletter sign-ups.

- **Filter** by status or type and **search** by name, email or company. **Export CSV** (managers) downloads the
  current filtered list.
- Open a lead to see the message, the services requested, budget, timeline, industry, preferred consultation slot and
  how the visitor found you (campaign, referrer, landing page).
- **Manage lead** (right-hand panel): change the status, set an estimated value, and assign it to a team member.
  Sales representatives can claim unassigned leads.
- **Activity notes**: log every call, email and next step. Notes show who wrote them and when.
- **Consultation bookings** have an **Add to Google Calendar** button prefilled with the visitor's details.

### Pipeline stages

| Stage | Use it when |
| --- | --- |
| New | Just arrived; nobody has responded yet |
| Contacted | You've replied or called |
| Qualified | Real need, budget and timeline confirmed |
| Consultation | A discovery call or meeting is booked or done |
| Proposal sent | Quote or proposal delivered |
| Negotiation | Discussing scope, price or terms |
| Won | Signed |
| Onboarding | Project kick-off and customer onboarding in progress |
| Lost | Didn't go ahead (add a note explaining why) |
| Spam | Junk submission |

Open pipeline on the dashboard counts New through Negotiation.

## Content (CMS)

Everything public is edited under **Admin → Content**. Each section lists items with **New**, **Edit** and **View on site**.

- **Published** controls visibility. Unpublished items are drafts that only staff can see.
- **URL slug** is generated from the title if left empty. Changing it changes the page address.
- **Markdown** fields have a **Preview** toggle. Use `## Heading`, `**bold**`, `- list`, `[link](/services/seo)`.
- **Images**: paste a URL or click **Upload image**. Uploads go to the media library automatically.
- **SEO title / description** on each item control how it appears in Google. Aim for under 60 and 120–160 characters.
- **Sort order**: lower numbers appear first. **Feature on homepage** puts an item in homepage sections.
- Saving publishes changes to the live site immediately.

| Section | Notes |
| --- | --- |
| Services | Choose a **category** and optionally a **parent service** (sub-services appear on the parent's page). Key features and technologies are one per line |
| Service categories | Groups shown in menus and on the services page. Changing a category's key updates its services |
| Solutions | Pages for audiences (e.g. IT Managers, SMEs) with recommended services |
| Industries | Sector pages |
| Portfolio | Projects with client, technologies, cover image and live URL |
| Case studies | Client, industry, key metrics (`Label \| Value` per line), challenge, solution, implementation, results, technology, screenshots and a linked testimonial |
| Testimonials | Name, job title, company, photo, rating and industry. **Only publish quotes the client approved** |
| Blog | Author, publish date, category, tags, cover image, article body |
| Blog categories | Categories readers can filter by on `/blog` |
| FAQs | Grouped by category. **Show on homepage** adds to the homepage FAQ |
| Pages | About, Privacy Policy and Terms |
| Team profiles | People shown on the About page |
| SEO settings | Per-page overrides for fixed pages (see below) |

### Media library

**Admin → Media**: upload images (PNG, JPG, WebP, GIF, AVIF or SVG, max 10 MB), **Copy URL** to use them anywhere, add
**alt text** (describe the image for screen readers and search engines), or delete unused files.

### SEO settings

Services, posts and other content have their own SEO fields. For fixed pages, such as `/`, `/about`, `/services`,
`/contact`, `/quote`, `/blog` and `/industries`, add a row in **Admin → Content → SEO settings** with the page path and
any of:

- **Meta title** and **meta description** (what Google shows),
- **Social sharing image** (1200×630, used when the link is shared),
- **Hide from search engines** (also removes the page from the sitemap).

## Site settings

**Admin → Settings** (Content Managers and Administrators):

- **Integrations & SEO**: Google Analytics 4 ID, Google Search Console and Bing verification, calendar booking link
  (shown on Book a consultation), and the Google Map on the contact page.
- **Company**: name, tagline, description (default meta description), email, phone, address, hours and WhatsApp number.
  The floating WhatsApp, call and email buttons appear only when these are filled in with real values.
- **Social profiles**: links shown in the footer.
- **Homepage**: hero text, buttons, audience line, stats bar, introduction and "why choose us".
- **About page**: mission, vision, values, milestones, achievements and certifications.
- **Quote form options**: budget ranges, timelines, organisation types and company sizes offered in the quote form.

## Staff & roles

**Admin → Staff & roles** (Administrators). New accounts are created in Supabase (see the
[deployment guide](deployment.md#staff-accounts)); assign their role here. Role changes apply at next sign-in.

### Roles

| Role | Can |
| --- | --- |
| Super Admin | Everything, including managing administrators |
| Administrator | Everything except managing administrators |
| Sales Manager | All leads, assign to team, export |
| Sales Representative | Their own leads and unassigned leads they claim |
| Marketing Manager | Services, solutions, industries, portfolio, case studies, testimonials, blog, FAQs, media, SEO settings, analytics; read-only leads |
| Content Manager | All content including pages, team profiles and site settings |
| Support Staff | Contact enquiries and callback requests |

## Good practice

- Respond to new leads within one business day (the site promises this) and keep statuses current. The dashboard and
  conversion figures depend on it.
- Use real, verifiable numbers in stats, metrics and case studies.
- Add alt text to images and fill in SEO fields when publishing.
- Delete test submissions (for example "UAT Test - please delete") from Leads.

-- Digital Marketing (requirements section 17) and Hosting & Maintenance (section 18) capabilities.

update public.services
set short_description = 'SEO, social, content and paid campaigns with lead generation, campaign management and analytics that turn budget into measurable growth.',
    features = array[
      'Search engine optimisation', 'Social media marketing', 'Content marketing', 'Paid advertising (search, social & display)',
      'Lead generation', 'Campaign management', 'Landing pages', 'Conversion tracking & analytics'
    ],
    body = $md$We plan, launch and optimise campaigns with one goal: measurable business results. Every campaign is tracked from click to lead.

## What we deliver
- **SEO:** technical, on-page and local optimisation for lasting organic visibility – see [SEO](/services/seo)
- **Social media marketing:** strategy, content and community management – see [social media marketing](/services/social-media-marketing)
- **Content marketing:** blogs, guides, case studies, email newsletters and video that attract and educate buyers
- **Paid advertising:** Google, Meta, LinkedIn and display campaigns with clear budgets and targets
- **Lead generation:** landing pages, lead magnets, forms and [SMS](/services/bulk-sms) follow-up that fill your pipeline
- **Campaign management:** planning, creative, A/B testing, budget pacing and ongoing optimisation
- **Analytics:** conversion tracking, attribution and dashboards – see [marketing analytics](/services/marketing-analytics)

## Connected to sales
Leads flow straight into your [CRM](/services/crm-solutions) so your team can follow up fast and every campaign is measured against revenue, not just clicks.$md$
where slug = 'digital-marketing';

update public.services
set short_description = 'Fast, secure and monitored hosting with domain management, SSL, backups and security and performance monitoring.',
    features = array[
      'Managed web & cloud hosting', 'Domain registration & DNS management', 'SSL certificates', 'Automated backups',
      'Security monitoring', 'Uptime & performance monitoring', 'Business email'
    ],
    body = $md$Reliable infrastructure without the headache. We host and monitor your sites and applications so they stay fast, secure and online.

## Hosting capabilities
- **Web hosting:** managed cloud hosting for websites, web applications and online stores
- **Domain management:** registration, renewals, transfers and DNS configuration
- **SSL:** certificates installed and renewed automatically so every page is served over HTTPS
- **Backups:** automated daily backups with off-site copies and tested restores
- **Security monitoring:** firewall, malware scanning, intrusion alerts and patching
- **Performance monitoring:** uptime checks, page-speed tracking and resource alerts
- **Business email:** professional mailboxes on your own domain

## Looked after end to end
Combine hosting with [website maintenance](/services/maintenance) and [technical support](/services/technical-support) for one team that keeps everything running.$md$
where slug = 'web-hosting';

update public.services
set features = array[
      'Security updates & patching', 'Backup checks & restores', 'Security monitoring', 'Performance monitoring',
      'Content updates', 'Bug fixes', 'Monthly health reports'
    ],
    body = $md$Software needs care after launch. Our maintenance plans keep platforms patched, backed up and running smoothly.

## Included in every plan
- **Updates:** core, plugin, framework and dependency updates tested before release
- **Backups:** regular backup verification and restores when you need them
- **Security monitoring:** vulnerability scanning and fast response to threats
- **Performance monitoring:** speed and uptime tracking with proactive fixes
- **Content & fixes:** small content changes and bug fixes handled by our team
- **Reporting:** a monthly health report covering updates, uptime and recommendations

Need help beyond scheduled maintenance? Our [technical support](/services/technical-support) team is on hand with agreed response times.$md$
where slug = 'maintenance';

-- Sub-services: a service can sit under a parent service (shown on the parent's page
-- and grouped under it in listings).
-- Adds the Digital Communication module (SMS Solutions -> Branded SMS, Transactional SMS,
-- SMS API) and the Software Solutions module.

alter table public.services
  add column parent_id uuid references public.services (id) on delete set null,
  add constraint services_not_own_parent check (parent_id is null or parent_id <> id);

create index services_parent_idx on public.services (parent_id);

-- ---------------------------------------------------------------------------
-- Digital Communication: SMS Solutions
-- ---------------------------------------------------------------------------

update public.services
set slug = 'sms-solutions',
    title = 'SMS Solutions',
    short_description = 'Branded campaigns, transactional alerts and an SMS API to reach customers instantly on any phone.',
    features = array['Branded (sender ID) SMS campaigns', 'Transactional SMS and OTP', 'SMS API for your software', 'Delivery reports & analytics', 'Templates and scheduling'],
    body = $md$SMS reaches customers on any phone, usually within seconds, and is read far more often than email. We provide three ways to use it, depending on what you need to send.

## Choose the right SMS solution
- **[Branded SMS](/services/branded-sms)** for marketing and announcements sent under your company name
- **[Transactional SMS](/services/transactional-sms)** for OTPs, confirmations, reminders and alerts triggered by your systems
- **[SMS API](/services/sms-api)** to send and receive messages directly from your website, app, CRM or ERP

## Included with every plan
- Sender ID registration guidance and compliance support
- Delivery reports for every message
- Usage analytics and reporting$md$,
    seo_title = 'SMS Solutions: Branded SMS, Transactional SMS & SMS API',
    seo_description = 'Branded SMS campaigns, transactional SMS and OTP, and an SMS API for your software, with delivery reports and analytics.'
where slug = 'bulk-sms';

update public.solutions set service_slugs = array_replace(service_slugs, 'bulk-sms', 'sms-solutions');

insert into public.services
  (slug, title, category, icon, sort_order, is_published, parent_id, short_description, features, technologies, body)
values
  ('branded-sms', 'Branded SMS', 'communication', 'message', 11, true,
   (select id from public.services where slug = 'sms-solutions'),
   'Send marketing campaigns and announcements under your own sender ID, with lists, templates, scheduling and reporting.',
   array['Branded sender ID', 'Message creation & personalisation', 'Recipient lists & groups', 'Campaign management', 'Scheduling', 'Reusable templates', 'Delivery reports', 'Campaign analytics'],
   array['Web portal', 'CSV / Excel import', 'Unicode & long messages'],
   $md$Branded SMS puts your company name in the sender field, so customers recognise you before they open the message.

## Features
- **Sender ID:** messages appear from your brand name rather than a random number
- **Message creation:** compose messages with personalisation fields such as the customer's name
- **Recipient lists:** upload, segment and manage contact lists and groups
- **Campaigns:** send to one list or many and track each campaign separately
- **Scheduling:** queue messages for the best time to reach your audience
- **Templates:** save frequently used messages for fast, consistent sending
- **Delivery reports:** see which messages were delivered, pending or failed
- **Analytics:** compare campaigns and measure engagement over time

## Common uses
Promotions and offers, event invitations, product launches, seasonal campaigns, customer announcements and service updates.$md$),

  ('transactional-sms', 'Transactional SMS', 'communication', 'bell', 12, true,
   (select id from public.services where slug = 'sms-solutions'),
   'Time-critical OTPs, confirmations, reminders and alerts sent automatically by your systems.',
   array['One-time passwords (OTP)', 'Order confirmations', 'Payment notifications', 'Appointment reminders', 'Delivery notifications', 'Account notifications'],
   array['REST API', 'Webhooks', 'Delivery receipts'],
   $md$Transactional messages are triggered by something a customer does or needs to know. They have to arrive quickly and reliably.

## Message types
- **OTP (one-time passwords):** sign-in verification and transaction approval
- **Order confirmations:** reassure customers the moment they buy
- **Payment notifications:** receipts, due dates and failed-payment alerts
- **Appointment reminders:** reduce no-shows for clinics, salons and service businesses
- **Delivery notifications:** dispatch, out-for-delivery and delivered updates
- **Account notifications:** password changes, security alerts and account activity

## How it works
Your website, app or business system triggers each message through our [SMS API](/services/sms-api) or a pre-built integration, and every message is tracked with a delivery report.$md$),

  ('sms-api', 'SMS API', 'communication', 'code', 13, true,
   (select id from public.services where slug = 'sms-solutions'),
   'Integrate SMS into your website, app, CRM or ERP with a developer-friendly API.',
   array['REST API with authentication keys', 'Send single and bulk messages', 'Delivery receipts via webhooks', 'Inbound / two-way messaging', 'Integration support', 'Documentation and test credentials'],
   array['REST / JSON', 'HTTPS', 'Webhooks', 'SMPP (on request)'],
   $md$The SMS API lets external software systems send and receive messages without anyone logging in to a portal.

## What you can integrate
- E-commerce platforms: order and delivery updates
- CRM and ERP systems: customer notifications and workflows
- Banking and fintech apps: OTP and transaction alerts
- Booking and healthcare systems: appointment reminders
- Custom software: any event that should notify a customer or staff member

## Developer experience
- Simple REST endpoints over HTTPS
- API keys per application
- Webhooks for delivery receipts and inbound replies
- Integration help from our engineers

Need help connecting your system? Our [software development](/services/software-development) team can build the integration for you.$md$);

-- ---------------------------------------------------------------------------
-- Software Solutions
-- ---------------------------------------------------------------------------

update public.services
set short_description = 'Custom software, web and enterprise applications, APIs, HRMS, inventory systems and business automation built around your workflows.',
    features = array['Custom software', 'Web & enterprise applications', 'API development & integration', 'HRMS and inventory systems', 'Business process automation'],
    body = $md$Off-the-shelf software rarely fits perfectly. We design and build applications around the way your business actually works.

## Software solutions
- **[Web Applications](/services/web-applications):** portals, dashboards and SaaS products in the browser
- **[Mobile Applications](/services/mobile-app-development):** iOS and Android apps
- **[Enterprise Applications](/services/enterprise-applications):** secure, scalable systems for complex organisations
- **[API Development](/services/api-development):** connect systems and expose your data safely
- **[CRM](/services/crm-solutions)**, **[ERP](/services/erp-solutions)** and **[CMS](/services/cms-development)** implementation and customisation
- **[HRMS](/services/hrms)** for people, attendance and payroll processes
- **[Inventory Systems](/services/inventory-systems)** for stock, warehouses and purchasing
- **[Business Automation](/services/business-automation)** to remove repetitive manual work

## Our process
1. **Discovery:** workshops to map requirements and priorities
2. **Design:** UX prototypes and technical architecture
3. **Build:** agile sprints with regular demos
4. **Launch & support:** deployment, training and ongoing improvement$md$
where slug = 'software-development';

insert into public.services
  (slug, title, category, icon, sort_order, is_published, parent_id, short_description, features, technologies, body)
values
  ('web-applications', 'Web Applications', 'development', 'globe', 31, true,
   (select id from public.services where slug = 'software-development'),
   'Customer portals, dashboards, booking systems and SaaS products that run in any browser.',
   array['Customer & partner portals', 'Dashboards and reporting', 'Booking and order systems', 'SaaS products', 'Role-based access'],
   array['Next.js', 'React', 'Node.js', '.NET', 'PostgreSQL'],
   $md$Web applications give customers and staff secure access to your services from any device without installing anything.

## Typical projects
- Customer self-service portals
- Internal dashboards and reporting tools
- Booking, ordering and quotation systems
- Multi-tenant SaaS products$md$),

  ('enterprise-applications', 'Enterprise Applications', 'development', 'layers', 32, true,
   (select id from public.services where slug = 'software-development'),
   'Secure, scalable applications that integrate with existing enterprise systems and governance.',
   array['Single sign-on (SSO)', 'Role-based permissions & audit trails', 'Integration with legacy systems', 'High availability', 'Documentation & handover'],
   array['.NET', 'Java', 'Node.js', 'PostgreSQL / SQL Server', 'Docker', 'Cloud platforms'],
   $md$Enterprise applications must fit into an existing landscape of systems, security policies and approval processes.

## What we focus on
- Security reviews, access control and audit logging
- Integration with ERP, CRM, identity providers and data warehouses
- Performance and availability planning
- Change control, documentation and knowledge transfer$md$),

  ('api-development', 'API Development & Integration', 'development', 'code', 33, true,
   (select id from public.services where slug = 'software-development'),
   'Design, build and document APIs, and connect the systems your business already uses.',
   array['REST & GraphQL APIs', 'Third-party integrations', 'Payment & SMS gateway integration', 'Authentication & rate limiting', 'API documentation'],
   array['REST', 'GraphQL', 'OpenAPI', 'OAuth 2.0', 'Webhooks'],
   $md$APIs let your systems share data and automate work across departments and partners.

## Services
- New APIs for mobile apps, partners and internal systems
- Integrations between CRM, ERP, e-commerce, accounting and messaging platforms
- Payment gateway and [SMS API](/services/sms-api) integration
- Documentation, versioning and monitoring$md$),

  ('hrms', 'HRMS (HR Management Systems)', 'business', 'users', 81, true,
   (select id from public.services where slug = 'software-development'),
   'Manage employee records, attendance, leave, payroll inputs and performance in one system.',
   array['Employee records', 'Attendance & leave', 'Payroll inputs & exports', 'Recruitment & onboarding', 'Employee self-service'],
   array['Custom HRMS', 'Biometric / attendance integration', 'Payroll exports'],
   $md$An HRMS replaces spreadsheets and paperwork with one system for people processes.

## Modules
- Employee profiles and documents
- Attendance, shifts and leave management
- Payroll inputs and exports to your payroll provider
- Recruitment, onboarding and performance reviews
- Self-service for employees and managers$md$),

  ('inventory-systems', 'Inventory Management Systems', 'business', 'box', 82, true,
   (select id from public.services where slug = 'software-development'),
   'Track stock, warehouses, purchasing and sales in real time across locations.',
   array['Multi-location stock tracking', 'Purchase orders & suppliers', 'Barcode support', 'Low-stock alerts', 'Sales & e-commerce sync'],
   array['Custom inventory software', 'Barcode scanners', 'E-commerce & ERP integration'],
   $md$Accurate inventory prevents lost sales and tied-up cash.

## Capabilities
- Real-time stock levels across warehouses and branches
- Purchasing, suppliers and goods receiving
- Barcode scanning and stock counts
- Low-stock alerts by email or SMS
- Sync with your online store and accounting system$md$),

  ('business-automation', 'Business Process Automation', 'business', 'workflow', 83, true,
   (select id from public.services where slug = 'software-development'),
   'Automate approvals, data entry, notifications and reporting to save time and reduce errors.',
   array['Workflow & approval automation', 'Document generation', 'Automated notifications (email/SMS)', 'Scheduled reports', 'System-to-system data sync'],
   array['Workflow engines', 'APIs & webhooks', 'Zapier / Make / n8n'],
   $md$Repetitive manual tasks slow teams down and introduce mistakes. We map your processes and automate the steps that don't need a person.

## Examples
- Purchase and leave approval workflows
- Automatic invoices, quotes and contracts
- Customer notifications triggered by system events
- Daily and weekly management reports delivered automatically$md$);

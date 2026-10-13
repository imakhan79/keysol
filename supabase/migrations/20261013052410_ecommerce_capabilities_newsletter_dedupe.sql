-- E-Commerce module capabilities (requirements section 16) and newsletter de-duplication.

update public.services
set short_description = 'Online stores with product and inventory management, secure checkout and payments, orders, shipping, promotions and analytics.',
    features = array[
      'Product & category management', 'Inventory tracking', 'Customer accounts', 'Cart & checkout',
      'Payment gateway integration', 'Order management', 'Shipping & delivery options', 'Coupons & discounts',
      'Product reviews', 'Email & SMS notifications', 'Sales analytics'
    ],
    body = $md$Sell online with confidence. We build and optimise e-commerce stores from catalogue to checkout to fulfilment, on platforms such as Shopify and WooCommerce or as custom headless storefronts.

## Store capabilities
- **Product management:** products, variants, images, pricing and bulk import
- **Categories:** structured catalogues, filters and search
- **Inventory:** stock levels, low-stock alerts and multi-location stock, with optional [inventory system](/services/inventory-systems) integration
- **Customers:** accounts, order history, saved addresses and wishlists
- **Cart & checkout:** fast, mobile-friendly checkout with guest and account options
- **Payments:** local and international payment gateways, cards and wallets
- **Orders:** order processing, status tracking, invoices, returns and refunds
- **Shipping:** rates, zones, courier integration and delivery tracking
- **Coupons & discounts:** promo codes, automatic discounts, bundles and seasonal offers
- **Reviews:** product ratings and reviews with moderation
- **Notifications:** order, payment and delivery updates by email and [SMS](/services/transactional-sms)
- **Analytics:** sales, conversion, top products and customer insights

## Grow after launch
Pair your store with [SEO](/services/seo), [digital marketing](/services/digital-marketing) and abandoned-cart SMS to turn visitors into repeat customers.$md$
where slug = 'ecommerce-development';

-- Keep one newsletter row per address; repeat sign-ups are ignored by the app.
delete from public.leads a
using public.leads b
where a.type = 'newsletter' and b.type = 'newsletter'
  and lower(a.email) = lower(b.email)
  and a.created_at > b.created_at;

create unique index leads_newsletter_email_key on public.leads (lower(email)) where type = 'newsletter';

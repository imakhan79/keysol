"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Cookieless first-party page views (shown in the admin dashboard) plus optional GA4. */
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("utm_source")) {
      try {
        // Remembered for this visit so a later form submission is attributed to the campaign.
        sessionStorage.setItem(
          "utm",
          JSON.stringify({
            utm_source: params.get("utm_source"),
            utm_medium: params.get("utm_medium") ?? "",
            utm_campaign: params.get("utm_campaign") ?? "",
          }),
        );
      } catch {}
    }
    const body = JSON.stringify({
      path: pathname,
      referrer: document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : null,
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      width: window.innerWidth,
    });
    if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
      fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(
        () => {},
      );
    }
    window.gtag?.("event", "page_view", { page_path: pathname });
  }, [pathname]);

  if (!gaId) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${gaId}',{send_page_view:false});`}
      </Script>
    </>
  );
}

/** Fire a GA4 conversion event if GA is configured. */
export function trackConversion(event: string, params: Record<string, unknown> = {}) {
  window.gtag?.("event", event, params);
}

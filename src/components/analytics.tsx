"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

const envGaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function send(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
    fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(
      () => {},
    );
  }
}

const ctaPaths = ["/quote", "/book-consultation", "/contact"];

/** Classifies a clicked link as a WhatsApp, phone, email or call-to-action click. */
function classify(a: HTMLAnchorElement): { name: string; label: string } | null {
  const href = a.getAttribute("href") ?? "";
  const label = (a.dataset.cta || a.getAttribute("aria-label") || a.textContent || "").trim().replace(/\s+/g, " ").slice(0, 120);
  if (href.startsWith("tel:")) return { name: "phone_click", label };
  if (href.startsWith("mailto:")) return { name: "email_click", label };
  if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href) && !href.includes("?text=")) return { name: "whatsapp_click", label };
  if (a.dataset.cta || ctaPaths.some((p) => href === p || href.startsWith(`${p}?`) || href.startsWith(`${p}#`))) {
    return { name: "cta_click", label: `${label} → ${href.split(/[?#]/)[0]}` };
  }
  return null;
}

/** Cookieless first-party page views and click events (shown in the admin dashboard) plus optional GA4. */
export function Analytics({ gaId: gaIdSetting }: { gaId?: string } = {}) {
  const pathname = usePathname();
  const gaId = gaIdSetting || envGaId;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (window.location.pathname.startsWith("/admin")) return;
      const a = (e.target as Element | null)?.closest?.("a");
      const event = a && classify(a);
      if (!event) return;
      send({ kind: "event", ...event, path: window.location.pathname });
      window.gtag?.("event", event.name, { label: event.label });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

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
    send({
      kind: "view",
      path: pathname,
      referrer: document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : null,
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      width: window.innerWidth,
    });
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

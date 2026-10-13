import { createHash } from "node:crypto";
import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";

const pageView = z.object({
  kind: z.literal("view").default("view"),
  path: z.string().startsWith("/").max(300),
  referrer: z.string().max(500).nullish(),
  utm_source: z.string().max(120).nullish(),
  utm_medium: z.string().max(120).nullish(),
  utm_campaign: z.string().max(120).nullish(),
  width: z.number().int().nonnegative().max(10000).optional(),
});

const clickEvent = z.object({
  kind: z.literal("event"),
  name: z.enum(["cta_click", "whatsapp_click", "phone_click", "email_click"]),
  label: z.string().max(120).nullish(),
  path: z.string().startsWith("/").max(300),
});

const schema = z.union([clickEvent, pageView]);

const botPattern = /bot|crawl|spider|slurp|preview|headless|lighthouse/i;

/**
 * Cookieless unique-visitor key: a hash of IP + user agent with a salt that rotates daily,
 * so visitors can be counted per day but not tracked across days. The IP is never stored.
 */
function visitorHash(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const ua = request.headers.get("user-agent") ?? "";
  const day = new Date().toISOString().slice(0, 10);
  const secret = process.env.ANALYTICS_SALT ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return createHash("sha256").update(`${secret}|${day}|${ip}|${ua}`).digest("hex").slice(0, 32);
}

export async function POST(request: Request) {
  if (botPattern.test(request.headers.get("user-agent") ?? "")) return new Response(null, { status: 204 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.path.startsWith("/admin")) return new Response(null, { status: 204 });

  const supabase = createPublicClient();
  const visitor_hash = visitorHash(request);

  if (parsed.data.kind === "event") {
    const { name, label, path } = parsed.data;
    await supabase.from("analytics_events").insert({ name, label, path, visitor_hash });
    return new Response(null, { status: 204 });
  }

  const { width, path, referrer, utm_source, utm_medium, utm_campaign } = parsed.data;
  const view = { path, referrer, utm_source, utm_medium, utm_campaign };
  const device = width === undefined ? null : width < 640 ? "mobile" : width < 1024 ? "tablet" : "desktop";
  const { error } = await supabase.from("page_views").insert({ ...view, device, visitor_hash });
  // Before the analytics migration runs there is no visitor_hash column; still record the view.
  if (error?.code === "PGRST204") await supabase.from("page_views").insert({ ...view, device });
  return new Response(null, { status: 204 });
}

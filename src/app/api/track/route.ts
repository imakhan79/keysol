import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";

const schema = z.object({
  path: z.string().startsWith("/").max(300),
  referrer: z.string().max(500).nullish(),
  utm_source: z.string().max(120).nullish(),
  utm_medium: z.string().max(120).nullish(),
  utm_campaign: z.string().max(120).nullish(),
  width: z.number().int().nonnegative().max(10000).optional(),
});

const botPattern = /bot|crawl|spider|slurp|preview|headless|lighthouse/i;

export async function POST(request: Request) {
  if (botPattern.test(request.headers.get("user-agent") ?? "")) return new Response(null, { status: 204 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.path.startsWith("/admin")) return new Response(null, { status: 204 });

  const { width, ...view } = parsed.data;
  const device = width === undefined ? null : width < 640 ? "mobile" : width < 1024 ? "tablet" : "desktop";

  await createPublicClient().from("page_views").insert({ ...view, device });
  return new Response(null, { status: 204 });
}

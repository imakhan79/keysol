"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";

type FormValues = Partial<
  Record<
    | "name"
    | "email"
    | "phone"
    | "company"
    | "message"
    | "budget_range"
    | "timeline"
    | "organization_type"
    | "company_size"
    | "industry"
    | "preferred_date"
    | "preferred_time"
    | "meeting_type",
    string
  >
> & { services?: string[] };

export type LeadFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
  /** Echoed back on validation errors so the form keeps what the visitor typed. */
  values?: FormValues;
};

const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || null)
    .nullish();

// One schema for every capture channel; per-channel requirements are in superRefine.
const schema = z
  .object({
    type: z.enum(["contact", "quote", "callback", "newsletter", "enquiry", "consultation"]),
    name: z.string().trim().max(120).default(""),
    email: z.string().trim().toLowerCase().max(254).email("Please enter a valid email address"),
    phone: optional(40),
    company: optional(160),
    message: z.string().trim().max(5000, "Message is too long").default(""),
    services: z.array(z.string().trim().max(80)).max(20).default([]),
    budget_range: optional(60),
    timeline: optional(60),
    organization_type: optional(80),
    company_size: optional(40),
    industry: optional(120),
    preferred_date: z
      .string()
      .trim()
      .regex(/^(\d{4}-\d{2}-\d{2})?$/, "Please choose a valid date")
      .transform((v) => v || null)
      .nullish(),
    preferred_time: optional(40),
    meeting_type: optional(40),
    source_page: optional(300),
    utm_source: optional(120),
    utm_medium: optional(120),
    utm_campaign: optional(120),
    referrer: optional(500),
  })
  .superRefine((lead, ctx) => {
    if (lead.type !== "newsletter" && lead.name.length < 2) {
      ctx.addIssue({ code: "custom", path: ["name"], message: "Please enter your name" });
    }
    if ((lead.type === "contact" || lead.type === "enquiry") && lead.message.length < 10) {
      ctx.addIssue({ code: "custom", path: ["message"], message: "Please tell us a little more (10+ characters)" });
    }
    if (lead.type === "quote" && lead.services.length === 0) {
      ctx.addIssue({ code: "custom", path: ["services"], message: "Select at least one service" });
    }
    if (lead.type === "callback" && (lead.phone ?? "").replace(/\D/g, "").length < 7) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Please enter a phone number we can call" });
    }
    if (lead.type === "consultation") {
      // Compare calendar dates as strings; allow "today" in any visitor time zone.
      const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
      if (!lead.preferred_date) {
        ctx.addIssue({ code: "custom", path: ["preferred_date"], message: "Please choose a preferred date" });
      } else if (lead.preferred_date < yesterday) {
        ctx.addIssue({ code: "custom", path: ["preferred_date"], message: "Please choose a date in the future" });
      }
    }
  });

type Lead = z.infer<typeof schema>;

const successMessages: Record<Lead["type"], string> = {
  quote: "Thanks! Your quote request is in. We'll reply within one business day.",
  contact: "Thanks for reaching out! We'll get back to you within one business day.",
  enquiry: "Thanks! A specialist will reply within one business day.",
  callback: "Thanks! We'll call you back during business hours.",
  newsletter: "You're subscribed. Thanks for joining!",
  consultation: "Thanks! We'll confirm your consultation time by email within one business day.",
};

// Best-effort throttle per IP. Per server instance only; put a WAF / edge rate limit
// in front for stronger protection.
const recent = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function throttled(key: string) {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(key, hits);
  if (recent.size > 5000) recent.clear();
  return hits.length > MAX_PER_WINDOW;
}

export async function submitLead(_prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  // Spam traps: hidden honeypot field, and forms submitted faster than a human can type.
  const elapsed = Number(formData.get("elapsed_ms"));
  if (formData.get("website") || (elapsed > 0 && elapsed < 2500)) {
    return { status: "success", message: "Thanks! We'll be in touch." };
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (throttled(ip)) {
    return { status: "error", message: "Too many submissions. Please try again in a few minutes." };
  }

  const raw = {
    ...Object.fromEntries([...formData.entries()].filter(([k, v]) => k !== "services" && typeof v === "string")),
    services: formData.getAll("services").filter((v): v is string => typeof v === "string"),
  } as Record<string, string> & { services: string[] };
  const values: FormValues = {
    name: raw.name,
    email: raw.email,
    phone: raw.phone,
    company: raw.company,
    message: raw.message,
    budget_range: raw.budget_range,
    timeline: raw.timeline,
    organization_type: raw.organization_type,
    company_size: raw.company_size,
    industry: raw.industry,
    preferred_date: raw.preferred_date,
    preferred_time: raw.preferred_time,
    meeting_type: raw.meeting_type,
    services: raw.services,
  };

  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors, values };
  }

  const lead = parsed.data;
  // No .select() after insert: visitors may create leads but not read them back (RLS).
  let { error } = await createPublicClient().from("leads").insert(lead);
  // Database not yet migrated for the newer fields: keep the lead, folding those details into the message.
  if (error?.code === "PGRST204") {
    const { industry, preferred_date, preferred_time, meeting_type, ...base } = lead;
    const extra = [
      industry && `Industry: ${industry}`,
      preferred_date && `Preferred consultation: ${[preferred_date, preferred_time, meeting_type].filter(Boolean).join(" · ")}`,
    ].filter(Boolean);
    const type = base.type === "consultation" ? "enquiry" : base.type;
    const message = [base.type === "consultation" && "[Consultation booking]", ...extra, base.message].filter(Boolean).join("\n");
    ({ error } = await createPublicClient().from("leads").insert({ ...base, type, message }));
  }
  // Already subscribed: unique index on newsletter emails. Treat as success without revealing it.
  if (error?.code === "23505" && lead.type === "newsletter") return { status: "success", message: successMessages.newsletter };
  if (error) {
    console.error("lead insert failed", error.message);
    return { status: "error", message: "Something went wrong. Please try again or email us directly.", values };
  }

  if (lead.type !== "newsletter") after(() => notifyWebhook(lead));

  return { status: "success", message: successMessages[lead.type] };
}

const typeLabels: Record<Lead["type"], string> = {
  quote: "quote request",
  contact: "contact enquiry",
  enquiry: "service enquiry",
  callback: "callback request",
  newsletter: "newsletter sign-up",
  consultation: "consultation booking",
};

async function notifyWebhook(lead: Lead) {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return;
  const lines = [
    `New ${typeLabels[lead.type]} from ${lead.name || lead.email} <${lead.email}>`,
    lead.phone && `Phone: ${lead.phone}`,
    lead.company && `Company: ${lead.company}`,
    lead.organization_type && `Organisation: ${lead.organization_type}${lead.company_size ? ` (${lead.company_size})` : ""}`,
    lead.industry && `Industry: ${lead.industry}`,
    lead.preferred_date &&
      `Preferred: ${[lead.preferred_date, lead.preferred_time, lead.meeting_type].filter(Boolean).join(" · ")}`,
    lead.services.length > 0 && `Services: ${lead.services.join(", ")}`,
    lead.budget_range && `Budget: ${lead.budget_range}`,
    lead.timeline && `Timeline: ${lead.timeline}`,
    lead.message && `> ${lead.message.slice(0, 500)}`,
  ].filter(Boolean);
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // `text` renders in Slack/Teams/Discord-style webhooks; `lead` is for Zapier/Make/n8n.
      body: JSON.stringify({ text: lines.join("\n"), lead }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (error) {
    console.error("lead webhook failed", error);
  }
}

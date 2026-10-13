"use server";

import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { can, requireStaff } from "@/lib/auth";
import { staffRoles, type StaffRole } from "@/lib/roles";
import { contentTypes, slugify, type FieldDef } from "@/lib/cms";
import { createSessionClient } from "@/lib/supabase/server";
import type { LeadStatus } from "@/lib/types";

export type FormState = { error?: string; ok?: boolean };

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Invalid email or password." };

  const role = (data.user?.app_metadata as { role?: string } | undefined)?.role;
  if (!role || !staffRoles.includes(role as StaffRole)) {
    await supabase.auth.signOut();
    return { error: "This account does not have admin access. Ask an administrator to grant a role." };
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Content (CMS)
// ---------------------------------------------------------------------------

function parseField(field: FieldDef, formData: FormData): unknown {
  const raw = formData.get(field.name);
  const text = typeof raw === "string" ? raw.trim() : "";
  switch (field.kind) {
    case "boolean":
      return raw === "on";
    case "number":
      return text === "" ? 0 : Number.parseInt(text, 10) || 0;
    case "serviceSlugs":
      return formData.getAll(field.name).filter((v): v is string => typeof v === "string" && v !== "");
    case "tags":
    case "images":
      return text
        .split(/\r?\n/)
        .map((t) => t.trim())
        .filter(Boolean);
    case "metrics":
      return text
        .split(/\r?\n/)
        .map((line) => line.split("|").map((p) => p.trim()))
        .filter(([label, value]) => label && value)
        .map(([label, value]) => ({ label, value }));
    case "select":
      if (field.name === "rating") return text ? Number(text) : null;
      return text || null;
    case "ref":
    case "date":
    case "url":
    case "image":
      return text || null;
    case "datetime":
      return text ? new Date(text).toISOString() : null;
    case "slug":
      return slugify(text);
    default:
      return field.required ? text : text || (field.name.startsWith("seo_") ? null : "");
  }
}

export async function saveContent(
  typeKey: string,
  id: string | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const type = contentTypes[typeKey];
  if (!type) return { error: "Unknown content type." };
  await requireStaff(type.permission);

  const row: Record<string, unknown> = {};
  for (const field of type.fields) row[field.name] = parseField(field, formData);

  for (const field of type.fields) {
    if (field.required && !row[field.name]) return { error: `${field.label} is required.` };
  }
  if ("slug" in row && !row.slug) row.slug = slugify(String(row[type.titleField] ?? ""));
  if ("published_at" in row && row.is_published && !row.published_at) row.published_at = new Date().toISOString();

  const supabase = await createSessionClient();
  const result = id
    ? await supabase.from(type.table).update(row).eq("id", id).select("id").single()
    : await supabase.from(type.table).insert(row).select("id").single();

  if (result.error) {
    if (result.error.code === "23505") return { error: "That URL slug is already used. Choose another." };
    if (result.error.code === "23514") return { error: "Some values are invalid (check the slug format and lengths)." };
    return { error: result.error.message };
  }

  updateTag(type.table);
  redirect(`/admin/content/${typeKey}?saved=1`);
}

export async function deleteContent(typeKey: string, id: string) {
  const type = contentTypes[typeKey];
  if (!type) return;
  await requireStaff(type.permission);
  const supabase = await createSessionClient();
  const { error } = await supabase.from(type.table).delete().eq("id", id);
  if (error) throw new Error(error.message);
  updateTag(type.table);
  redirect(`/admin/content/${typeKey}?deleted=1`);
}

export async function togglePublished(typeKey: string, id: string, publish: boolean) {
  const type = contentTypes[typeKey];
  if (!type) return;
  await requireStaff(type.permission);
  const supabase = await createSessionClient();
  const patch: Record<string, unknown> = { is_published: publish };
  if (publish && type.fields.some((f) => f.name === "published_at")) {
    const { data } = await supabase.from(type.table).select("published_at").eq("id", id).single();
    if (!data?.published_at) patch.published_at = new Date().toISOString();
  }
  const { error } = await supabase.from(type.table).update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  updateTag(type.table);
  refresh();
}

// ---------------------------------------------------------------------------
// Site settings
// ---------------------------------------------------------------------------

const lines = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

/** "A | B" lines -> [A, B] pairs, skipping incomplete lines. */
const pairs = (v: FormDataEntryValue | null) =>
  lines(v)
    .map((l) => l.split("|").map((p) => p.trim()))
    .filter(([a, b]) => a && b) as [string, string][];

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireStaff("siteContent");
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  const gaId = get("integrations.ga_measurement_id").toUpperCase();
  if (gaId && !/^G-[A-Z0-9]{4,20}$/.test(gaId)) return { error: "The Google Analytics ID should look like G-XXXXXXXXXX." };
  const bookingUrl = get("integrations.booking_url");
  if (bookingUrl && !/^https:\/\//.test(bookingUrl)) return { error: "The booking link must start with https://" };

  const rows = [
    {
      key: "integrations",
      value: {
        ga_measurement_id: gaId,
        // Accept either the bare token or the whole <meta> tag pasted from Search Console.
        google_site_verification: get("integrations.google_site_verification").replace(/^.*content="([^"]+)".*$/, "$1"),
        bing_site_verification: get("integrations.bing_site_verification").replace(/^.*content="([^"]+)".*$/, "$1"),
        booking_url: bookingUrl,
        show_map: formData.get("integrations.show_map") === "on",
        map_query: get("integrations.map_query"),
      },
    },
    {
      key: "company",
      value: {
        name: get("company.name") || "Digitora Next",
        tagline: get("company.tagline"),
        description: get("company.description"),
        email: get("company.email"),
        phone: get("company.phone"),
        address: get("company.address"),
        hours: get("company.hours"),
        whatsapp: get("company.whatsapp").replace(/[^\d+]/g, ""),
      },
    },
    {
      key: "social",
      value: Object.fromEntries(
        ["linkedin", "facebook", "instagram", "x", "youtube"].map((k) => [k, get(`social.${k}`)]),
      ),
    },
    {
      key: "home",
      value: {
        hero_title: get("home.hero_title"),
        hero_subtitle: get("home.hero_subtitle"),
        primary_cta: get("home.primary_cta"),
        secondary_cta: get("home.secondary_cta"),
        stats: lines(formData.get("home.stats"))
          .map((l) => l.split("|").map((p) => p.trim()))
          .filter(([value, label]) => value && label)
          .map(([value, label]) => ({ value, label })),
        audience_line: get("home.audience_line"),
        intro_title: get("home.intro_title"),
        intro_text: get("home.intro_text"),
        why_us: pairs(formData.get("home.why_us")).map(([title, text]) => ({ title, text })),
      },
    },
    {
      key: "quote_options",
      value: {
        budgets: lines(formData.get("quote.budgets")),
        timelines: lines(formData.get("quote.timelines")),
        organization_types: lines(formData.get("quote.organization_types")),
        company_sizes: lines(formData.get("quote.company_sizes")),
      },
    },
    {
      key: "about",
      value: {
        mission: get("about.mission"),
        vision: get("about.vision"),
        values: pairs(formData.get("about.values")).map(([title, text]) => ({ title, text })),
        history: lines(formData.get("about.history"))
          .map((l) => l.split("|").map((p) => p.trim()))
          .filter(([year, title]) => year && title)
          .map(([year, title, text = ""]) => ({ year, title, text })),
        achievements: pairs(formData.get("about.achievements")).map(([value, label]) => ({ value, label })),
        certifications: lines(formData.get("about.certifications"))
          .map((l) => l.split("|").map((p) => p.trim()))
          .filter(([name]) => name)
          .map(([name, issuer = "", year = ""]) => ({ name, issuer, year })),
      },
    },
  ];

  for (const [key, url] of Object.entries(rows[1].value)) {
    if (url && !/^https?:\/\//.test(String(url))) return { error: `The ${key} link must start with https://` };
  }

  const supabase = await createSessionClient();
  const { error } = await supabase.from("site_settings").upsert(rows);
  if (error) return { error: error.message };
  updateTag("site_settings");
  refresh();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Leads (CRM)
// ---------------------------------------------------------------------------

const leadUpdate = z.object({
  status: z.enum([
    "new",
    "contacted",
    "qualified",
    "consultation",
    "proposal",
    "negotiation",
    "won",
    "onboarding",
    "lost",
    "spam",
  ]),
  estimated_value: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v.replace(/[^\d.]/g, ""))))
    .refine((v) => v === null || Number.isFinite(v), "Enter a number"),
  assigned_to: z
    .string()
    .trim()
    .transform((v) => v || null),
});

export async function updateLead(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const staff = await requireStaff("workLeads");
  const parsed = leadUpdate.safeParse({
    status: formData.get("status"),
    estimated_value: formData.get("estimated_value") ?? "",
    assigned_to: formData.get("assigned_to") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid values" };
  const patch: Record<string, unknown> = { ...parsed.data };
  // Only managers assign leads to other people; reps can claim or release; support can't assign.
  if (!can(staff, "assignLeads")) {
    if (staff.role !== "sales_rep") delete patch.assigned_to;
    else if (patch.assigned_to && patch.assigned_to !== staff.id) {
      return { error: "You can only assign leads to yourself." };
    }
  }

  const supabase = await createSessionClient();
  const { data, error } = await supabase.from("leads").update(patch).eq("id", id).select("id");
  if (error) return { error: error.message };
  if (!data?.length) return { error: "You don't have permission to update this lead." };
  refresh();
  return { ok: true };
}

export async function setLeadStatus(id: string, status: LeadStatus) {
  await requireStaff("workLeads");
  const supabase = await createSessionClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  refresh();
}

export async function addLeadNote(leadId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const staff = await requireStaff("workLeads");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Write a note first." };
  if (body.length > 5000) return { error: "Notes are limited to 5000 characters." };

  const supabase = await createSessionClient();
  const { error } = await supabase
    .from("lead_notes")
    .insert({ lead_id: leadId, body, author_id: staff.id, author_email: staff.email });
  if (error) return { error: error.message };
  refresh();
  return { ok: true };
}

export async function deleteLeadNote(noteId: string) {
  await requireStaff("workLeads");
  const supabase = await createSessionClient();
  const { error } = await supabase.from("lead_notes").delete().eq("id", noteId);
  if (error) throw new Error(error.message);
  refresh();
}

export async function deleteLead(id: string) {
  await requireStaff("deleteLeads");
  const supabase = await createSessionClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw new Error(error.message);
  redirect("/admin/leads?deleted=1");
}

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

export async function setUserRole(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireStaff("team");
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "");
  if (!email) return { error: "Enter an email address." };

  const supabase = await createSessionClient();
  // The database function re-checks the caller: only super admins can grant or change admin roles.
  const { error } = await supabase.rpc("set_user_role", {
    target_email: email,
    new_role: role === "none" ? null : role,
  });
  if (error) return { error: error.message };
  refresh();
  return { ok: true };
}

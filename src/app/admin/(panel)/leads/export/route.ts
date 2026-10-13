import { can, getStaff } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";
import type { Lead } from "@/lib/types";

const columns: (keyof Lead)[] = [
  "created_at",
  "type",
  "status",
  "name",
  "email",
  "phone",
  "company",
  "services",
  "budget_range",
  "timeline",
  "organization_type",
  "company_size",
  "estimated_value",
  "message",
  "source_page",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "referrer",
];

function csvCell(value: unknown) {
  let text = Array.isArray(value) ? value.join("; ") : value == null ? "" : String(value);
  // Neutralise spreadsheet formula injection from visitor-supplied text.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const staff = await getStaff();
  if (!staff || !can(staff, "exportLeads")) {
    return new Response("Forbidden", { status: 403 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const type = url.searchParams.get("type");

  const supabase = await createSessionClient();
  let query = supabase.from("leads").select(columns.join(","));
  if (status) query = query.eq("status", status);
  if (type) query = query.eq("type", type);
  const { data, error } = await query.order("created_at", { ascending: false }).limit(10000);
  if (error) return new Response(error.message, { status: 500 });

  const rows = (data ?? []) as unknown as Lead[];
  const csv = [columns.join(","), ...rows.map((row) => columns.map((c) => csvCell(row[c])).join(","))].join("\r\n");

  return new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

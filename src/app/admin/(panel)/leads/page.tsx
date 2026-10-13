import Link from "next/link";
import type { Metadata } from "next";
import { Download, Search } from "lucide-react";
import { can, requireStaff } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";
import type { Lead } from "@/lib/types";
import { AdminHeader, formatDateTime, leadStatuses, leadTypes, Notice, StatusBadge } from "../ui";

export const metadata: Metadata = { title: "Leads" };

const PAGE_SIZE = 50;

export default async function LeadsPage(props: PageProps<"/admin/leads">) {
  const staff = await requireStaff("leads");
  const sp = await props.searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const type = typeof sp.type === "string" ? sp.type : "";
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const page = Math.max(1, Number(sp.page) || 1);

  const supabase = await createSessionClient();
  let query = supabase.from("leads").select("*", { count: "exact" });
  if (status) query = query.eq("status", status);
  else query = query.neq("status", "spam");
  if (leadTypes.some((t) => t.value === type)) query = query.eq("type", type);
  if (q) {
    // Strip characters that have meaning in PostgREST filter syntax.
    const term = q.replace(/[%,()*]/g, " ");
    query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%,company.ilike.%${term}%`);
  }
  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (error) throw new Error(error.message);
  const leads = (data ?? []) as Lead[];
  const total = count ?? 0;

  const href = (patch: Record<string, string | number>) => {
    const params = new URLSearchParams({ ...(status && { status }), ...(type && { type }), ...(q && { q }) });
    for (const [k, v] of Object.entries(patch)) {
      if (v === "") params.delete(k);
      else params.set(k, String(v));
    }
    const s = params.toString();
    return `/admin/leads${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <AdminHeader
        title="Leads"
        description={`${total} ${status ? (leadStatuses.find((s) => s.value === status)?.label.toLowerCase() ?? "") : "active"} leads${
          staff.role === "sales_rep" ? " assigned to you or unassigned" : staff.role === "support_staff" ? " (enquiries and callbacks)" : ""
        }`}
        actions={
          can(staff, "exportLeads") && (
            <a href={`/admin/leads/export${href({}).replace("/admin/leads", "")}`} className="btn-secondary">
              <Download className="size-4" /> Export CSV
            </a>
          )
        }
      />
      <div className="space-y-4 p-4 sm:p-8">
        {sp.deleted && <Notice>Lead deleted.</Notice>}

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Filter by status" className="flex flex-wrap gap-1.5">
            <FilterLink href={href({ status: "", page: "" })} active={!status}>
              All active
            </FilterLink>
            {leadStatuses.map((s) => (
              <FilterLink key={s.value} href={href({ status: s.value, page: "" })} active={status === s.value}>
                {s.label}
              </FilterLink>
            ))}
          </nav>
          <form className="flex gap-2" action="/admin/leads">
            {status && <input type="hidden" name="status" value={status} />}
            <select name="type" defaultValue={type} className="field w-auto">
              <option value="">All types</option>
              {leadTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <div className="relative">
              <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-slate-400" />
              <input name="q" defaultValue={q} placeholder="Search name, email, company" className="field w-64 pl-9" />
            </div>
            <button className="btn-secondary" type="submit">
              Filter
            </button>
          </form>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Interest</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    No leads match these filters.
                  </td>
                </tr>
              )}
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/leads/${lead.id}`} className="font-medium text-slate-900 hover:text-brand-600">
                      {lead.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {lead.company ? `${lead.company} · ` : ""}
                      {lead.email}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {leadTypes.find((t) => t.value === lead.type)?.label ?? lead.type}
                    {lead.organization_type && <p className="text-xs text-slate-500">{lead.organization_type}</p>}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-slate-600">
                    <p className="truncate">{lead.services.join(", ") || lead.message.slice(0, 80) || "—"}</p>
                    {lead.budget_range && <p className="text-xs text-slate-500">{lead.budget_range}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">{formatDateTime(lead.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Page {page} of {Math.ceil(total / PAGE_SIZE)}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={href({ page: page - 1 })} className="btn-secondary">
                  Previous
                </Link>
              )}
              {page * PAGE_SIZE < total && (
                <Link href={href({ page: page + 1 })} className="btn-secondary">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 hover:border-slate-300 aria-[current=true]:border-brand-600 aria-[current=true]:bg-brand-600 aria-[current=true]:text-white"
    >
      {children}
    </Link>
  );
}

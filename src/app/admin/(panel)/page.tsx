import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Eye, FileText, Inbox, Target } from "lucide-react";
import { can, requireStaff } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";
import type { Lead, LeadStatus } from "@/lib/types";
import { AdminHeader, formatDateTime, leadStatuses, Notice, StatusBadge } from "./ui";

export const metadata: Metadata = { title: "Dashboard" };

type Summary = {
  days: number;
  page_views: number;
  leads: number;
  quotes: number;
  open_leads: number;
  leads_by_status: Partial<Record<LeadStatus, number>>;
  views_by_day: { day: string; views: number }[];
  leads_by_day: { day: string; leads: number }[];
  top_pages: { path: string; views: number }[];
  top_sources: { source: string; views: number }[];
  devices: Record<string, number>;
};

export default async function DashboardPage(props: PageProps<"/admin">) {
  const staff = await requireStaff();
  const { denied } = await props.searchParams;
  const supabase = await createSessionClient();

  const [{ data: summary, error }, recent] = await Promise.all([
    supabase.rpc("dashboard_summary", { days: 30 }),
    can(staff, "leads")
      ? supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(8)
      : Promise.resolve({ data: [] as Lead[] }),
  ]);
  if (error) throw new Error(error.message);
  const s = summary as Summary;
  const recentLeads = (recent.data ?? []) as Lead[];
  const conversion = s.page_views > 0 ? ((s.leads / s.page_views) * 100).toFixed(1) : "0.0";

  return (
    <>
      <AdminHeader title="Dashboard" description="Last 30 days" />
      <div className="space-y-6 p-4 sm:p-8">
        {denied && <Notice tone="error">Your role doesn&apos;t have access to that section.</Notice>}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat icon={Eye} label="Page views" value={s.page_views} />
          <Stat icon={Inbox} label="New leads" value={s.leads} hint={`${s.quotes} quote requests`} />
          <Stat icon={Target} label="Visit → lead rate" value={`${conversion}%`} />
          <Stat icon={FileText} label="Open pipeline" value={s.open_leads} hint="Not yet won or lost" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <section className="card p-6">
            <h2 className="font-semibold">Traffic and leads</h2>
            <DailyChart views={s.views_by_day} leads={s.leads_by_day} days={s.days} />
          </section>
          <section className="card p-6">
            <h2 className="font-semibold">Pipeline</h2>
            <ul className="mt-4 space-y-3">
              {leadStatuses.map((st) => {
                const count = s.leads_by_status[st.value] ?? 0;
                return (
                  <li key={st.value} className="flex items-center justify-between text-sm">
                    {can(staff, "leads") ? (
                      <Link href={`/admin/leads?status=${st.value}`} className="hover:underline">
                        <StatusBadge status={st.value} />
                      </Link>
                    ) : (
                      <StatusBadge status={st.value} />
                    )}
                    <span className="font-medium tabular-nums">{count}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <RankList title="Top pages" rows={s.top_pages.map((p) => ({ label: p.path, value: p.views }))} />
          <RankList title="Traffic sources" rows={s.top_sources.map((p) => ({ label: p.source, value: p.views }))} />
          <RankList title="Devices" rows={Object.entries(s.devices).map(([label, value]) => ({ label, value }))} />
        </div>

        {can(staff, "leads") && (
          <section className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold">Recent leads</h2>
              <Link href="/admin/leads" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600">
                All leads <ArrowRight className="size-4" />
              </Link>
            </div>
            {recentLeads.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-slate-500">
                No leads yet. Contact and quote form submissions will appear here.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentLeads.map((lead) => (
                  <li key={lead.id}>
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="flex flex-wrap items-center justify-between gap-2 px-6 py-3 hover:bg-slate-50"
                    >
                      <span>
                        <span className="font-medium">{lead.name}</span>
                        <span className="ml-2 text-sm text-slate-500">{lead.company ?? lead.email}</span>
                      </span>
                      <span className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="capitalize">{lead.type}</span>
                        <StatusBadge status={lead.status} />
                        {formatDateTime(lead.created_at)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </>
  );
}

function Stat({ icon: Icon, label, value, hint }: { icon: typeof Eye; label: string; value: number | string; hint?: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between text-sm text-slate-500">
        {label}
        <Icon className="size-4" />
      </div>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function RankList({ title, rows }: { title: string; rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <section className="card p-6">
      <h2 className="font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No data yet.</p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {rows.map((r) => (
            <li key={r.label} className="relative text-sm">
              <div className="absolute inset-y-0 left-0 rounded bg-brand-50" style={{ width: `${(r.value / max) * 100}%` }} />
              <div className="relative flex justify-between gap-3 px-2 py-1">
                <span className="truncate capitalize">{r.label}</span>
                <span className="font-medium tabular-nums">{r.value}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DailyChart({
  views,
  leads,
  days,
}: {
  views: { day: string; views: number }[];
  leads: { day: string; leads: number }[];
  days: number;
}) {
  const byDay = new Map<string, { views: number; leads: number }>();
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    byDay.set(d.toISOString().slice(0, 10), { views: 0, leads: 0 });
  }
  for (const v of views) {
    const entry = byDay.get(v.day);
    if (entry) entry.views = v.views;
  }
  for (const l of leads) {
    const entry = byDay.get(l.day);
    if (entry) entry.leads = l.leads;
  }
  const series = [...byDay.entries()];
  const max = Math.max(1, ...series.map(([, v]) => v.views));

  return (
    <div className="mt-6">
      <div className="flex h-48 items-end gap-[3px]" role="img" aria-label="Daily page views and leads">
        {series.map(([day, v]) => (
          <div key={day} className="group relative flex h-full flex-1 flex-col justify-end">
            <div
              className="rounded-t-sm bg-brand-500/80 transition group-hover:bg-brand-600"
              style={{ height: `${(v.views / max) * 100}%`, minHeight: v.views ? 2 : 0 }}
            />
            {v.leads > 0 && <div className="mx-auto mt-1 size-1.5 rounded-full bg-emerald-500" />}
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-md bg-ink px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block">
              {day}: {v.views} views, {v.leads} leads
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-brand-500" /> Page views
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500" /> Day with leads
        </span>
      </div>
    </div>
  );
}

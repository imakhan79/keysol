import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, CalendarPlus, Mail, Phone } from "lucide-react";
import { can, requireStaff } from "@/lib/auth";
import { roleLabels, type StaffRole } from "@/lib/roles";
import { formatDate } from "@/lib/site";
import { createSessionClient } from "@/lib/supabase/server";
import type { Lead, LeadNote } from "@/lib/types";
import { AdminHeader, formatDateTime, leadTypes, StatusBadge } from "../../ui";
import { DeleteLeadButton, DeleteNoteButton, LeadUpdateForm, NoteForm } from "./forms";

export const metadata: Metadata = { title: "Lead" };

export default async function LeadPage(props: PageProps<"/admin/leads/[id]">) {
  const staff = await requireStaff("leads");
  const { id } = await props.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createSessionClient();
  const [{ data: lead }, { data: notes }, { data: team }] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).maybeSingle<Lead>(),
    supabase.from("lead_notes").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
    can(staff, "assignLeads") ? supabase.rpc("list_staff") : Promise.resolve({ data: null }),
  ]);
  if (!lead) notFound();
  const assignees = ((team ?? []) as { id: string; email: string; role: StaffRole }[])
    .filter((m) => ["super_admin", "admin", "sales_manager", "sales_rep", "support_staff"].includes(m.role))
    .map((m) => ({ id: m.id, label: `${m.email} (${roleLabels[m.role]})` }));
  const canWork = can(staff, "workLeads");

  const details: [string, React.ReactNode][] = [
    ["Company", lead.company],
    ["Organisation type", lead.organization_type],
    ["Company size", lead.company_size],
    ["Industry", lead.industry],
    [
      "Preferred consultation",
      lead.preferred_date && [formatDate(lead.preferred_date), lead.preferred_time, lead.meeting_type].filter(Boolean).join(" · "),
    ],
    ["Services", lead.services.join(", ")],
    ["Budget", lead.budget_range],
    ["Timeline", lead.timeline],
    ["Submitted from", lead.source_page],
    ["Referrer", lead.referrer],
    ["Campaign", [lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(" / ")],
    ["Received", formatDateTime(lead.created_at)],
    ["Last updated", formatDateTime(lead.updated_at)],
  ];

  return (
    <>
      <AdminHeader
        title={lead.name}
        description={`${leadTypes.find((t) => t.value === lead.type)?.label ?? "Lead"} · ${lead.email}`}
        actions={
          <>
            <Link href="/admin/leads" className="btn-secondary">
              <ArrowLeft className="size-4" /> All leads
            </Link>
            {lead.preferred_date && (
              <a href={calendarLink(lead)} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                <CalendarPlus className="size-4" /> Add to Google Calendar
              </a>
            )}
            <a href={`mailto:${lead.email}`} className="btn-primary">
              <Mail className="size-4" /> Email
            </a>
          </>
        }
      />
      <div className="grid gap-6 p-4 sm:p-8 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="card p-6">
            <div className="flex items-center gap-3">
              <StatusBadge status={lead.status} />
              {lead.phone && (
                <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-brand-600">
                  <Phone className="size-4" /> {lead.phone}
                </a>
              )}
            </div>
            <h2 className="mt-5 text-sm font-semibold text-slate-500">Message</h2>
            <p className="mt-2 whitespace-pre-wrap text-slate-800">{lead.message || "—"}</p>
            <dl className="mt-6 grid gap-x-6 gap-y-3 border-t border-slate-100 pt-5 text-sm sm:grid-cols-2">
              {details
                .filter(([, v]) => v)
                .map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="break-words text-slate-900">{value}</dd>
                  </div>
                ))}
            </dl>
          </section>

          <section className="card p-6">
            <h2 className="font-semibold">Activity notes</h2>
            {canWork && <NoteForm leadId={lead.id} />}
            <ul className="mt-6 space-y-4">
              {(notes as LeadNote[] | null)?.length ? (
                (notes as LeadNote[]).map((note) => (
                  <li key={note.id} className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>
                        {note.author_email ?? "Staff"} · {formatDateTime(note.created_at)}
                      </span>
                      {(staff.role === "admin" || note.author_id === staff.id) && <DeleteNoteButton id={note.id} />}
                    </div>
                    <p className="mt-2 text-sm whitespace-pre-wrap text-slate-800">{note.body}</p>
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-500">No notes yet. Log calls, emails and next steps here.</li>
              )}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          {canWork ? (
            <section className="card p-6">
              <h2 className="font-semibold">Manage lead</h2>
              <LeadUpdateForm
                lead={lead}
                staffId={staff.id}
                assignees={can(staff, "assignLeads") ? assignees : null}
                canAssign={can(staff, "assignLeads") || staff.role === "sales_rep"}
              />
            </section>
          ) : (
            <section className="card p-6 text-sm text-slate-600">
              <h2 className="font-semibold text-slate-900">Read-only access</h2>
              <p className="mt-1">Your role can view leads for campaign attribution. Sales staff manage the pipeline.</p>
            </section>
          )}
          {can(staff, "deleteLeads") && (
            <section className="card border-red-100 p-6">
              <h2 className="font-semibold text-red-700">Danger zone</h2>
              <p className="mt-1 text-sm text-slate-600">Permanently delete this lead and its notes.</p>
              <DeleteLeadButton id={lead.id} />
            </section>
          )}
        </aside>
      </div>
    </>
  );
}

/** Prefilled all-day Google Calendar event for a consultation request; staff set the exact time. */
function calendarLink(lead: Lead) {
  const day = lead.preferred_date!.replaceAll("-", "");
  const next = new Date(`${lead.preferred_date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Consultation: ${lead.name}${lead.company ? ` (${lead.company})` : ""}`,
    dates: `${day}/${next.toISOString().slice(0, 10).replaceAll("-", "")}`,
    details: [
      lead.preferred_time && `Preferred time: ${lead.preferred_time}`,
      lead.meeting_type && `Meeting: ${lead.meeting_type}`,
      `Email: ${lead.email}`,
      lead.phone && `Phone: ${lead.phone}`,
      lead.message && `\n${lead.message}`,
    ]
      .filter(Boolean)
      .join("\n"),
    add: lead.email,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

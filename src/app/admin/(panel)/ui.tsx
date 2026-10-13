import type { LeadStatus, LeadType } from "@/lib/types";

export function AdminHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export const leadStatuses: { value: LeadStatus; label: string; className: string }[] = [
  { value: "new", label: "New", className: "bg-blue-50 text-blue-700 ring-blue-200" },
  { value: "contacted", label: "Contacted", className: "bg-violet-50 text-violet-700 ring-violet-200" },
  { value: "qualified", label: "Qualified", className: "bg-amber-50 text-amber-800 ring-amber-200" },
  { value: "proposal", label: "Proposal sent", className: "bg-cyan-50 text-cyan-800 ring-cyan-200" },
  { value: "won", label: "Won", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { value: "lost", label: "Lost", className: "bg-slate-100 text-slate-600 ring-slate-200" },
  { value: "spam", label: "Spam", className: "bg-red-50 text-red-700 ring-red-200" },
];

export const leadTypes: { value: LeadType; label: string }[] = [
  { value: "quote", label: "Quote request" },
  { value: "contact", label: "Contact" },
  { value: "enquiry", label: "Service enquiry" },
  { value: "callback", label: "Callback" },
  { value: "newsletter", label: "Newsletter" },
];

export function StatusBadge({ status }: { status: LeadStatus }) {
  const s = leadStatuses.find((x) => x.value === status) ?? leadStatuses[0];
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${s.className}`}>
      {s.label}
    </span>
  );
}

export function Notice({ tone = "success", children }: { tone?: "success" | "error"; children: React.ReactNode }) {
  return (
    <p
      role="status"
      className={`rounded-lg px-4 py-2.5 text-sm ${
        tone === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
      }`}
    >
      {children}
    </p>
  );
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

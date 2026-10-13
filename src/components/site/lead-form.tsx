"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitLead, type LeadFormState } from "@/app/actions/leads";
import { trackConversion } from "@/components/analytics";

type Option = { value: string; label: string };
type LeadType = "contact" | "quote" | "enquiry" | "callback" | "newsletter" | "consultation";

/** Shared submit logic: attribution, spam timing and conversion tracking. */
function useLeadSubmit(type: LeadType) {
  const [state, action, pending] = useActionState<LeadFormState, FormData>(submitLead, { status: "idle" });
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (state.status === "success") trackConversion(type === "newsletter" ? "sign_up" : "generate_lead", { lead_type: type });
  }, [state.status, type]);

  // Attribution and spam-timing fields are read from the browser at submit time.
  const submit = (formData: FormData) => {
    const params = new URLSearchParams(window.location.search);
    let stored: Record<string, string> = {};
    try {
      stored = JSON.parse(sessionStorage.getItem("utm") ?? "{}");
    } catch {}
    const context: Record<string, string> = {
      type,
      utm_source: params.get("utm_source") ?? stored.utm_source ?? "",
      utm_medium: params.get("utm_medium") ?? stored.utm_medium ?? "",
      utm_campaign: params.get("utm_campaign") ?? stored.utm_campaign ?? "",
      // Elapsed time on the form, measured on one clock (client/server clocks can differ).
      elapsed_ms: String(startedAt.current ? Date.now() - startedAt.current : 0),
      source_page: window.location.pathname,
      referrer: document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : "",
    };
    for (const [key, value] of Object.entries(context)) formData.set(key, value);
    action(formData);
  };

  return { state, submit, pending, err: state.fieldErrors ?? {}, values: state.values ?? {} };
}

function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

function FormError({ state }: { state: LeadFormState }) {
  if (state.status !== "error" || !state.message) return null;
  return (
    <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
      {state.message}
    </p>
  );
}

function PrivacyNote() {
  return (
    <p className="text-xs text-slate-500">
      By submitting you agree to our{" "}
      <Link href="/privacy" className="underline">
        privacy policy
      </Link>
      .
    </p>
  );
}

// ---------------------------------------------------------------------------
// Contact, quote and service enquiry
// ---------------------------------------------------------------------------

export function LeadForm({
  type,
  services = [],
  budgets = [],
  timelines = [],
  organizationTypes = [],
  companySizes = [],
  industries = [],
  preselected,
  serviceSlug,
  compact = false,
}: {
  type: "contact" | "quote" | "enquiry";
  services?: Option[];
  budgets?: string[];
  timelines?: string[];
  organizationTypes?: string[];
  companySizes?: string[];
  industries?: string[];
  preselected?: string;
  /** For service-page enquiries: records which service the visitor asked about. */
  serviceSlug?: string;
  compact?: boolean;
}) {
  const { state, submit, pending, err, values } = useLeadSubmit(type);
  const id = useId();

  if (state.status === "success") {
    return (
      <div className={`card flex flex-col items-center text-center ${compact ? "px-5 py-8" : "px-6 py-14"}`} role="status">
        <CheckCircle2 className="size-12 text-emerald-500" />
        <h2 className="mt-4 text-xl font-semibold">Message received</h2>
        <p className="mt-2 max-w-md text-slate-600">{state.message}</p>
        {!compact && (
          <Link href="/services" className="btn-secondary mt-6">
            Keep exploring
          </Link>
        )}
      </div>
    );
  }

  const chosen = new Set(values.services ?? (preselected ? [preselected] : []));

  return (
    <form action={submit} className={`card space-y-5 ${compact ? "p-5" : "p-6 sm:p-8"}`} noValidate>
      <Honeypot />
      {serviceSlug && <input type="hidden" name="services" value={serviceSlug} />}

      <div className={`grid gap-5 ${compact ? "" : "sm:grid-cols-2"}`}>
        <Field id={id} label="Full name" name="name" defaultValue={values.name} error={err.name} required autoComplete="name" />
        <Field id={id} label="Work email" name="email" type="email" defaultValue={values.email} error={err.email} required autoComplete="email" />
        <Field id={id} label="Phone" name="phone" type="tel" defaultValue={values.phone} error={err.phone} autoComplete="tel" />
        {!compact && (
          <Field id={id} label="Company" name="company" defaultValue={values.company} error={err.company} autoComplete="organization" />
        )}
      </div>

      {(organizationTypes.length > 0 || companySizes.length > 0) && (
        <div className="grid gap-5 sm:grid-cols-2">
          {organizationTypes.length > 0 && (
            <Select id={id} label="Organisation type" name="organization_type" options={organizationTypes} defaultValue={values.organization_type} />
          )}
          {companySizes.length > 0 && (
            <Select id={id} label="Company size" name="company_size" options={companySizes} defaultValue={values.company_size} />
          )}
        </div>
      )}

      {type === "quote" && services.length > 0 && (
        <fieldset>
          <legend className="field-label">
            Services you&apos;re interested in <span className="text-red-600">*</span>
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {services.map((s) => (
              <label
                key={s.value}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2 text-sm transition has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50"
              >
                <input
                  type="checkbox"
                  name="services"
                  value={s.value}
                  defaultChecked={chosen.has(s.value)}
                  className="size-4 rounded border-slate-300 accent-brand-600"
                />
                {s.label}
              </label>
            ))}
          </div>
          {err.services && <p className="mt-1.5 text-sm text-red-600">{err.services}</p>}
        </fieldset>
      )}

      {type === "quote" && (
        <div className={`grid gap-5 ${industries.length > 0 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {industries.length > 0 && (
            <Select id={id} label="Industry" name="industry" options={industries} defaultValue={values.industry} />
          )}
          <Select id={id} label="Estimated budget" name="budget_range" options={budgets} defaultValue={values.budget_range} />
          <Select id={id} label="Timeline" name="timeline" options={timelines} defaultValue={values.timeline} />
        </div>
      )}

      <div>
        <label htmlFor={`${id}-message`} className="field-label">
          {type === "quote" ? "Project details / requirements" : "How can we help?"}
          {type !== "quote" && <span className="text-red-600"> *</span>}
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={compact ? 3 : 5}
          maxLength={5000}
          aria-invalid={Boolean(err.message)}
          defaultValue={values.message ?? ""}
          className="field"
          placeholder={
            type === "quote"
              ? "Goals, features, current systems, deadlines, links to examples or your RFP summary…"
              : "Tell us a little about your question or project"
          }
        />
        {err.message && <p className="mt-1.5 text-sm text-red-600">{err.message}</p>}
      </div>

      <FormError state={state} />

      <div className={`flex flex-col gap-4 ${compact ? "" : "sm:flex-row sm:items-center sm:justify-between"}`}>
        <PrivacyNote />
        <button type="submit" disabled={pending} className={`btn-primary px-6 ${compact ? "w-full" : ""}`}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {type === "quote" ? "Request my quote" : type === "enquiry" ? "Send enquiry" : "Send message"}
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Consultation booking
// ---------------------------------------------------------------------------

const timeSlots = ["Morning (9am–12pm)", "Afternoon (12pm–3pm)", "Late afternoon (3pm–6pm)"];
const meetingTypes = ["Video call", "Phone call", "In person"];

export function ConsultationForm({ services = [], preselected }: { services?: Option[]; preselected?: string }) {
  const { state, submit, pending, err, values } = useLeadSubmit("consultation");
  const id = useId();
  // Visitor's local "today", so the picker never offers past dates.
  const [today] = useState(() => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
  });

  if (state.status === "success") {
    return (
      <div className="card flex flex-col items-center px-6 py-14 text-center" role="status">
        <CheckCircle2 className="size-12 text-emerald-500" />
        <h2 className="mt-4 text-xl font-semibold">Consultation requested</h2>
        <p className="mt-2 max-w-md text-slate-600">{state.message}</p>
        <Link href="/services" className="btn-secondary mt-6">
          Keep exploring
        </Link>
      </div>
    );
  }

  return (
    <form action={submit} className="card space-y-5 p-6 sm:p-8" noValidate>
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={id} label="Full name" name="name" defaultValue={values.name} error={err.name} required autoComplete="name" />
        <Field id={id} label="Work email" name="email" type="email" defaultValue={values.email} error={err.email} required autoComplete="email" />
        <Field id={id} label="Phone" name="phone" type="tel" defaultValue={values.phone} error={err.phone} autoComplete="tel" />
        <Field id={id} label="Company" name="company" defaultValue={values.company} error={err.company} autoComplete="organization" />
      </div>

      {services.length > 0 && (
        <div>
          <label htmlFor={`${id}-services`} className="field-label">
            Topic
          </label>
          <select id={`${id}-services`} name="services" className="field" defaultValue={values.services?.[0] ?? preselected ?? ""}>
            <option value="">General consultation</option>
            {services.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor={`${id}-preferred_date`} className="field-label">
            Preferred date <span className="text-red-600">*</span>
          </label>
          <input
            id={`${id}-preferred_date`}
            name="preferred_date"
            type="date"
            min={today}
            required
            defaultValue={values.preferred_date ?? ""}
            aria-invalid={Boolean(err.preferred_date)}
            className={`field ${err.preferred_date ? "border-red-400" : ""}`}
          />
          {err.preferred_date && <p className="mt-1.5 text-sm text-red-600">{err.preferred_date}</p>}
        </div>
        <Select id={id} label="Preferred time" name="preferred_time" options={timeSlots} defaultValue={values.preferred_time} />
        <Select id={id} label="Meeting type" name="meeting_type" options={meetingTypes} defaultValue={values.meeting_type} />
      </div>

      <div>
        <label htmlFor={`${id}-message`} className="field-label">
          What would you like to discuss?
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={4}
          maxLength={5000}
          defaultValue={values.message ?? ""}
          className="field"
          placeholder="Your goals, current challenges or questions for our specialists"
        />
      </div>

      <FormError state={state} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PrivacyNote />
        <button type="submit" disabled={pending} className="btn-primary px-6">
          {pending && <Loader2 className="size-4 animate-spin" />} Book consultation
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Callback request
// ---------------------------------------------------------------------------

export function CallbackForm({ dark = false }: { dark?: boolean }) {
  const { state, submit, pending, err, values } = useLeadSubmit("callback");
  const id = useId();

  if (state.status === "success") {
    return (
      <p role="status" className={`flex items-center gap-2 text-sm ${dark ? "text-emerald-300" : "text-emerald-700"}`}>
        <CheckCircle2 className="size-5" /> {state.message}
      </p>
    );
  }

  return (
    <form action={submit} className="space-y-3" noValidate>
      <Honeypot />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className={`field-label ${dark ? "text-slate-200" : ""}`}>
            Name
          </label>
          <input id={`${id}-name`} name="name" autoComplete="name" defaultValue={values.name ?? ""} className="field" />
          {err.name && <p className="mt-1 text-xs text-red-500">{err.name}</p>}
        </div>
        <div>
          <label htmlFor={`${id}-phone`} className={`field-label ${dark ? "text-slate-200" : ""}`}>
            Phone
          </label>
          <input id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" defaultValue={values.phone ?? ""} className="field" />
          {err.phone && <p className="mt-1 text-xs text-red-500">{err.phone}</p>}
        </div>
      </div>
      <div>
        <label htmlFor={`${id}-email`} className={`field-label ${dark ? "text-slate-200" : ""}`}>
          Email
        </label>
        <input id={`${id}-email`} name="email" type="email" autoComplete="email" defaultValue={values.email ?? ""} className="field" />
        {err.email && <p className="mt-1 text-xs text-red-500">{err.email}</p>}
      </div>
      {state.status === "error" && !state.fieldErrors && <FormError state={state} />}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending && <Loader2 className="size-4 animate-spin" />} Request a callback
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Newsletter
// ---------------------------------------------------------------------------

export function NewsletterForm() {
  const { state, submit, pending, err } = useLeadSubmit("newsletter");
  const id = useId();

  if (state.status === "success") {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-emerald-300">
        <CheckCircle2 className="size-4" /> {state.message}
      </p>
    );
  }

  return (
    <form action={submit} className="space-y-2" noValidate>
      <Honeypot />
      <label htmlFor={`${id}-email`} className="sr-only">
        Email address
      </label>
      <div className="flex gap-2">
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          className="field min-w-0 border-white/15 bg-white/5 text-white placeholder:text-slate-500"
        />
        <button type="submit" disabled={pending} className="btn-primary shrink-0">
          {pending ? <Loader2 className="size-4 animate-spin" /> : "Subscribe"}
        </button>
      </div>
      {err.email && <p className="text-xs text-red-400">{err.email}</p>}
    </form>
  );
}

function Field({
  id,
  label,
  name,
  error,
  required,
  type = "text",
  autoComplete,
  defaultValue,
}: {
  id: string;
  label: string;
  name: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={`${id}-${name}`} className="field-label">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      <input
        id={`${id}-${name}`}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue ?? ""}
        aria-invalid={Boolean(error)}
        className={`field ${error ? "border-red-400" : ""}`}
      />
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function Select({
  id,
  label,
  name,
  options,
  defaultValue,
}: {
  id: string;
  label: string;
  name: string;
  options: string[];
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={`${id}-${name}`} className="field-label">
        {label}
      </label>
      <select id={`${id}-${name}`} name={name} className="field" defaultValue={defaultValue ?? ""}>
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { addLeadNote, deleteLead, deleteLeadNote, updateLead, type FormState } from "../../../actions";
import type { Lead } from "@/lib/types";
import { leadStatuses } from "../../ui";

export function LeadUpdateForm({
  lead,
  staffId,
  assignees,
  canAssign,
}: {
  lead: Lead;
  staffId: string;
  /** Full team list for managers; null for roles that can only claim leads. */
  assignees: { id: string; label: string }[] | null;
  canAssign: boolean;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateLead.bind(null, lead.id), {});
  const assignedToMe = lead.assigned_to === staffId;
  const ownerKnown = !lead.assigned_to || assignedToMe || assignees?.some((a) => a.id === lead.assigned_to);

  return (
    <form action={action} className="mt-4 space-y-4">
      <div>
        <label htmlFor="status" className="field-label">
          Status
        </label>
        <select id="status" name="status" defaultValue={lead.status} className="field">
          {leadStatuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="estimated_value" className="field-label">
          Estimated value
        </label>
        <input
          id="estimated_value"
          name="estimated_value"
          inputMode="decimal"
          defaultValue={lead.estimated_value ?? ""}
          placeholder="e.g. 5000"
          className="field"
        />
      </div>
      {canAssign ? (
        <div>
          <label htmlFor="assigned_to" className="field-label">
            Owner
          </label>
          <select id="assigned_to" name="assigned_to" defaultValue={lead.assigned_to ?? ""} className="field">
            <option value="">Unassigned</option>
            <option value={staffId}>Me</option>
            {assignees
              ?.filter((a) => a.id !== staffId)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            {!ownerKnown && <option value={lead.assigned_to!}>Another team member</option>}
          </select>
        </div>
      ) : (
        <input type="hidden" name="assigned_to" value={lead.assigned_to ?? ""} />
      )}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && !pending && <p className="text-sm text-emerald-700">Saved.</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending && <Loader2 className="size-4 animate-spin" />} Save changes
      </button>
    </form>
  );
}

export function NoteForm({ leadId }: { leadId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addLeadNote.bind(null, leadId), {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="mt-4 space-y-2">
      <label htmlFor="note" className="sr-only">
        Add a note
      </label>
      <textarea id="note" name="body" rows={3} maxLength={5000} placeholder="Called the client, sent proposal…" className="field" />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-secondary">
        {pending && <Loader2 className="size-4 animate-spin" />} Add note
      </button>
    </form>
  );
}

export function DeleteNoteButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => deleteLeadNote(id))}
      className="text-slate-400 hover:text-red-600"
      aria-label="Delete note"
    >
      <Trash2 className="size-3.5" />
    </button>
  );
}

export function DeleteLeadButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem("confirm") as HTMLInputElement;
        if (input.value.trim().toLowerCase() === "delete") start(() => deleteLead(id));
      }}
      className="mt-4 space-y-2"
    >
      <label htmlFor="confirm" className="text-xs text-slate-500">
        Type <strong>delete</strong> to confirm
      </label>
      <input id="confirm" name="confirm" autoComplete="off" className="field" />
      <button type="submit" disabled={pending} className="btn-danger w-full">
        <Trash2 className="size-4" /> Delete lead
      </button>
    </form>
  );
}

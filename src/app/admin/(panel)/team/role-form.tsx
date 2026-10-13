"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { roleLabels, staffRoles } from "@/lib/roles";
import { setUserRole, type FormState } from "../../actions";

export function RoleForm({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(setUserRole, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  // Only super admins may grant administrator roles (enforced again in the database).
  const grantable = staffRoles.filter((r) => isSuperAdmin || (r !== "super_admin" && r !== "admin"));

  return (
    <form ref={ref} action={action} className="mt-4 space-y-4">
      <div>
        <label htmlFor="role-email" className="field-label">
          Account email
        </label>
        <input id="role-email" name="email" type="email" required className="field" />
      </div>
      <div>
        <label htmlFor="role" className="field-label">
          Role
        </label>
        <select id="role" name="role" defaultValue="sales_rep" className="field">
          {grantable.map((r) => (
            <option key={r} value={r}>
              {roleLabels[r]}
            </option>
          ))}
          <option value="customer">{roleLabels.customer}</option>
          <option value="none">Remove access</option>
        </select>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && !pending && <p className="text-sm text-emerald-700">Role updated.</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending && <Loader2 className="size-4 animate-spin" />} Save role
      </button>
    </form>
  );
}

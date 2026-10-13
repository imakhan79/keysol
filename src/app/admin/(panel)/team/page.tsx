import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth";
import { roleLabels, type StaffRole } from "@/lib/roles";
import { createSessionClient } from "@/lib/supabase/server";
import { AdminHeader, formatDateTime } from "../ui";
import { RoleForm } from "./role-form";

export const metadata: Metadata = { title: "Staff & roles" };

const roleDescriptions: Record<StaffRole, string> = {
  super_admin: "Everything, including managing administrators",
  admin: "Everything except managing super admins and admins",
  sales_manager: "All leads, assignment to reps, export, dashboard",
  sales_rep: "Leads assigned to them plus unassigned leads they can claim",
  marketing_manager: "Marketing content, media, analytics, read-only leads",
  content_manager: "All content, pages, team profiles, media, site settings",
  support_staff: "Contact enquiries and callback requests",
};

export default async function TeamPage() {
  const staff = await requireStaff("team");
  const supabase = await createSessionClient();
  const { data, error } = await supabase.rpc("list_staff");
  if (error) throw new Error(error.message);
  const members = (data ?? []) as { id: string; email: string; role: StaffRole; last_sign_in_at: string | null }[];

  return (
    <>
      <AdminHeader title="Staff & roles" description="Grant admin-panel access to people who already have an account" />
      <div className="grid gap-6 p-4 sm:p-8 xl:grid-cols-[1fr_380px]">
        <section className="card overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Last sign-in</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3 font-medium">
                    {m.email}
                    {m.id === staff.id && <span className="ml-2 text-xs text-slate-400">(you)</span>}
                  </td>
                  <td className="px-4 py-3">{roleLabels[m.role] ?? m.role}</td>
                  <td className="px-4 py-3 text-slate-500">{m.last_sign_in_at ? formatDateTime(m.last_sign_in_at) : "Never"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <aside className="space-y-6">
          <section className="card p-6">
            <h2 className="font-semibold">Grant or change a role</h2>
            <p className="mt-1 text-sm text-slate-500">
              Create the person&apos;s account first in Supabase → Authentication → Add user, then assign a role here. Changes
              apply the next time they sign in.
            </p>
            <RoleForm isSuperAdmin={staff.role === "super_admin"} />
          </section>
          <section className="card p-6">
            <h2 className="font-semibold">Roles</h2>
            <dl className="mt-3 space-y-3 text-sm">
              {(Object.keys(roleDescriptions) as StaffRole[]).map((r) => (
                <div key={r}>
                  <dt className="font-medium text-slate-900">{roleLabels[r]}</dt>
                  <dd className="text-slate-500">{roleDescriptions[r]}</dd>
                </div>
              ))}
              <div>
                <dt className="font-medium text-slate-900">Visitor / Customer</dt>
                <dd className="text-slate-500">Public website and forms only; no admin access</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </>
  );
}
